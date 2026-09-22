import { INITIATION_PRICE_PER_PERSON_CENTS } from "./constants";

export function parisDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function parseInitiationRequest(value: unknown, now = new Date()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false as const, error: "Demande invalide." };
  const input = value as Record<string, unknown>;
  const str = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
  const date = str("date"), startTime = str("startTime"), fullName = str("fullName");
  const email = str("email").toLowerCase(), phone = str("phone"), note = str("note");
  const mealOption = str("mealOption");
  const participantsCount = input.participantsCount;
  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || date < parisDate(now)) return { ok: false as const, error: "Choisissez une date valide, aujourd’hui ou à venir." };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return { ok: false as const, error: "Indiquez l’horaire souhaité." };
  const parisTime = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  if (date === parisDate(now) && startTime <= parisTime) return { ok: false as const, error: "Choisissez un horaire à venir." };
  if (!fullName || fullName.length > 120 || /[\r\n]/.test(fullName)) return { ok: false as const, error: "Indiquez votre nom et prénom." };
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, error: "Indiquez une adresse e-mail valide." };
  if (!/^[+()\d .-]{6,30}$/.test(phone)) return { ok: false as const, error: "Indiquez un numéro de téléphone valide." };
  if (typeof participantsCount !== "number" || !Number.isInteger(participantsCount) || participantsCount < 1 || participantsCount > 12) return { ok: false as const, error: "Choisissez entre 1 et 12 participants." };
  if (mealOption !== "WITH_MEAL" && mealOption !== "WITHOUT_MEAL") return { ok: false as const, error: "Choisissez une formule." };
  if (note.length > 2000) return { ok: false as const, error: "Votre commentaire est limité à 2 000 caractères." };
  return { ok: true as const, data: { date, startTime, fullName, email, phone, participantsCount, mealOption, note, totalPriceCents: participantsCount * INITIATION_PRICE_PER_PERSON_CENTS[mealOption] } };
}

export function buildInitiationRequestEmail(data: Extract<ReturnType<typeof parseInitiationRequest>, { ok: true }>['data']) {
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "Europe/Paris" }).format(new Date(`${data.date}T12:00:00Z`));
  const total = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(data.totalPriceCents / 100);
  return {
    subject: `[Initiation] Demande pour le ${data.date} à ${data.startTime}`,
    replyTo: data.email,
    replyToName: data.fullName,
    text: ["Nouvelle demande de réservation d’initiation", "", "À confirmer par votre équipe : aucune place n’est réservée automatiquement.", "Répondez à ce mail pour confirmer la disponibilité au visiteur.", "", `Date souhaitée : ${date}`, `Horaire souhaité : ${data.startTime}`, `Nom et prénom : ${data.fullName}`, `E-mail : ${data.email}`, `Téléphone : ${data.phone}`, `Participants : ${data.participantsCount}`, `Formule : ${data.mealOption === "WITH_MEAL" ? "Avec repas" : "Sans repas"}`, `Total estimé : ${total}`, "Règlement sur place, après confirmation de la réservation.", "", `Commentaire : ${data.note || "Aucun"}`].join("\n"),
  };
}
