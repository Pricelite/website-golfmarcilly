import { NextResponse } from "next/server";

import { isIdentifiableBot, publicPath, validUuid } from "@/lib/analytics/core";
import { recordPageView } from "@/lib/analytics/store";
import { readJsonBody } from "@/lib/api/request-body";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.PREVIEW_MODE === "true") return new Response(null, { status: 204 });
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return new Response(null, { status: 403 });
  if (isIdentifiableBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });
  const rate = await consumeRateLimit({ namespace: "site-analytics", identifier: parseClientIpFromHeaders(request.headers), limit: 120, windowMs: 60_000 });
  if (!rate.allowed) return new Response(null, { status: rate.unavailable ? 503 : 429 });
  if (!request.headers.get("content-type")?.includes("application/json")) return new Response(null, { status: 415 });
  const body = await readJsonBody(request, 1000);
  if (!body.ok || !body.data || typeof body.data !== "object") return new Response(null, { status: 400 });
  const { eventId, visitorId, visitId, path } = body.data as Record<string, unknown>;
  const normalized = publicPath(path);
  if (!validUuid(eventId) || !validUuid(visitorId) || !validUuid(visitId) || !normalized) return new Response(null, { status: 400 });
  try {
    await recordPageView({ eventId, visitorId, visitId, path: normalized });
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Mesure indisponible." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
