"use server";

import { storeContactFallbackEntry } from "@/lib/contact/fallback-store";
import { MailerError, sendMail } from "@/lib/email/mailer";

export type ContactActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const nom = getStringValue(formData, "nom");
  const prenom = getStringValue(formData, "prenom");
  const entreprise = getStringValue(formData, "entreprise");
  const telephone = getStringValue(formData, "telephone");
  const email = getStringValue(formData, "email");
  const message = getStringValue(formData, "message");
  const website = getStringValue(formData, "website");

  if (website.length > 0) {
    return {
      ok: true,
      message: "Merci, votre message a bien été reçu.",
    };
  }

  const fieldErrors: Record<string, string> = {};

  if (!nom) {
    fieldErrors.nom = "Le nom est obligatoire.";
  }

  if (!prenom) {
    fieldErrors.prenom = "Le prénom est obligatoire.";
  }

  if (!email) {
    fieldErrors.email = "L'adresse e-mail est obligatoire.";
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "L'adresse e-mail est invalide.";
  }

  if (!message) {
    fieldErrors.message = "Le message est obligatoire.";
  } else if (message.length > 2000) {
    fieldErrors.message = "Le message ne doit pas dépasser 2000 caractères.";
  }

  if (telephone.length > 30) {
    fieldErrors.telephone = "Le téléphone ne doit pas dépasser 30 caractères.";
  }

  if (entreprise.length > 120) {
    fieldErrors.entreprise =
      "L'entreprise ne doit pas dépasser 120 caractères.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Merci de corriger les champs en erreur.",
      fieldErrors,
    };
  }

  const clubEmail = process.env.EMAIL_TO || "golf@marcilly.com";
  const sendConfirmation = process.env.CONTACT_SEND_CONFIRMATION === "true";

  const clubText = [
    "Nouvelle demande depuis le site du Golf de Marcilly",
    "",
    `Nom: ${nom}`,
    `Prénom: ${prenom}`,
    `Entreprise: ${entreprise || "-"}`,
    `Téléphone: ${telephone || "-"}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    await sendMail({
      to: clubEmail,
      subject: `[Contact Site] ${prenom} ${nom}`,
      text: clubText,
      replyTo: email,
    });

    if (sendConfirmation) {
      const clientExcerpt =
        message.length > 300 ? `${message.slice(0, 300)}...` : message;
      const confirmationText = [
        `Bonjour ${prenom},`,
        "",
        "Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.",
        "Nous reviendrons vers vous dans les plus brefs délais.",
        "",
        "Bien cordialement,",
        "Le Golf de Marcilly",
        "",
        "Votre message :",
        clientExcerpt,
      ].join("\n");

      try {
        await sendMail({
          to: email,
          subject: "Nous avons bien reçu votre message",
          text: confirmationText,
          replyTo: clubEmail || process.env.EMAIL_FROM,
        });
      } catch (error) {
        const detail =
          error instanceof MailerError
            ? { code: error.code, message: error.message }
            : { code: "unknown", message: "Unknown mailer error" };
        console.error("[contact] confirmation email failed", detail);
      }
    }

    return {
      ok: true,
      message: "Votre message a bien été envoyé.",
    };
  } catch (error) {
    const detail =
      error instanceof MailerError
        ? { code: error.code, message: error.message }
        : { code: "unknown", message: "Unknown mailer error" };
    console.error("[contact] primary email failed", detail);

    try {
      await storeContactFallbackEntry({
        receivedAt: new Date().toISOString(),
        reason: detail.code,
        nom,
        prenom,
        entreprise,
        telephone,
        email,
        message,
      });

      console.error("[contact] message stored in local fallback queue");

      return {
        ok: true,
        message:
          "Votre message a bien été enregistré. Notre équipe vous recontactera rapidement.",
      };
    } catch (fallbackError) {
      const fallbackDetail =
        fallbackError instanceof Error
          ? { message: fallbackError.message }
          : { message: "Unknown fallback error" };
      console.error("[contact] fallback storage failed", fallbackDetail);
    }

    if (error instanceof MailerError) {
      if (error.code === "auth") {
        return {
          ok: false,
          message:
            "Le service e-mail est temporairement indisponible (authentification). Merci de nous contacter par téléphone.",
        };
      }

      if (error.code === "config") {
        return {
          ok: false,
          message:
            "Le service e-mail n'est pas encore configuré. Merci de nous contacter par téléphone.",
        };
      }
    }

    return {
      ok: false,
      message:
        "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques instants.",
    };
  }
}
