import { NextResponse } from "next/server";
import { RESTAURANT_SESSION_COOKIE, restaurantSessionCookieOptions, revokeRestaurantSession } from "@/lib/restaurant-admin/store";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)marcilly_restaurant_session=([^;]+)/)?.[1];
  try { await revokeRestaurantSession(token); }
  catch { return NextResponse.json({ error: "Déconnexion momentanément indisponible. Réessayez." }, { status: 503 }); }
  const response = NextResponse.redirect(new URL("/admin/restaurant/connexion", request.url), 303);
  response.cookies.set(RESTAURANT_SESSION_COOKIE, "", { ...restaurantSessionCookieOptions(), maxAge: 0 });
  return response;
}
