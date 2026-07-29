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

type LegacyInitiationRequestBody = {
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
const LEGACY_INITIATION_RATE_LIMIT_MAX_REQUESTS = 8;
const LEGACY_INITIATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const LEGACY_ENDPOINT_HEADER = "X-Legacy-Endpoint";
const RECOMMENDED_INITIATION_PATH = "/initiation/reservation";

function methodNotAllowed() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Cette route legacy n'accepte que les requêtes POST. Utilisez l'interface de réservation moderne.",
      legacy: true,
      recommendedPath: RECOMMENDED_INITIATION_PATH,
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
        [LEGACY_ENDPOINT_HEADER]: "true",
      },
    }
  );
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatMealOption(value: string): string {
  if (value === "WITH_MEAL") {
    return "Oui";
  }

  if (value === "WITHOUT_MEAL") {
    return "Non";
  }

  return "-";
}

function formatDesiredSlot(value: string): string {
  const rawValue = parseString(value);
  if (!rawValue) {
    return "-";
  }

  const [datePart, timePart, teacherPart] = rawValue
    .split("|")
    .map((part) => part.trim());

  if (!datePart || !timePart) {
    return rawValue;
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!dateMatch) {
    return rawValue;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const slotDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (Number.isNaN(slotDate.getTime())) {
    return rawValue;
  }

  const weekday = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: "Europe/Paris",
  }).format(slotDate);
  const dayAndMonth = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(slotDate);

  const capitalizedWeekday =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const readableDate = `${capitalizedWeekday} ${dayAndMonth}`;

  if (teacherPart) {
    return `${readableDate}, ${timePart} (${teacherPart})`;
  }

  return `${readableDate}, ${timePart}`;
}

function parsePayload(payload: unknown):
  | { ok: true; data: LegacyInitiationRequestBody }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Requête invalide." };
  }

  const source = payload as Partial<LegacyInitiationRequestBody>;
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

function buildLegacyResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      [LEGACY_ENDPOINT_HEADER]: "true",
    },
  });
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return buildLegacyResponse(
      {
        ok: false,
        error: "Origine de requête non autorisée.",
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
      },
      403
    );
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "legacy-initiation-request-form",
    identifier: requesterIp,
    limit: LEGACY_INITIATION_RATE_LIMIT_MAX_REQUESTS,
    windowMs: LEGACY_INITIATION_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return buildLegacyResponse(
      {
        ok: false,
        error: "Trop de tentatives. Merci de réessayer plus tard.",
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
      },
      429
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return buildLegacyResponse(
      {
        ok: false,
        error: "Impossible de lire la requête.",
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
      },
      400
    );
  }

  const parsed = parsePayload(payload);
  if (!parsed.ok) {
    return buildLegacyResponse(
      {
        ok: false,
        error: parsed.error,
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
      },
      400
    );
  }

  const selectedSlot = parsed.data.desiredSlot || parsed.data.desiredSlotYear;
  const formattedSlot = formatDesiredSlot(selectedSlot || "");
  const formattedMealOption = formatMealOption(parsed.data.mealOption || "");
  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const submittedAt = new Date();
  const clubEmail = process.env.EMAIL_TO || "golf@marcilly.com";
  const clubEmailName = process.env.EMAIL_TO_NAME?.trim();

  const text = [
    "Nouvelle demande d'initiation legacy",
    "",
    "Ce message provient de l'ancien endpoint /api/initiation-reservation.",
    `Parcours recommandé: ${RECOMMENDED_INITIATION_PATH}`,
    "",
    `Date: ${submittedAt.toISOString()}`,
    `Nom: ${parsed.data.lastName}`,
    `Prénom: ${parsed.data.firstName}`,
    `Téléphone: ${parsed.data.phone}`,
    `Email: ${parsed.data.email}`,
    `Créneau souhaité: ${formattedSlot}`,
    `Nombre de personnes: ${parsed.data.partySize || "-"}`,
    `Repas: ${formattedMealOption}`,
    "Commentaire:",
    parsed.data.note || "-",
  ].join("\n");

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: `[Initiation legacy] Demande - ${fullName}`,
      text,
      replyTo: parsed.data.email,
      replyToName: fullName,
    });

    try {
      await processContactFallbackQueue({ maxItems: 5 });
    } catch (queueError) {
      console.error("[legacy-initiation-reservation] fallback queue processing failed", {
        message: queueError instanceof Error ? queueError.message : "unknown",
      });
    }

    return buildLegacyResponse(
      {
        ok: true,
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
        message:
          "Votre demande legacy a bien été reçue. Pour les prochaines réservations, utilisez le parcours moderne.",
      },
      200
    );
  } catch (error) {
    const detail =
      error instanceof MailerError
        ? { code: error.code, message: error.message }
        : { code: "unknown", message: "Unknown mailer error" };
    console.error("[legacy-initiation-reservation] primary email failed", detail);

    try {
      await storeContactFallbackEntry({
        receivedAt: submittedAt.toISOString(),
        reason: `legacy-initiation-${detail.code}`,
        nom: parsed.data.lastName,
        prenom: parsed.data.firstName,
        entreprise: "",
        telephone: parsed.data.phone,
        email: parsed.data.email,
        message: [
          "[Legacy endpoint] /api/initiation-reservation",
          `Créneau souhaité: ${formattedSlot}`,
          `Nombre de personnes: ${parsed.data.partySize || "-"}`,
          `Repas: ${formattedMealOption}`,
          "Commentaire:",
          parsed.data.note || "-",
        ].join("\n"),
      });

      console.error(
        "[legacy-initiation-reservation] message stored in local fallback queue"
      );

      return buildLegacyResponse(
        {
          ok: true,
          legacy: true,
          recommendedPath: RECOMMENDED_INITIATION_PATH,
          message:
            "Votre demande legacy a bien été enregistrée. Notre équipe vous recontactera rapidement.",
        },
        200
      );
    } catch (fallbackError) {
      const fallbackDetail =
        fallbackError instanceof Error
          ? { message: fallbackError.message }
          : { message: "Unknown fallback error" };
      console.error(
        "[legacy-initiation-reservation] fallback storage failed",
        fallbackDetail
      );
    }

    if (error instanceof MailerError) {
      if (error.code === "auth") {
        return buildLegacyResponse(
          {
            ok: false,
            error:
              "Le service e-mail est temporairement indisponible. Merci de réessayer plus tard.",
            legacy: true,
            recommendedPath: RECOMMENDED_INITIATION_PATH,
          },
          503
        );
      }

      if (error.code === "config") {
        return buildLegacyResponse(
          {
            ok: false,
            error:
              "Le service e-mail n'est pas encore configuré. Merci de nous contacter par téléphone.",
            legacy: true,
            recommendedPath: RECOMMENDED_INITIATION_PATH,
          },
          500
        );
      }
    }

    return buildLegacyResponse(
      {
        ok: false,
        error:
          "Impossible d'envoyer la demande pour le moment. Merci de réessayer dans quelques instants.",
        legacy: true,
        recommendedPath: RECOMMENDED_INITIATION_PATH,
      },
      500
    );
  }
}

export function GET() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}
