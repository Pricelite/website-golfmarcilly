import { NextResponse } from "next/server";

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
import { sendMail } from "@/lib/email/mailer";
import { buildQuoteEmail } from "@/lib/form-emails";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const QUOTE_RATE_LIMIT_MAX_REQUESTS = 8;
const QUOTE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_COMPANY_LENGTH = 160;
const MAX_EMAIL_LENGTH = 160;
const MAX_EVENT_TYPE_LENGTH = 120;
const MAX_PARTICIPANTS_LENGTH = 40;
const MAX_DETAILS_LENGTH = 4000;

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
    namespace: "quote-form",
    identifier: requesterIp,
    limit: QUOTE_RATE_LIMIT_MAX_REQUESTS,
    windowMs: QUOTE_RATE_LIMIT_WINDOW_MS,
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
    company: parseTrimmedString(bodyResult.data.company),
    email: parseTrimmedString(bodyResult.data.email).toLowerCase(),
    eventType: parseTrimmedString(bodyResult.data.eventType),
    participants: parseTrimmedString(bodyResult.data.participants),
    details: parseTrimmedString(bodyResult.data.details),
  };

  if (
    !isNonEmptyWithinLength(payload.company, MAX_COMPANY_LENGTH) ||
    !isNonEmptyWithinLength(payload.email, MAX_EMAIL_LENGTH) ||
    !isValidEmail(payload.email) ||
    !isNonEmptyWithinLength(payload.eventType, MAX_EVENT_TYPE_LENGTH) ||
    !isNonEmptyWithinLength(payload.details, MAX_DETAILS_LENGTH) ||
    !isWithinLength(payload.participants, MAX_PARTICIPANTS_LENGTH)
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

  const emailContent = buildQuoteEmail(payload);

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: payload.email,
      replyToName: payload.company,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logApiError("api/quote", "mail_failed", {});
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
