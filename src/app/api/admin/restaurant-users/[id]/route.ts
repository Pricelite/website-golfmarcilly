import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { issueRestaurantInvite, revokeRestaurantStaff } from "@/lib/restaurant-admin/store";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request, context: Context) {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) return reply({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return reply({ error: "Compte invalide." }, 400);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Format invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request, 1024);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  try {
    if (body.data.action === "revoke") {
      return await revokeRestaurantStaff(id) ? reply({ ok: true }) : reply({ error: "Compte introuvable." }, 404);
    }
    if (body.data.action === "invite") {
      const token = await issueRestaurantInvite(id);
      return reply({ activationPath: `/admin/restaurant/activer?token=${token}` });
    }
    return reply({ error: "Action inconnue." }, 400);
  } catch { return reply({ error: "Modification du compte impossible." }, 503); }
}
