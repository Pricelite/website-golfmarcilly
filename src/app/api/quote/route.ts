import { NextResponse } from "next/server";

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

  const body = await request.json();

  if (!body?.company || !body?.email || !body?.eventType || !body?.details) {
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

  const payload = {
    company: String(body.company).trim(),
    email: String(body.email).trim(),
    eventType: String(body.eventType).trim(),
    participants:
      body.participants === undefined ? "" : String(body.participants).trim(),
    details: String(body.details).trim(),
  };

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
    return NextResponse.json(buildMailApiErrorResponse(error), { status: 500 });
  }
}
