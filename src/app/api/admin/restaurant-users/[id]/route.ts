import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { contentBackofficeAvailable, isSuperAdmin } from "@/lib/admin-access";
import { deleteStaffAccount, issueRestaurantInvite, revokeRestaurantStaff, setRestaurantStaffPassword, updateStaffSections } from "@/lib/restaurant-admin/store";
import { parseAdminSections } from "@/lib/restaurant-admin/policy";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request, context: Context) {
  if (!(await isSuperAdmin())) return reply({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return reply({ error: "Compte invalide." }, 400);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Format invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request, 4096);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  try {
    if (body.data.action === "revoke") {
      return await revokeRestaurantStaff(id) ? reply({ ok: true }) : reply({ error: "Compte introuvable." }, 404);
    }
    if (body.data.action === "invite") {
      const token = await issueRestaurantInvite(id);
      return reply({ activationPath: `/admin/restaurant/activer?token=${token}` });
    }
    if (body.data.action === "password") {
      const password = body.data.password;
      const confirmation = body.data.confirmation;
      if (typeof password !== "string" || typeof confirmation !== "string" ||
          password.length < 13 || password.length > 256 || password !== confirmation) {
        return reply({ error: "Saisissez deux mots de passe identiques d’au moins 13 caractères." }, 400);
      }
      const rate = await consumeRateLimit({ namespace: "admin-staff-password", identifier: `${id}:${parseClientIpFromHeaders(request.headers)}`, limit: 5, windowMs: 10 * 60_000 });
      if (!rate.allowed) return reply({ error: rate.unavailable ? "Modification momentanément indisponible." : "Trop de tentatives. Réessayez plus tard." }, rate.unavailable ? 503 : 429);
      const result = await setRestaurantStaffPassword(id, password);
      return result === "updated" ? reply({ ok: true }) : reply({ error: "Compte introuvable." }, 404);
    }
    if (body.data.action === "sections") {
      const sections = parseAdminSections(body.data.sections);
      if (!sections) return reply({ error: "Droits invalides." }, 400);
      if (!contentBackofficeAvailable() && sections.some(section => section === "pages" || section === "media")) return reply({ error: "Les pages et médias nécessitent un stockage persistant sur cet hébergement." }, 409);
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
