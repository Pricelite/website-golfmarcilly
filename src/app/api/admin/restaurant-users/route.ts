import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { createRestaurantStaff, listRestaurantStaff } from "@/lib/restaurant-admin/store";
import { RESTAURANT_ID } from "@/lib/restaurant-admin/policy";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function superAdmin() { return Boolean(process.env.ADMIN_PASSWORD?.trim()) && isAdminAuthenticated(await cookies()); }

export async function GET() {
  if (!(await superAdmin())) return reply({ error: "Accès refusé." }, 403);
  try { return reply({ users: await listRestaurantStaff() }); }
  catch { return reply({ error: "Comptes momentanément indisponibles." }, 503); }
}

export async function POST(request: Request) {
  if (!(await superAdmin())) return reply({ error: "Accès refusé." }, 403);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Format invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request, 2048);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  const { name, email, restaurantId } = body.data;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      restaurantId !== RESTAURANT_ID) return reply({ error: "Compte ou restaurant invalide." }, 400);
  try {
    const result = await createRestaurantStaff(name, email);
    return reply({ id: result.id, activationPath: `/admin/restaurant/activer?token=${result.token}` }, 201);
  } catch (error) {
    if (String(error).includes("23505") || String(error).includes("duplicate key")) return reply({ error: "Cette adresse possède déjà un compte." }, 409);
    return reply({ error: "Création du compte impossible." }, 503);
  }
}
