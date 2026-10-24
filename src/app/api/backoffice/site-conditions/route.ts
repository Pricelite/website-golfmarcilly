import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { currentActor } from "@/lib/backoffice/auth";
import { openDb } from "@/lib/backoffice/db";
import { hasTrustedOrigin } from "@/lib/security/request-guards";
import { parseConditionInput, parseConditionItem, parseConditionState } from "@/lib/site-conditions";
import { listConditionStates, listSiteConditions, saveConditionItem, saveConditionState, saveSiteCondition } from "@/lib/site-conditions-store";

export const runtime = "nodejs";
const response = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });

async function authorized() {
  const db = openDb();
  try { return (await currentActor(db))?.role === "admin"; }
  finally { db.close(); }
}

export async function PUT(request: Request) {
  if (!(await authorized())) return response({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format invalide." }, 415);
  const body = await readJsonBody(request, 4096);
  if (!body.ok) return response({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  try {
    const [items, states] = await Promise.all([listSiteConditions(), listConditionStates()]);
    const parsed = parseConditionInput(body.data, items.map(item => item.id), states);
    if (!parsed.ok) return response({ error: parsed.error }, 400);
    const condition = await saveSiteCondition(parsed.condition);
    revalidatePath("/");
    return response({ condition });
  } catch { return response({ error: "Enregistrement impossible. Réessayez." }, 503); }
}

export async function POST(request: Request) {
  if (!(await authorized())) return response({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format invalide." }, 415);
  const body = await readJsonBody(request, 4096);
  if (!body.ok) return response({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  const value = body.data as Record<string, unknown> | null;
  if (!value || typeof value !== "object" || Array.isArray(value)) return response({ error: "Demande invalide." }, 400);
  try {
    if (value.kind === "item-create" || value.kind === "item-update") {
      const parsed = parseConditionItem(value);
      if (!parsed.ok) return response({ error: parsed.error }, 400);
      const exists = (await listSiteConditions()).some(item => item.id === parsed.item.id);
      if (value.kind === "item-create" && exists) return response({ error: "Cet identifiant existe déjà." }, 409);
      if (value.kind === "item-update" && !exists) return response({ error: "Équipement inconnu." }, 404);
      const condition = await saveConditionItem(parsed.item);
      revalidatePath("/");
      return response({ condition }, value.kind === "item-create" ? 201 : 200);
    }
    if (value.kind === "state") {
      const parsed = parseConditionState(value);
      if (!parsed.ok) return response({ error: parsed.error }, 400);
      if ((await listConditionStates()).some(state => state.id === parsed.state.id)) return response({ error: "Cet état existe déjà." }, 409);
      await saveConditionState(parsed.state);
      return response({ state: parsed.state }, 201);
    }
    return response({ error: "Type de demande invalide." }, 400);
  } catch { return response({ error: "Enregistrement impossible. Vérifiez la configuration, puis réessayez." }, 503); }
}
