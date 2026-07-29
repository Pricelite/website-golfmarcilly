import { MailerError, getPublicMailerErrorMessage } from "@/lib/email/mailer";

export function buildMailApiErrorResponse(error: unknown) {
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
