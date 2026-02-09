"use server";

import { sendMail } from "@/lib/email/mailer";

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
      message: "Merci, votre message a bien ete recu.",
    };
  }

  const fieldErrors: Record<string, string> = {};

  if (!nom) {
    fieldErrors.nom = "Le nom est obligatoire.";
  }

  if (!prenom) {
    fieldErrors.prenom = "Le prenom est obligatoire.";
  }

  if (!email) {
    fieldErrors.email = "L'adresse mail est obligatoire.";
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "L'adresse mail est invalide.";
  }

  if (!message) {
    fieldErrors.message = "Le message est obligatoire.";
  } else if (message.length > 2000) {
    fieldErrors.message = "Le message ne doit pas depasser 2000 caracteres.";
  }

  if (telephone.length > 30) {
    fieldErrors.telephone = "Le telephone ne doit pas depasser 30 caracteres.";
  }

  if (entreprise.length > 120) {
    fieldErrors.entreprise =
      "L'entreprise ne doit pas depasser 120 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Merci de corriger les champs en erreur.",
      fieldErrors,
    };
  }

  const clubEmail = process.env.EMAIL_TO || "golf@marcilly.com";
  const clientExcerpt =
    message.length > 300 ? `${message.slice(0, 300)}...` : message;

  const clubText = [
    "Nouvelle demande depuis le site du Golf de Marcilly",
    "",
    `Nom: ${nom}`,
    `Prenom: ${prenom}`,
    `Entreprise: ${entreprise || "-"}`,
    `Telephone: ${telephone || "-"}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const confirmationText = [
    `Bonjour ${prenom},`,
    "",
    "Nous avons bien recu votre message et nous vous remercions de nous avoir contactes.",
    "Nous reviendrons vers vous dans les plus brefs delais.",
    "",
    "Bien cordialement,",
    "Le Golf de Marcilly",
    "",
    "Votre message :",
    clientExcerpt,
  ].join("\n");

  try {
    await sendMail({
      to: clubEmail,
      subject: `[Contact Site] ${prenom} ${nom}`,
      text: clubText,
      replyTo: email,
    });

    await sendMail({
      to: email,
      subject: "Nous avons bien recu votre message",
      text: confirmationText,
      replyTo: clubEmail || process.env.EMAIL_FROM,
    });

    return {
      ok: true,
      message: "Votre message a bien ete envoye.",
    };
  } catch {
    return {
      ok: false,
      message:
        "Une erreur est survenue pendant l'envoi. Merci de reessayer dans quelques instants.",
    };
  }
}
