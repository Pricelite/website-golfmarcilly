import "server-only";

import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { conditionItems, emptyConditions, previewConditions, type SiteCondition } from "@/data/site-conditions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ConditionInput } from "./site-conditions";

type ConditionRow = { id: string; status: SiteCondition["status"]; reason: string | null; updated_at: string };
const localFile = join(process.cwd(), ".local-site-conditions.json");
let pendingWrite: Promise<unknown> = Promise.resolve();

function normalize(rows: ConditionRow[]): SiteCondition[] {
  const byId = new Map(rows.map(row => [row.id, row]));
  return conditionItems.map(item => {
    const row = byId.get(item.id);
    return row ? { id: item.id, status: row.status, reason: row.reason, updatedAt: row.updated_at } :
      { id: item.id, status: "unknown", reason: null, updatedAt: null };
  });
}

async function readLocal(): Promise<SiteCondition[]> {
  try {
    const rows: unknown = JSON.parse(await readFile(localFile, "utf8"));
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== "object" ||
      typeof row.id !== "string" || !["open", "closed", "unknown"].includes(row.status) ||
      (row.reason !== null && typeof row.reason !== "string") || typeof row.updated_at !== "string" ||
      (row.updated_at !== "" && Number.isNaN(Date.parse(row.updated_at))))) {
      throw new Error("Invalid local site conditions");
    }
    return normalize(rows as ConditionRow[]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyConditions();
    throw error;
  }
}

export async function listSiteConditions(): Promise<SiteCondition[]> {
  if (process.env.PREVIEW_MODE === "true") return previewConditions();
  if (process.env.NODE_ENV === "development") return readLocal();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Site conditions store unavailable");
  const { data, error } = await createSupabaseAdminClient().from("site_conditions")
    .select("id,status,reason,updated_at").limit(conditionItems.length)
    .abortSignal(AbortSignal.timeout(2500));
  if (error) throw error;
  return normalize((data ?? []) as ConditionRow[]);
}

export async function saveSiteCondition(input: ConditionInput): Promise<SiteCondition> {
  const updatedAt = new Date().toISOString();
  const row: ConditionRow = { id: input.id, status: input.status, reason: input.reason, updated_at: updatedAt };
  if (process.env.NODE_ENV === "development") {
    const operation = pendingWrite.then(async () => {
      const rows = await readLocal();
      const next = rows.map(item => item.id === input.id ? { id: item.id, status: input.status, reason: input.reason, updatedAt } : item);
      const temporary = `${localFile}.${process.pid}.tmp`;
      await writeFile(temporary, `${JSON.stringify(next.map(item => ({ id: item.id, status: item.status, reason: item.reason, updated_at: item.updatedAt ?? "" })), null, 2)}\n`, "utf8");
      await rename(temporary, localFile);
      return next.find(item => item.id === input.id)!;
    });
    pendingWrite = operation.catch(() => {});
    return operation;
  }
  const { data, error } = await createSupabaseAdminClient().from("site_conditions")
    .upsert(row, { onConflict: "id" }).select("id,status,reason,updated_at").single();
  if (error) throw error;
  return normalize([data as ConditionRow]).find(item => item.id === input.id)!;
}
