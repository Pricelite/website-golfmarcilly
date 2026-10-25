import "server-only";

import { readFile, rename, writeFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { defaultStates, emptyConditions, previewConditions, type ConditionState, type SiteCondition } from "@/data/site-conditions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isCarotteReason, type ConditionInput, type ConditionItemInput } from "./site-conditions";

type ConditionRow = {
  id: string; status: SiteCondition["status"]; state_label: string | null; reason: string | null; updated_at: string;
  label: string | null; item_group: SiteCondition["group"] | null; href: string | null; position: number | null;
};
const configuredLocalFile = process.env.SITE_CONDITIONS_LOCAL_PATH?.trim();
if (configuredLocalFile && !isAbsolute(configuredLocalFile)) throw new Error("SITE_CONDITIONS_LOCAL_PATH must be absolute");
const localFile = configuredLocalFile || join(process.cwd(), ".local-site-conditions.json");
const localStatesFile = configuredLocalFile ? `${localFile}.states.json` : join(process.cwd(), ".local-site-condition-states.json");
let pendingWrite: Promise<unknown> = Promise.resolve();

function normalize(rows: ConditionRow[]): SiteCondition[] {
  const defaults = new Map(emptyConditions().map(item => [item.id, item]));
  const result = [...defaults.values()];
  for (const row of rows) {
    const existing = defaults.get(row.id);
    if (!existing && (!row.label || !row.item_group || !row.href)) continue;
    const value: SiteCondition = {
      id: row.id, label: row.label || existing?.label || row.id,
      group: row.item_group || existing?.group || "courses", href: row.href || existing?.href || "/golf",
      position: row.position ?? existing?.position ?? result.length,
      status: row.status, stateLabel: row.state_label ?? (row.status === "open" && isCarotteReason(row.reason) ? "Carotté" : null),
      reason: row.status === "open" && isCarotteReason(row.reason) ? null : row.reason, updatedAt: row.updated_at || null,
    };
    const index = result.findIndex(item => item.id === row.id);
    if (index < 0) result.push(value); else result[index] = value;
  }
  return result.sort((a, b) => a.position - b.position || a.label.localeCompare(b.label, "fr"));
}

async function readLocal(): Promise<SiteCondition[]> {
  try {
    const rows: unknown = JSON.parse(await readFile(localFile, "utf8"));
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== "object" ||
      typeof row.id !== "string" || !["open", "closed", "unknown"].includes(row.status) ||
      (row.reason !== null && typeof row.reason !== "string") || typeof row.updated_at !== "string" ||
      (row.updated_at !== "" && Number.isNaN(Date.parse(row.updated_at))))) throw new Error("Invalid local site conditions");
    return normalize(rows as ConditionRow[]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyConditions();
    throw error;
  }
}

