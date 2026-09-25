import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email/mailer";
import { buildMailApiErrorResponse } from "@/lib/email/api-response";
import { parseInitiationRequest, buildInitiationRequestEmail } from "@/lib/initiation/request";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";
import { getInitiationOptions } from "@/lib/initiation/calendar-options-server";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) {
    return NextResponse.json({ ok: false, error: "Origine de requête non autorisée." }, { status: 403 });
  }
  const limit = await consumeRateLimit({ namespace: "initiation-email-request", identifier: parseClientIpFromHeaders(request.headers), limit: 8, windowMs: 600_000 });
  if (!limit.allowed) return NextResponse.json({ ok: false, error: limit.unavailable ? "Le service est momentanément indisponible. Réessayez plus tard." : "Trop de demandes. Réessayez dans quelques minutes." }, { status: limit.unavailable ? 503 : 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Demande invalide." }, { status: 400 }); }
  const parsed = parseInitiationRequest(body);
  if (!parsed.ok) return NextResponse.json(parsed, { status: 400 });
  try {
    const slots = await getInitiationOptions();
    if (!slots.some(slot => slot.date === parsed.data.date && slot.time === parsed.data.startTime)) {
      return NextResponse.json({ ok: false, error: "Ce créneau n’est plus proposé dans l’agenda. Actualisez les créneaux et choisissez une autre date ou un autre horaire." }, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 503 });
  }
  try {
    await sendMail({ to: process.env.EMAIL_TO?.trim() || "golf@marcilly.com", toName: process.env.EMAIL_TO_NAME?.trim(), ...buildInitiationRequestEmail(parsed.data) });
    return NextResponse.json({ ok: true, message: "Votre demande a été envoyée au golf. Votre réservation sera confirmée uniquement après réception d’un e-mail de notre équipe. Le règlement se fera sur place." });
  } catch (error) {
    return NextResponse.json({ ok: false, ...buildMailApiErrorResponse(error) }, { status: 503 });
  }
}

function methodNotAllowed() { return NextResponse.json({ ok: false, error: "Méthode non autorisée." }, { status: 405, headers: { Allow: "POST" } }); }
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
