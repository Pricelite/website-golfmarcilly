import { NextResponse } from "next/server";

import { getRestaurantReservationEnv } from "@/lib/env";
import { MailerError, sendMail } from "@/lib/email/mailer";
import { generateTimeSlots } from "@/lib/restaurant/slots";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

type ReservationRequestBody = {
  day: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_PARTY_SIZE = 30;
const MIN_ADVANCE_MINUTES = 30;
const PARIS_TIME_ZONE = "Europe/Paris";
const RESERVATION_RATE_LIMIT_MAX_REQUESTS = 8;
const RESERVATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const ALLOWED_SLOTS = new Set(generateTimeSlots("12:00", "14:30", 30));
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

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getParisDateTimeKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function isSlotAtLeastThirtyMinutesAhead(day: string, time: string): boolean {
  const selectedDateTimeKey = `${day}T${time}`;
  const minAllowedDateTimeKey = getParisDateTimeKey(
    new Date(Date.now() + MIN_ADVANCE_MINUTES * 60 * 1000)
  );

  return selectedDateTimeKey >= minAllowedDateTimeKey;
}

function isValidIsoDate(day: string): boolean {
  if (!DAY_PATTERN.test(day)) {
    return false;
  }

  const [yearRaw, monthRaw, dateRaw] = day.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const date = Number.parseInt(dateRaw, 10);
  const value = new Date(year, month - 1, date);

  return (
    value.getFullYear() === year &&
    value.getMonth() === month - 1 &&
    value.getDate() === date
  );
}

function isWithinNextSevenDays(day: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let index = 0; index < 7; index += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + index);
    if (toLocalIsoDate(candidate) === day) {
      return true;
    }
  }

  return false;
}

function parseString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function parseReservationPayload(payload: unknown):
  | { ok: true; data: ReservationRequestBody }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Payload invalide." };
  }

  const source = payload as Record<string, unknown>;
  const day = parseString(source.day);
  const time = parseString(source.time);
  const name = parseString(source.name);
  const email = parseString(source.email);
  const phone = parseString(source.phone);
  const message = parseString(source.message);
  const partySizeRaw = source.partySize;
  const partySize =
    typeof partySizeRaw === "number"
      ? partySizeRaw
      : Number.parseInt(String(partySizeRaw ?? ""), 10);

  if (!isValidIsoDate(day)) {
    return { ok: false, error: "Date invalide." };
  }

  if (!isWithinNextSevenDays(day)) {
    return { ok: false, error: "La date doit etre comprise dans les 7 prochains jours." };
  }

  if (!TIME_PATTERN.test(time) || !ALLOWED_SLOTS.has(time)) {
    return { ok: false, error: "Creneau invalide." };
  }

  if (!isSlotAtLeastThirtyMinutesAhead(day, time)) {
    return {
      ok: false,
      error:
        "Ce creneau est trop proche. Merci de reserver au moins 30 minutes avant l'heure choisie.",
    };
  }

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Nom invalide." };
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  if (phone.length > MAX_PHONE_LENGTH) {
    return { ok: false, error: "Telephone invalide." };
  }

  if (
    !Number.isInteger(partySize) ||
    partySize < 1 ||
    partySize > MAX_PARTY_SIZE
  ) {
    return { ok: false, error: "Nombre de personnes invalide." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Message trop long." };
  }

  return {
    ok: true,
    data: {
      day,
      time,
      name,
      email,
      phone: phone || undefined,
      partySize,
      message: message || undefined,
    },
  };
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
      { ok: false, error: "Origine de requete non autorisee." },
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
      { ok: false, error: "Trop de tentatives. Merci de reessayer plus tard." },
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
      { ok: false, error: "Corps de requete invalide." },
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

    await sendMail({
      to: env.restaurantReservationTo,
      toName: env.restaurantReservationToName,
      subject: reservationMail.subject,
      text: reservationMail.text,
      html: reservationMail.html,
      replyTo: parsed.data.email,
      replyToName: parsed.data.name,
    });

    await sendMail({
      to: parsed.data.email,
      toName: parsed.data.name,
      subject: ackMail.subject,
      text: ackMail.text,
      html: ackMail.html,
      replyTo: env.restaurantReservationTo,
      replyToName: env.restaurantReservationToName,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
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
      { ok: false, error: "Internal error" },
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
