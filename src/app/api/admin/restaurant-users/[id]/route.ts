import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { isSuperAdmin } from "@/lib/admin-access";
import { deleteStaffAccount, issueRestaurantInvite, revokeRestaurantStaff, updateStaffSections } from "@/lib/restaurant-admin/store";
import { parseAdminSections } from "@/lib/restaurant-admin/policy";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request, context: Context) {
  if (!(await isSuperAdmin())) return reply({ error: "Accès refusé." }, 403);
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
    if (body.data.action === "sections") {
      const sections = parseAdminSections(body.data.sections);
      if (!sections) return reply({ error: "Droits invalides." }, 400);
      return await updateStaffSections(id, sections) ? reply({ ok: true }) : reply({ error: "Compte introuvable." }, 404);
    }
    return reply({ error: "Action inconnue." }, 400);
  } catch { return reply({ error: "Modification du compte impossible." }, 503); }
}

export async function DELETE(request: Request, context: Context) {
  if (!(await isSuperAdmin())) return reply({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return reply({ error: "Compte invalide." }, 400);
  try { return await deleteStaffAccount(id) ? reply({ ok: true }) : reply({ error: "Compte introuvable." }, 404); }
  catch { return reply({ error: "Suppression du compte impossible." }, 503); }
}
