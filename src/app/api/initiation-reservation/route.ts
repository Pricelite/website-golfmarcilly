import { NextResponse } from "next/server";

import { storeContactFallbackEntry } from "@/lib/contact/fallback-store";
import { MailerError, sendMail } from "@/lib/email/mailer";

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

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parsePayload(payload: unknown):
  | { ok: true; data: InitiationReservationBody }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Requete invalide." };
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
      error: "Les champs nom, prenom, telephone et mail sont obligatoires.",
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  if (!desiredSlot && !desiredSlotYear) {
    return { ok: false, error: "Veuillez selectionner un creneau souhaite." };
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
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Impossible de lire la requete." },
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
    `Prenom: ${parsed.data.firstName}`,
    `Telephone: ${parsed.data.phone}`,
    `Email: ${parsed.data.email}`,
    `Creneau souhaite: ${selectedSlot}`,
    `Nombre de personnes: ${parsed.data.partySize || "-"}`,
    `Option repas: ${parsed.data.mealOption || "-"}`,
    "Commentaire:",
    parsed.data.note || "-",
  ].join("\n");

  try {
    await sendMail({
      to: clubEmail,
      toName: clubEmailName,
      subject: `[Initiation] Reservation - ${fullName}`,
      text,
      replyTo: parsed.data.email,
      replyToName: fullName,
    });

    return NextResponse.json({
      ok: true,
      message: "Votre message a bien ete recu. Nous revenons vers vous au plus vite.",
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
          `Creneau souhaite: ${selectedSlot}`,
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
          "Votre message a bien ete enregistre. Notre equipe vous recontactera rapidement.",
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
              "Le service e-mail est temporairement indisponible. Merci de reessayer plus tard.",
          },
          { status: 503 }
        );
      }

      if (error.code === "config") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Le service e-mail n'est pas encore configure. Merci de nous contacter par telephone.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossible d'envoyer la demande pour le moment. Merci de reessayer dans quelques instants.",
      },
      { status: 500 }
    );
  }
}
