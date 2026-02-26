import { NextResponse } from "next/server";

import {
  processContactFallbackQueue,
  storeContactFallbackEntry,
} from "@/lib/contact/fallback-store";
import { MailerError, sendMail } from "@/lib/email/mailer";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

type InitiationReservationBody = {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  desiredSlot?: string;
  desiredSlotYear?: string;
  partySize?: string;
  mealOption?: string;
  note?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIATION_REQUEST_RATE_LIMIT_MAX_REQUESTS = 8;
const INITIATION_REQUEST_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePayload(payload: unknown):
  | { ok: true; data: InitiationReservationBody }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Requête invalide." };
  }

  const source = payload as Partial<InitiationReservationBody>;
  const lastName = parseString(source.lastName);
  const firstName = parseString(source.firstName);
  const phone = parseString(source.phone);
  const email = parseString(source.email).toLowerCase();
  const desiredSlot = parseString(source.desiredSlot);
  const desiredSlotYear = parseString(source.desiredSlotYear);
  const partySize = parseString(source.partySize);
  const mealOption = parseString(source.mealOption);
  const note = parseString(source.note);

  if (!lastName || !firstName || !phone || !email) {
    return {
      ok: false,
      error: "Les champs nom, prénom, téléphone et e-mail sont obligatoires.",
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  if (!desiredSlot && !desiredSlotYear) {
    return { ok: false, error: "Veuillez sélectionner un créneau souhaité." };
  }

  return {
    ok: true,
    data: {
      lastName,
      firstName,
      phone,
      email,
      desiredSlot,
      desiredSlotYear,
      partySize,
      mealOption,
      note,
    },
  };
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return NextResponse.json(
      { ok: false, error: "Origine de requête non autorisée." },
      { status: 403 }
    );
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "initiation-request-form",
    identifier: requesterIp,
    limit: INITIATION_REQUEST_RATE_LIMIT_MAX_REQUESTS,
    windowMs: INITIATION_REQUEST_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Impossible de lire la requête." },
      { status: 400 }
    );
  }

  const parsed = parsePayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 }
    );
  }

  const selectedSlot = parsed.data.desiredSlot || parsed.data.desiredSlotYear;
  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const submittedAt = new Date();
  const clubEmail = process.env.EMAIL_TO || "golf@marcilly.com";
  const clubEmailName = process.env.EMAIL_TO_NAME?.trim();

  const text = [
    "Nouvelle demande de reservation initiation",
    "",
    `Date: ${submittedAt.toISOString()}`,
    `Nom: ${parsed.data.lastName}`,
    `Prénom: ${parsed.data.firstName}`,
    `Téléphone: ${parsed.data.phone}`,
    `Email: ${parsed.data.email}`,
    `Créneau souhaité: ${selectedSlot}`,
    `Nombre de personnes: ${parsed.data.partySize || "-"}`,
    `Option repas: ${parsed.data.mealOption || "-"}`,
    "Commentaire:",
    parsed.data.note || "-",
  ].join("\n");

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: `[Initiation] Réservation - ${fullName}`,
      text,
      replyTo: parsed.data.email,
      replyToName: fullName,
    });

    try {
      await processContactFallbackQueue({ maxItems: 5 });
    } catch (queueError) {
      console.error("[initiation-reservation] fallback queue processing failed", {
        message: queueError instanceof Error ? queueError.message : "unknown",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Votre message a bien été reçu. Nous revenons vers vous au plus vite.",
    });
  } catch (error) {
    const detail =
      error instanceof MailerError
        ? { code: error.code, message: error.message }
        : { code: "unknown", message: "Unknown mailer error" };
    console.error("[initiation-reservation] primary email failed", detail);

    try {
      await storeContactFallbackEntry({
        receivedAt: submittedAt.toISOString(),
        reason: `initiation-${detail.code}`,
        nom: parsed.data.lastName,
        prenom: parsed.data.firstName,
        entreprise: "",
        telephone: parsed.data.phone,
        email: parsed.data.email,
        message: [
          `Créneau souhaité: ${selectedSlot}`,
          `Nombre de personnes: ${parsed.data.partySize || "-"}`,
          `Option repas: ${parsed.data.mealOption || "-"}`,
          "Commentaire:",
          parsed.data.note || "-",
        ].join("\n"),
      });

      console.error("[initiation-reservation] message stored in local fallback queue");

      return NextResponse.json({
        ok: true,
        message:
          "Votre message a bien été enregistré. Notre équipe vous recontactera rapidement.",
      });
    } catch (fallbackError) {
      const fallbackDetail =
        fallbackError instanceof Error
          ? { message: fallbackError.message }
          : { message: "Unknown fallback error" };
      console.error("[initiation-reservation] fallback storage failed", fallbackDetail);
    }

    if (error instanceof MailerError) {
      if (error.code === "auth") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Le service e-mail est temporairement indisponible. Merci de réessayer plus tard.",
          },
          { status: 503 }
        );
      }

      if (error.code === "config") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Le service e-mail n'est pas encore configuré. Merci de nous contacter par téléphone.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossible d'envoyer la demande pour le moment. Merci de réessayer dans quelques instants.",
      },
      { status: 500 }
    );
  }
}
