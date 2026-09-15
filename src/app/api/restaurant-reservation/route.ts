import { NextResponse } from "next/server";

import { getRestaurantReservationEnv } from "@/lib/env";
import { MailerError, sendMail } from "@/lib/email/mailer";
import { parseReservationPayload, type ReservationRequestBody } from "@/lib/restaurant/validation";
import { deliverRestaurantRequest } from "@/lib/restaurant/delivery";
import { getFormErrorMessage } from "@/lib/api/form-feedback";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const PARIS_TIME_ZONE = "Europe/Paris";
const RESERVATION_RATE_LIMIT_MAX_REQUESTS = 8;
const RESERVATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CLIENT_ACK_TEXT =
  "Nous regardons la disponibilit\u00e9 et nous allons vous confirmer par mail dans les plus brefs d\u00e9lais.";

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: PARIS_TIME_ZONE,
  }).format(date);
}

function formatReservationDate(day: string): string {
  const [yearRaw, monthRaw, dateRaw] = day.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const date = Number.parseInt(dateRaw, 10);
  const value = new Date(year, month - 1, date);

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function buildRestaurantEmail(payload: ReservationRequestBody, submittedAt: Date) {
  const submittedAtLabel = formatTimestamp(submittedAt);
  const reservationDate = formatReservationDate(payload.day);
  const subject = `[Reservation Restaurant] ${payload.name} - ${payload.day} ${payload.time}`;
  const text = [
    "Nouvelle demande de reservation restaurant",
    "",
    `Demande recue le: ${submittedAtLabel}`,
    "",
    `Date souhaitee: ${reservationDate} (${payload.day})`,
    `Horaire souhaite: ${payload.time}`,
    `Nombre de personnes: ${payload.partySize}`,
    "",
    `Nom: ${payload.name}`,
    `Email: ${payload.email}`,
    `Telephone: ${payload.phone || "-"}`,
    "",
    "Message:",
    payload.message || "-",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Nouvelle demande de reservation restaurant</h2>
      <p style="margin:0 0 16px;color:#355d4f">Demande recue le ${escapeHtml(submittedAtLabel)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:6px 0;font-weight:700">Date souhaitee</td><td style="padding:6px 0">${escapeHtml(reservationDate)} (${escapeHtml(payload.day)})</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Horaire souhaite</td><td style="padding:6px 0">${escapeHtml(payload.time)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Nombre de personnes</td><td style="padding:6px 0">${payload.partySize}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Nom</td><td style="padding:6px 0">${escapeHtml(payload.name)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Email</td><td style="padding:6px 0">${escapeHtml(payload.email)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Telephone</td><td style="padding:6px 0">${escapeHtml(payload.phone || "-")}</td></tr>
        </tbody>
      </table>
      <h3 style="margin:18px 0 8px">Message</h3>
      <p style="margin:0;padding:12px;background:#f4faf7;border-radius:8px">${escapeHtml(payload.message || "-")}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

function buildClientAckEmail(payload: ReservationRequestBody) {
  const subject = "Votre demande de reservation a bien ete recue";
  const text = [
    `Bonjour ${payload.name},`,
    "",
    CLIENT_ACK_TEXT,
    "",
    `Rappel de votre demande:`,
    `${payload.day} a ${payload.time} pour ${payload.partySize} personne(s).`,
    "",
    "Merci et a bientot,",
    "Restaurant du Golf de Marcilly",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Bonjour ${escapeHtml(payload.name)},</h2>
      <p style="margin:0 0 12px">${escapeHtml(CLIENT_ACK_TEXT)}</p>
      <p style="margin:0 0 12px">Rappel de votre demande: ${escapeHtml(payload.day)} a ${escapeHtml(payload.time)} pour ${payload.partySize} personne(s).</p>
      <p style="margin:0">Merci et a bientot,<br />Restaurant du Golf de Marcilly</p>
    </div>
  `.trim();

  return { subject, text, html };
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return NextResponse.json(
      { ok: false, error: getFormErrorMessage(403) },
      { status: 403 }
    );
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "restaurant-reservation",
    identifier: requesterIp,
    limit: RESERVATION_RATE_LIMIT_MAX_REQUESTS,
    windowMs: RESERVATION_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: getFormErrorMessage(429) },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: getFormErrorMessage(400) },
      { status: 400 }
    );
  }

  const parsed = parseReservationPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const submittedAt = new Date();

  try {
    const env = getRestaurantReservationEnv();
    const reservationMail = buildRestaurantEmail(parsed.data, submittedAt);
    const ackMail = buildClientAckEmail(parsed.data);

    const result = await deliverRestaurantRequest(
      () => sendMail({
        to: env.restaurantReservationTo,
        toName: env.restaurantReservationToName,
        subject: reservationMail.subject,
        text: reservationMail.text,
        html: reservationMail.html,
        replyTo: parsed.data.email,
        replyToName: parsed.data.name,
      }),
      () => sendMail({
        to: parsed.data.email,
        toName: parsed.data.name,
        subject: ackMail.subject,
        text: ackMail.text,
        html: ackMail.html,
        replyTo: env.restaurantReservationTo,
        replyToName: env.restaurantReservationToName,
      }),
    );
    if (!result.acknowledgementSent) {
      console.error("[restaurant-reservation] client acknowledgement failed");
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof MailerError) {
      console.error("[restaurant-reservation] mail send failed", {
        code: error.code,
        message: error.message,
      });
    } else {
      console.error("[restaurant-reservation] unexpected error");
    }

    return NextResponse.json(
      { ok: false, error: getFormErrorMessage(503) },
      { status: 500 }
    );
  }
}

export function GET() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}
