import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { contentBackofficeAvailable, isSuperAdmin } from "@/lib/admin-access";
import { createRestaurantStaff, listRestaurantStaff } from "@/lib/restaurant-admin/store";
import { parseAdminSections, RESTAURANT_ID } from "@/lib/restaurant-admin/policy";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  if (!(await isSuperAdmin())) return reply({ error: "Accès refusé." }, 403);
  try { return reply({ users: await listRestaurantStaff() }); }
  catch { return reply({ error: "Comptes momentanément indisponibles." }, 503); }
}

export async function POST(request: Request) {
  if (!(await isSuperAdmin())) return reply({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Format invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request, 2048);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  const { name, email, username, restaurantId } = body.data;
  const sections = parseAdminSections(body.data.sections ?? ["restaurant"]);
  const normalizedEmail = typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
  const normalizedUsername = typeof username === "string" && username.trim() ? username.trim().toLowerCase() : null;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
      (email != null && typeof email !== "string") ||
      (username != null && typeof username !== "string") ||
      !normalizedUsername ||
      (normalizedEmail !== null && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254)) ||
      (normalizedUsername !== null && !/^[a-z][a-z0-9._-]{2,49}$/.test(normalizedUsername)) ||
      !sections || restaurantId !== RESTAURANT_ID) return reply({ error: "Compte, droits ou restaurant invalides." }, 400);
  if (!contentBackofficeAvailable() && sections.some(section => section === "pages" || section === "media")) return reply({ error: "Les pages et médias nécessitent un stockage persistant sur cet hébergement." }, 409);
  try {
    const result = await createRestaurantStaff(name, normalizedEmail, normalizedUsername, sections);
    return reply({ id: result.id, activationPath: `/admin/restaurant/activer?token=${result.token}` }, 201);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") return reply({ error: "Cet identifiant ou cette adresse possède déjà un compte." }, 409);
    return reply({ error: "Création du compte impossible." }, 503);
  }
}
