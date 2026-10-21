import { MailerError, getPublicMailerErrorMessage } from "@/lib/email/mailer";
import { DeliveryClaimError } from "./durable-delivery";

export function mailFailureStatus(error: unknown): number {
  return error instanceof DeliveryClaimError && !error.unavailable ? 409 : 503;
}

export function mailFailureHeaders(error: unknown): Record<string, string> {
  return error instanceof DeliveryClaimError ? { "Retry-After": String(error.retryAfterSeconds) } : {};
}

export function buildMailApiErrorResponse(error: unknown) {
  if (error instanceof DeliveryClaimError) {
    return { error: error.message, code: error.unavailable ? "unavailable" : "duplicate" };
  }
  if (error instanceof MailerError) {
    return {
      error: getPublicMailerErrorMessage(error),
      code: error.code,
    };
  }

  return {
    error: "Impossible d'envoyer l'email pour le moment.",
    code: "send",
  };
}
