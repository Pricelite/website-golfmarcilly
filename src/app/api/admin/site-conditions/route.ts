import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { hasTrustedOrigin } from "@/lib/security/request-guards";
import { parseConditionInput } from "@/lib/site-conditions";
import { listSiteConditions, saveSiteCondition } from "@/lib/site-conditions-store";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const response = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée. Rechargez la page." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format de demande invalide." }, 415);
  const body = await readJsonBody(request);
  if (!body.ok) return response({ error: body.tooLarge ? "Demande trop volumineuse." : "Demande invalide." }, body.tooLarge ? 413 : 400);
  let ids: string[];
  try { ids = (await listSiteConditions()).map(item => item.id); }
  catch { return response({ error: "États indisponibles." }, 503); }
  const parsed = parseConditionInput(body.data, ids);
  if (!parsed.ok) return response({ error: parsed.error }, 400);
  try {
    const condition = await saveSiteCondition(parsed.condition);
    revalidatePath("/");
    return response({ condition });
  } catch { return response({ error: "Enregistrement impossible. Vérifiez la configuration des états du golf, puis réessayez." }, 503); }
}
