import "server-only";
import { createHash } from "node:crypto";
import { siteConfig } from "@/data/site";
import { readJsonBody } from "@/lib/api/request-body";
import { isValidEmail } from "@/lib/api/public-form-validation";
import { sendMail } from "@/lib/email/mailer";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders, releaseRateLimit } from "@/lib/security/request-guards";
import { feedbackMail, parseFeedback } from "./model";

const dependencies = { send: sendMail, consume: consumeRateLimit, release: releaseRateLimit };
const unavailable = "L’envoi est momentanément indisponible. Votre texte est conservé. Réessayez plus tard.";

export async function handleFeedback(request: Request, deps = dependencies): Promise<Response> {
  const respond = (status: number, error: string, retry?: number) => Response.json({ error }, {
    status, headers: { "Cache-Control": "no-store", ...(retry ? { "Retry-After": String(retry) } : {}) },
  });
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return respond(403, "Rechargez la page puis réessayez.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) return respond(415, "Le formulaire n’a pas pu être lu. Rechargez la page.");
  const body = await readJsonBody<Record<string, unknown>>(request, 20_000);
  if (!body.ok) return respond(body.tooLarge ? 413 : 400, "Le message est invalide ou trop volumineux.");
  const feedback = parseFeedback(body.data);
  if (!feedback) return respond(400, "Vérifiez les champs du formulaire (message de 4 000 caractères maximum), puis réessayez.");

  const destination = process.env.ADMIN_FEEDBACK_EMAIL_TO?.trim() || "";
  if (!isValidEmail(destination) || /[\r\n,;<>]/.test(destination)) return respond(503, unavailable);
  const ip = parseClientIpFromHeaders(request.headers);
  for (const options of [
    { namespace: "admin-feedback-ip", identifier: ip, limit: 5, windowMs: 600_000 },
    { namespace: "admin-feedback-global", identifier: "all", limit: 40, windowMs: 3_600_000 },
  ]) {
    const rate = await deps.consume(options);
    if (!rate.allowed) return respond(rate.unavailable ? 503 : 429,
      rate.unavailable ? unavailable : "Trop d’envois. Patientez quelques minutes avant de réessayer.", rate.retryAfterSeconds);
  }
  const fingerprint = createHash("sha256").update(JSON.stringify(feedback)).digest("hex");
  const namespace = "admin-feedback-dedupe";
  const claim = await deps.consume({ namespace, identifier: fingerprint, limit: 1, windowMs: 600_000 });
  if (!claim.allowed) return respond(claim.unavailable ? 503 : 429,
    claim.unavailable ? unavailable : "Ce message est déjà en cours d’envoi ou a été envoyé récemment.", claim.retryAfterSeconds);
  try {
    await deps.send({ to: destination, ...feedbackMail(feedback, siteConfig.url, new Date()) });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    await deps.release(namespace, fingerprint).catch(() => {});
    return respond(503, unavailable);
  }
}
