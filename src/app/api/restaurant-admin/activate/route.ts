import { NextResponse } from "next/server";
import { readLimitedTextBody } from "@/lib/api/request-body";
import { activateRestaurantStaff } from "@/lib/restaurant-admin/store";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return reply({ error: "Origine non autorisée." }, 403);
  const rate = await consumeRateLimit({ namespace: "restaurant-admin-activate", identifier: parseClientIpFromHeaders(request.headers), limit: 10, windowMs: 10 * 60_000 });
  if (!rate.allowed) return reply({ error: "Trop de tentatives. Réessayez plus tard." }, 429);
  if (!request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) return reply({ error: "Format invalide." }, 415);
  const body = await readLimitedTextBody(request, 2048);
  if (!body.ok) return reply({ error: "Demande invalide." }, body.tooLarge ? 413 : 400);
  const fields = new URLSearchParams(body.text);
  const token = fields.get("token") ?? "";
  const password = fields.get("password") ?? "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token) || password.length < 13 || password.length > 256) return reply({ error: "Lien ou mot de passe invalide (13 caractères minimum)." }, 400);
  try {
    if (!(await activateRestaurantStaff(token, password))) return reply({ error: "Lien expiré ou déjà utilisé." }, 400);
    return NextResponse.redirect(new URL("/admin/restaurant/connexion?activated=1", request.url), 303);
  } catch { return reply({ error: "Activation momentanément indisponible." }, 503); }
}
