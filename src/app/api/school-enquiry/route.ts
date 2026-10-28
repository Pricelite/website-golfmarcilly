import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { getFormErrorMessage } from "@/lib/api/form-feedback";
import { logApiError } from "@/lib/api/logging";
import { readJsonBody } from "@/lib/api/request-body";
import { methodNotAllowed } from "@/lib/api/responses";
import { buildMailApiErrorResponse, mailFailureHeaders, mailFailureStatus } from "@/lib/email/api-response";
import { sendDurableFormMail } from "@/lib/email/durable-form-mail";
import { formatSchoolEnquiry, parseSchoolEnquiry } from "@/lib/school-enquiry";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

const RATE_LIMIT_MAX_REQUESTS = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) {
    return NextResponse.json({ error: getFormErrorMessage(403) }, { status: 403 });
  }

  const rateLimit = await consumeRateLimit({
    namespace: "school-enquiry-form",
    identifier: parseClientIpFromHeaders(request.headers),
    limit: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    const status = rateLimit.unavailable ? 503 : 429;
    return NextResponse.json({ error: getFormErrorMessage(status) }, {
      status,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }

  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!body.ok) {
    const status = body.tooLarge ? 413 : 400;
    return NextResponse.json({ error: body.tooLarge ? "Demande trop volumineuse." : getFormErrorMessage(400) }, { status });
  }
  const enquiry = parseSchoolEnquiry(body.data);
  if (!enquiry) return NextResponse.json({ error: getFormErrorMessage(400) }, { status: 400 });

  const text = formatSchoolEnquiry(enquiry);
  try {
    const result = await sendDurableFormMail({
      namespace: "school-enquiry-email-dedupe",
      entry: {
        form: "school",
        reason: "school-enquiry-mail",
        nom: enquiry.guardianLastName,
        prenom: enquiry.guardianFirstName,
        entreprise: "",
        telephone: enquiry.phone,
        email: enquiry.email,
        message: text,
      },
      mail: {
        to: siteConfig.email,
        toName: process.env.EMAIL_TO_NAME?.trim() || undefined,
        subject: `[École de golf] ${enquiry.programTitle} — ${enquiry.childFirstName}`,
        text,
        replyTo: enquiry.email,
        replyToName: `${enquiry.guardianFirstName} ${enquiry.guardianLastName}`,
      },
    });
    return NextResponse.json(result.queued
      ? { ok: true, queued: true, message: "Votre demande a été enregistrée en secours. Notre équipe la traitera dès le rétablissement de la messagerie. Aucune inscription n’est confirmée à ce stade." }
      : { ok: true, queued: false, message: "Votre demande a été envoyée au golf. L’équipe vous répondra pour confirmer la suite." },
    { status: result.queued ? 202 : 200 });
  } catch (error) {
    logApiError("api/school-enquiry", "delivery_failed", { code: buildMailApiErrorResponse(error).code });
    return NextResponse.json(buildMailApiErrorResponse(error), { status: mailFailureStatus(error), headers: mailFailureHeaders(error) });
  }
}

const rejectOtherMethods = () => methodNotAllowed("POST", { error: "Method not allowed" });
export const GET = rejectOtherMethods;
export const PUT = rejectOtherMethods;
export const PATCH = rejectOtherMethods;
export const DELETE = rejectOtherMethods;
