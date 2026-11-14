import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { changeOwnRestaurantPassword, currentRestaurantActor, RESTAURANT_SESSION_COOKIE } from "@/lib/restaurant-admin/store";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const actor = await currentRestaurantActor().catch(() => null);
  if (!actor) return reply({ error: "Connexion requise." }, 401);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  const rate = await consumeRateLimit({ namespace: "staff-own-password", identifier: `${actor.id}:${parseClientIpFromHeaders(request.headers)}`, limit: 5, windowMs: 10 * 60_000 });
  if (!rate.allowed) return reply({ error: rate.unavailable ? "Service momentanément indisponible." : "Trop de tentatives. Réessayez plus tard." }, rate.unavailable ? 503 : 429);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Format invalide." }, 415);
  const body = await readJsonBody<Record<string, unknown>>(request, 2048);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  const { currentPassword, newPassword, confirmation } = body.data;
  if (typeof currentPassword !== "string" || !currentPassword || currentPassword.length > 256 ||
      typeof newPassword !== "string" || newPassword.length < 13 || newPassword.length > 256 ||
      newPassword === currentPassword || newPassword !== confirmation) {
    return reply({ error: "Saisissez votre mot de passe actuel et un nouveau mot de passe différent d’au moins 13 caractères, confirmé à l’identique." }, 400);
  }
  try {
    if (await changeOwnRestaurantPassword(actor.id, currentPassword, newPassword) !== "updated") return reply({ error: "Mot de passe actuel incorrect." }, 400);
    const response = reply({ ok: true });
    response.cookies.delete(RESTAURANT_SESSION_COOKIE);
    return response;
  } catch { return reply({ error: "Modification momentanément impossible." }, 503); }
}