async function writeLocal(conditions: SiteCondition[]) {
  const rows = conditions.map(item => ({
    id: item.id, label: item.label, item_group: item.group, href: item.href, position: item.position,
    status: item.status, state_label: item.stateLabel, reason: item.reason, updated_at: item.updatedAt ?? "",
  }));
  const temporary = `${localFile}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await rename(temporary, localFile);
}

export async function listSiteConditions(): Promise<SiteCondition[]> {
  if (process.env.PREVIEW_MODE === "true") return previewConditions();
  if (process.env.NODE_ENV === "development") return readLocal();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Site conditions store unavailable");
  const { data, error } = await createSupabaseAdminClient().from("site_conditions")
    .select("id,status,state_label,reason,updated_at,label,item_group,href,position").limit(100)
    .abortSignal(AbortSignal.timeout(2500));
  if (error) throw error;
  return normalize((data ?? []) as ConditionRow[]);
}

export async function listConditionStates(): Promise<ConditionState[]> {
  if (process.env.NODE_ENV === "development") {
    try {
      const value: unknown = JSON.parse(await readFile(localStatesFile, "utf8"));
      if (!Array.isArray(value) || !value.every(item => item && typeof item.id === "string" && typeof item.label === "string" &&
        ["open", "closed", "unknown"].includes(item.status))) throw new Error("Invalid local condition states");
      return [...defaultStates, ...(value as ConditionState[]).filter(item => !defaultStates.some(base => base.id === item.id))];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaultStates;
      throw error;
    }
  }
  const { data, error } = await createSupabaseAdminClient().from("site_condition_states").select("id,label,status").limit(100);
  if (error) throw error;
  return [...defaultStates, ...((data ?? []) as ConditionState[]).filter(item => !defaultStates.some(base => base.id === item.id))];
}

export async function saveSiteCondition(input: ConditionInput): Promise<SiteCondition> {
  const updatedAt = new Date().toISOString();
  if (process.env.NODE_ENV === "development") {
    const operation = pendingWrite.then(async () => {
      const rows = await readLocal();
      const next = rows.map(item => item.id === input.id ? { ...item, status: input.status, stateLabel: input.stateLabel, reason: input.reason, updatedAt } : item);
      await writeLocal(next);
      return next.find(item => item.id === input.id)!;
    });
    pendingWrite = operation.catch(() => {});
    return operation;
  }
  const item = (await listSiteConditions()).find(value => value.id === input.id);
  if (!item) throw new Error("Unknown condition item");
  const { data, error } = await createSupabaseAdminClient().from("site_conditions")
    .upsert({ id: input.id, label: item.label, item_group: item.group, href: item.href, position: item.position,
      status: input.status, state_label: input.stateLabel, reason: input.reason, updated_at: updatedAt }, { onConflict: "id" })
    .select("id,status,state_label,reason,updated_at,label,item_group,href,position").single();
  if (error) throw error;
  return normalize([data as ConditionRow]).find(item => item.id === input.id)!;
}

export async function saveConditionItem(item: ConditionItemInput): Promise<SiteCondition> {
  const current = await listSiteConditions();
  if (current.length >= 100 && !current.some(existing => existing.id === item.id)) throw new Error("Too many condition items");
  const existing = current.find(value => value.id === item.id);
  if (process.env.NODE_ENV === "development") {
    const operation = pendingWrite.then(async () => {
      const rows = await readLocal();
      const value = rows.find(row => row.id === item.id);
      const next: SiteCondition[] = value
        ? rows.map(row => row.id === item.id ? { ...row, ...item } : row)
        : [...rows, { ...item, position: rows.length, status: "unknown", stateLabel: null, reason: null, updatedAt: null }];
      await writeLocal(next);
      return next.find(row => row.id === item.id)!;
    });
    pendingWrite = operation.catch(() => {});
    return operation;
  }
  const { data, error } = await createSupabaseAdminClient().from("site_conditions")
    .upsert({ id: item.id, label: item.label, item_group: item.group, href: item.href,
      position: existing?.position ?? current.length, status: existing?.status ?? "unknown",
      state_label: existing?.stateLabel ?? null, reason: existing?.reason ?? null }, { onConflict: "id" })
    .select("id,status,state_label,reason,updated_at,label,item_group,href,position").single();
  if (error) throw error;
  return normalize([data as ConditionRow]).find(row => row.id === item.id)!;
}

export async function saveConditionState(state: ConditionState): Promise<void> {
  const states = await listConditionStates();
  if (states.some(item => item.id === state.id)) throw new Error("Duplicate condition state");
  if (states.length >= 100) throw new Error("Too many condition states");
  if (process.env.NODE_ENV === "development") {
    const operation = pendingWrite.then(async () => {
      const existing = (await listConditionStates()).filter(item => !defaultStates.some(base => base.id === item.id));
      const temporary = `${localStatesFile}.${process.pid}.tmp`;
      await writeFile(temporary, `${JSON.stringify([...existing, state], null, 2)}\n`, "utf8");
      await rename(temporary, localStatesFile);
    });
    pendingWrite = operation.catch(() => {});
    return operation;
  }
  const { error } = await createSupabaseAdminClient().from("site_condition_states").insert(state);
  if (error) throw error;
}
