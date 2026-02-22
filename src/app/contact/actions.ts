"use server";

import { headers } from "next/headers";

import { storeContactFallbackEntry } from "@/lib/contact/fallback-store";
import { MailerError, sendMail } from "@/lib/email/mailer";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

type ContactPayload = {
  nom: string;
  prenom: string;
  entreprise: string;
  telephone: string;
  email: string;
  message: string;
};

type ContactTemplate = "ecole-golf-info" | "";

type BuiltEmail = {
  subject: string;
  text: string;
  html: string;
};

export type ContactActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

const CLUB_NAME = "Golf de Marcilly";
const MESSAGE_MAX_LENGTH = 2000;
const PHONE_MAX_LENGTH = 30;
const COMPANY_MAX_LENGTH = 120;
const MESSAGE_PREVIEW_LIMIT = 300;
const SCHOOL_INFO_TEMPLATE = "ecole-golf-info";
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const SCHOOL_INFO_MESSAGE =
  "Je souhaite des informations sur l'ecole de golf de Marcilly.";

function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeMessage(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

function buildClubNotificationEmail(
  payload: ContactPayload,
  submittedAt: Date
): BuiltEmail {
  const safeMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");
  const subject = `[Contact Site] ${payload.prenom} ${payload.nom}`;
  const submittedAtLabel = formatTimestamp(submittedAt);
  const text = [
    "Nouvelle demande depuis le site du Golf de Marcilly",
    "",
    `Date: ${submittedAtLabel}`,
    `Nom: ${payload.nom}`,
    `Pr\u00e9nom: ${payload.prenom}`,
    `Entreprise: ${payload.entreprise || "-"}`,
    `T\u00e9l\u00e9phone: ${payload.telephone || "-"}`,
    `Email: ${payload.email}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Nouvelle demande de contact</h2>
      <p style="margin:0 0 16px;color:#355d4f">Re\u00e7u le ${escapeHtml(submittedAtLabel)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:6px 0;font-weight:700">Nom</td><td style="padding:6px 0">${escapeHtml(payload.nom)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Pr\u00e9nom</td><td style="padding:6px 0">${escapeHtml(payload.prenom)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Entreprise</td><td style="padding:6px 0">${escapeHtml(payload.entreprise || "-")}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">T\u00e9l\u00e9phone</td><td style="padding:6px 0">${escapeHtml(payload.telephone || "-")}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Email</td><td style="padding:6px 0">${escapeHtml(payload.email)}</td></tr>
        </tbody>
      </table>
      <h3 style="margin:18px 0 8px">Message</h3>
      <p style="margin:0;padding:12px;background:#f4faf7;border-radius:8px">${safeMessage}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

function buildClientConfirmationEmail(
  payload: ContactPayload
): BuiltEmail {
  const excerpt =
    payload.message.length > MESSAGE_PREVIEW_LIMIT
      ? `${payload.message.slice(0, MESSAGE_PREVIEW_LIMIT)}...`
      : payload.message;
  const safeExcerpt = escapeHtml(excerpt).replaceAll("\n", "<br />");
  const subject = "Nous avons bien re\u00e7u votre message";
  const text = [
    `Bonjour ${payload.prenom},`,
    "",
    "Nous avons bien re\u00e7u votre message et nous vous remercions de nous avoir contact\u00e9s.",
    "Nous reviendrons vers vous dans les plus brefs d\u00e9lais.",
    "",
    "Bien cordialement,",
    CLUB_NAME,
    "",
    "Votre message :",
    excerpt,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Bonjour ${escapeHtml(payload.prenom)},</h2>
      <p style="margin:0 0 10px">Nous avons bien re\u00e7u votre message et nous vous remercions de nous avoir contact\u00e9s.</p>
      <p style="margin:0 0 16px">Nous reviendrons vers vous dans les plus brefs d\u00e9lais.</p>
      <p style="margin:0 0 8px;font-weight:700">Votre message</p>
      <p style="margin:0;padding:12px;background:#f4faf7;border-radius:8px">${safeExcerpt}</p>
      <p style="margin:16px 0 0">Bien cordialement,<br />${CLUB_NAME}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

function validatePayload(
  payload: ContactPayload,
  template: ContactTemplate
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!payload.nom) {
    fieldErrors.nom = "Le nom est obligatoire.";
  }

  if (!payload.prenom) {
    fieldErrors.prenom = "Le pr\u00e9nom est obligatoire.";
  }

  if (!payload.email) {
    fieldErrors.email = "L'adresse e-mail est obligatoire.";
  } else if (!isValidEmail(payload.email)) {
    fieldErrors.email = "L'adresse e-mail est invalide.";
  }

  if (!payload.message) {
    fieldErrors.message = "Le message est obligatoire.";
  } else if (payload.message.length > MESSAGE_MAX_LENGTH) {
    fieldErrors.message = `Le message ne doit pas d\u00e9passer ${MESSAGE_MAX_LENGTH} caract\u00e8res.`;
  }

  if (template === SCHOOL_INFO_TEMPLATE && !payload.telephone) {
    fieldErrors.telephone = "Le t\u00e9l\u00e9phone est obligatoire.";
  } else if (payload.telephone.length > PHONE_MAX_LENGTH) {
    fieldErrors.telephone = `Le t\u00e9l\u00e9phone ne doit pas d\u00e9passer ${PHONE_MAX_LENGTH} caract\u00e8res.`;
  }

  if (payload.entreprise.length > COMPANY_MAX_LENGTH) {
    fieldErrors.entreprise =
      `L'entreprise ne doit pas d\u00e9passer ${COMPANY_MAX_LENGTH} caract\u00e8res.`;
  }

  return fieldErrors;
}

export async function sendContactEmail(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const requestHeaders = await headers();
  if (!hasTrustedOrigin(requestHeaders)) {
    return {
      ok: false,
      message:
        "Requete refusee. Merci de recharger la page puis de reessayer.",
    };
  }

  const requesterIp = parseClientIpFromHeaders(requestHeaders);
  const rateLimit = consumeRateLimit({
    namespace: "contact-form",
    identifier: requesterIp,
    limit: CONTACT_RATE_LIMIT_MAX_REQUESTS,
    windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `Trop de tentatives. Merci de reessayer dans ${rateLimit.retryAfterSeconds}s.`,
    };
  }

  const rawTemplate = getStringValue(formData, "template");
  const template: ContactTemplate =
    rawTemplate === SCHOOL_INFO_TEMPLATE ? SCHOOL_INFO_TEMPLATE : "";

  const payload: ContactPayload = {
    nom: getStringValue(formData, "nom"),
    prenom: getStringValue(formData, "prenom"),
    entreprise: getStringValue(formData, "entreprise"),
    telephone: getStringValue(formData, "telephone"),
    email: getStringValue(formData, "email"),
    message: normalizeMessage(getStringValue(formData, "message")),
  };

  if (template === SCHOOL_INFO_TEMPLATE) {
    payload.message = SCHOOL_INFO_MESSAGE;
  }

  const website = getStringValue(formData, "website");
  if (website.length > 0) {
    return {
      ok: true,
      message: "Merci, votre message a bien \u00e9t\u00e9 re\u00e7u.",
    };
  }

  const fieldErrors = validatePayload(payload, template);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Merci de corriger les champs en erreur.",
      fieldErrors,
    };
  }

  const clubEmail = process.env.EMAIL_TO || "golf@marcilly.com";
  const clubEmailName = process.env.EMAIL_TO_NAME?.trim();
  const replyToFallback =
    process.env.EMAIL_REPLY_TO?.trim() || process.env.EMAIL_FROM;
  const sendConfirmation = process.env.CONTACT_SEND_CONFIRMATION === "true";
  const submittedAt = new Date();
  const clubMail = buildClubNotificationEmail(payload, submittedAt);

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: clubMail.subject,
      text: clubMail.text,
      html: clubMail.html,
      replyTo: payload.email,
      replyToName: `${payload.prenom} ${payload.nom}`,
    });

    if (sendConfirmation) {
      const confirmationMail = buildClientConfirmationEmail(payload);

      try {
        await sendMail({
          to: payload.email,
          toName: `${payload.prenom} ${payload.nom}`,
          subject: confirmationMail.subject,
          text: confirmationMail.text,
          html: confirmationMail.html,
          replyTo: replyToFallback || undefined,
          replyToName: CLUB_NAME,
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
      message: "Votre message a bien \u00e9t\u00e9 envoy\u00e9.",
    };
  } catch (error) {
    const detail =
      error instanceof MailerError
        ? { code: error.code, message: error.message }
        : { code: "unknown", message: "Unknown mailer error" };
    console.error("[contact] primary email failed", detail);

    try {
      await storeContactFallbackEntry({
        receivedAt: submittedAt.toISOString(),
        reason: detail.code,
        nom: payload.nom,
        prenom: payload.prenom,
        entreprise: payload.entreprise,
        telephone: payload.telephone,
        email: payload.email,
        message: payload.message,
      });

      console.error("[contact] message stored in local fallback queue");

      return {
        ok: true,
        message:
          "Votre message a bien \u00e9t\u00e9 enregistr\u00e9. Notre \u00e9quipe vous recontactera rapidement.",
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
            "Le service e-mail est temporairement indisponible (authentification). Merci de nous contacter par t\u00e9l\u00e9phone.",
        };
      }

      if (error.code === "config") {
        return {
          ok: false,
          message:
            "Le service e-mail n'est pas encore configur\u00e9. Merci de nous contacter par t\u00e9l\u00e9phone.",
        };
      }
    }

    return {
      ok: false,
      message:
        "Une erreur est survenue pendant l'envoi. Merci de r\u00e9essayer dans quelques instants.",
    };
  }
}
