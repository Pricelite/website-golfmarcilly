import { NextResponse } from "next/server";

import { storeContactFallbackEntry } from "@/lib/contact/fallback-store";
import { logApiError } from "@/lib/api/logging";
import { readJsonBody } from "@/lib/api/request-body";
import {
  isNonEmptyWithinLength,
  isValidEmail,
  isWithinLength,
  parseTrimmedString,
} from "@/lib/api/public-form-validation";
import { methodNotAllowed } from "@/lib/api/responses";
import { buildMailApiErrorResponse } from "@/lib/email/api-response";
import { MailerError, sendMail } from "@/lib/email/mailer";
import { buildContactEmail } from "@/lib/form-emails";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const CONTACT_RATE_LIMIT_MAX_REQUESTS = 8;
const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 30;
const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 4000;

function buildMethodNotAllowed() {
  return methodNotAllowed("POST", { error: "Method not allowed" });
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "contact-form",
    identifier: requesterIp,
    limit: CONTACT_RATE_LIMIT_MAX_REQUESTS,
    windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const bodyResult = await readJsonBody<Record<string, unknown>>(request);
  if (!bodyResult.ok) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const payload = {
    context:
      typeof bodyResult.data.context === "string"
        ? bodyResult.data.context
        : "contact",
    firstName: parseTrimmedString(bodyResult.data.firstName),
    lastName: parseTrimmedString(bodyResult.data.lastName),
    phone: parseTrimmedString(bodyResult.data.phone),
    email: parseTrimmedString(bodyResult.data.email).toLowerCase(),
    subject: parseTrimmedString(bodyResult.data.subject),
    message: parseTrimmedString(bodyResult.data.message),
  };

  if (
    !isNonEmptyWithinLength(payload.firstName, MAX_NAME_LENGTH) ||
    !isNonEmptyWithinLength(payload.lastName, MAX_NAME_LENGTH) ||
    !isNonEmptyWithinLength(payload.message, MAX_MESSAGE_LENGTH) ||
    !isNonEmptyWithinLength(payload.email, MAX_EMAIL_LENGTH) ||
    !isValidEmail(payload.email) ||
    !isWithinLength(payload.phone, MAX_PHONE_LENGTH) ||
    !isWithinLength(payload.subject, MAX_SUBJECT_LENGTH)
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const clubEmail = process.env.EMAIL_TO?.trim();
  const clubEmailName = process.env.EMAIL_TO_NAME?.trim() || undefined;

  if (!clubEmail) {
    return NextResponse.json(
      {
        error:
          "Configuration email incomplete. Ajoutez EMAIL_TO dans le fichier .env.local.",
        code: "config",
      },
      { status: 500 },
    );
  }

  const emailContent = buildContactEmail(payload);

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: payload.email,
      replyToName: emailContent.replyToName,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const reason = error instanceof MailerError ? error.code : "send";

    try {
      await storeContactFallbackEntry({
        receivedAt: new Date().toISOString(),
        reason: `${payload.context}-${reason}`,
        nom: payload.lastName,
        prenom: payload.firstName,
        entreprise: "",
        telephone: payload.phone,
        email: payload.email,
        message: [payload.subject || "-", "", payload.message].join("\n"),
      });
    } catch {
      // Ignore fallback storage failures and return the primary mail error.
    }

    logApiError("api/contact", "mail_failed", {
      code: error instanceof MailerError ? error.code : "send",
    });
    return NextResponse.json(buildMailApiErrorResponse(error), { status: 500 });
  }
}

export function GET() {
  return buildMethodNotAllowed();
}

export function PUT() {
  return buildMethodNotAllowed();
}

export function PATCH() {
  return buildMethodNotAllowed();
}

export function DELETE() {
  return buildMethodNotAllowed();
}
