import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { canAccessAdmin } from "@/lib/admin-access";
import { hasTrustedOrigin } from "@/lib/security/request-guards";
import { parseConditionInput } from "@/lib/site-conditions";
import { listConditionStates, listSiteConditions, saveSiteCondition } from "@/lib/site-conditions-store";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const response = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (!(await canAccessAdmin("site_conditions"))) return response({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée. Rechargez la page." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format de demande invalide." }, 415);
  const body = await readJsonBody(request);
  if (!body.ok) return response({ error: body.tooLarge ? "Demande trop volumineuse." : "Demande invalide." }, body.tooLarge ? 413 : 400);
  let ids: string[];
  let states: Awaited<ReturnType<typeof listConditionStates>>;
  try { [ids, states] = await Promise.all([listSiteConditions().then(items => items.map(item => item.id)), listConditionStates()]); }
  catch { return response({ error: "États indisponibles." }, 503); }
  const parsed = parseConditionInput(body.data, ids, states);
  if (!parsed.ok) return response({ error: parsed.error }, 400);
  try {
    const condition = await saveSiteCondition(parsed.condition);
    revalidatePath("/");
    return response({ condition });
  } catch { return response({ error: "Enregistrement impossible. Vérifiez la configuration des états du golf, puis réessayez." }, 503); }
}
