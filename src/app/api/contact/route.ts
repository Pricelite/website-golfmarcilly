import { NextResponse } from "next/server";

import { storeContactFallbackEntry } from "@/lib/contact/fallback-store";
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

  const body = await request.json();

  if (!body?.firstName || !body?.lastName || !body?.email || !body?.message) {
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
    context: typeof body.context === "string" ? body.context : "contact",
    firstName: String(body.firstName).trim(),
    lastName: String(body.lastName).trim(),
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    email: String(body.email).trim(),
    subject: typeof body.subject === "string" ? body.subject.trim() : "",
    message: String(body.message).trim(),
  };

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

    return NextResponse.json(buildMailApiErrorResponse(error), { status: 500 });
  }
}
