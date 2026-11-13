import { NextResponse } from "next/server";
import { readLimitedTextBody } from "@/lib/api/request-body";
import { authenticateRestaurantStaff, issueRestaurantSession, restaurantSessionCookieOptions, RESTAURANT_SESSION_COOKIE } from "@/lib/restaurant-admin/store";
import { canAccessAdminSection } from "@/lib/restaurant-admin/policy";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const destination = "/admin/restaurant/connexion";
function fail(request: Request, code: string) { return NextResponse.redirect(new URL(`${destination}?error=${code}`, request.url), 303); }

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return fail(request, "origin");
  const rate = await consumeRateLimit({ namespace: "restaurant-admin-login", identifier: parseClientIpFromHeaders(request.headers), limit: 8, windowMs: 10 * 60_000 });
  if (!rate.allowed) return fail(request, rate.unavailable ? "unavailable" : "rate");
  if (!request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) return fail(request, "invalid");
  const body = await readLimitedTextBody(request, 2048);
  if (!body.ok) return fail(request, "invalid");
  const fields = new URLSearchParams(body.text);
  const identifier = fields.get("identifier") ?? fields.get("email") ?? "";
  const password = fields.get("password") ?? "";
  if (identifier.length > 254 || password.length > 256 || !identifier.trim() || !password) return fail(request, "invalid");
  try {
    const actor = await authenticateRestaurantStaff(identifier, password);
    if (!actor) return fail(request, "invalid");
    const token = await issueRestaurantSession(actor);
    const destinations = [
      ["restaurant", "/admin/restaurant"], ["competitions", "/admin/competitions"],
      ["site_conditions", "/admin/site-conditions"], ["publicites", "/admin/publicites"],
      ["statistiques", "/admin/statistiques"], ["archives", "/admin/archives"],
      ["pages", "/admin/contenu"], ["media", "/admin/contenu/medias"],
    ] as const;
    const destination = destinations.find(([section]) => canAccessAdminSection(actor, section))?.[1] ?? "/admin";
    const response = NextResponse.redirect(new URL(destination, request.url), 303);
    response.cookies.set(RESTAURANT_SESSION_COOKIE, token, restaurantSessionCookieOptions());
    return response;
  } catch { return fail(request, "unavailable"); }
}
