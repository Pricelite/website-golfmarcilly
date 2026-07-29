import { NextResponse } from "next/server";

import { readJsonBody } from "@/lib/api/request-body";
import {
  isNonEmptyWithinLength,
  isValidEmail,
  parseTrimmedString,
} from "@/lib/api/public-form-validation";
import { methodNotAllowed } from "@/lib/api/responses";
import { buildMailApiErrorResponse } from "@/lib/email/api-response";
import { sendMail } from "@/lib/email/mailer";
import { buildNewsletterEmail } from "@/lib/form-emails";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const NEWSLETTER_RATE_LIMIT_MAX_REQUESTS = 8;
const NEWSLETTER_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_EMAIL_LENGTH = 160;

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
    namespace: "newsletter-form",
    identifier: requesterIp,
    limit: NEWSLETTER_RATE_LIMIT_MAX_REQUESTS,
    windowMs: NEWSLETTER_RATE_LIMIT_WINDOW_MS,
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

  const email = parseTrimmedString(bodyResult.data.email).toLowerCase();
  if (!isNonEmptyWithinLength(email, MAX_EMAIL_LENGTH) || !isValidEmail(email)) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
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

  const emailContent = buildNewsletterEmail({ email });

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: email,
    });

    return NextResponse.json({ ok: true, email });
  } catch (error) {
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
