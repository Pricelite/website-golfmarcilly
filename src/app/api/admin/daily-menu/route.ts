import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { readJsonBody } from "@/lib/api/request-body";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { deleteDailyMenu, getDailyMenu, saveDailyMenu } from "@/lib/restaurant/daily-menu-store";
import { parseDailyMenu, validDailyMenuDate } from "@/lib/restaurant/daily-menu-validation";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function authorized() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim()) && isAdminAuthenticated(await cookies());
}

export async function GET(request: Request) {
  if (!(await authorized())) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
  const date = new URL(request.url).searchParams.get("date");
  if (!validDailyMenuDate(date)) return response({ error: "Date invalide." }, 400);
  try { return response({ menu: await getDailyMenu(date) }); }
  catch { return response({ error: "Carte du jour momentanément indisponible." }, 503); }
}

async function mutate(request: Request) {
  if (!(await authorized())) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée. Rechargez la page." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format de demande invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!body.ok) return response({ error: body.tooLarge ? "Demande trop volumineuse." : "Demande invalide." }, body.tooLarge ? 413 : 400);

  if (request.method === "DELETE") {
    const date = body.data.date;
    if (!validDailyMenuDate(date)) return response({ error: "Date invalide." }, 400);
    try { return response({ deleted: await deleteDailyMenu(date) }); }
    catch { return response({ error: "Suppression impossible. Réessayez." }, 503); }
  }

  const parsed = parseDailyMenu(body.data);
  if (!parsed.ok) return response({ error: parsed.error }, 400);
  try { return response({ menu: await saveDailyMenu(parsed.menu) }); }
  catch { return response({ error: "Enregistrement impossible. Vérifiez la configuration de la carte du jour, puis réessayez." }, 503); }
}

export const PUT = mutate;
export const DELETE = mutate;
