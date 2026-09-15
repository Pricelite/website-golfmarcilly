import { generateTimeSlots } from "./slots";

export type ReservationRequestBody = {
  day: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_PARTY_SIZE = 30;
const MIN_ADVANCE_MINUTES = 30;
const PARIS_TIME_ZONE = "Europe/Paris";
const ALLOWED_SLOTS = new Set(generateTimeSlots("12:00", "14:30", 30));

function getParisDateTimeKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function isSlotAtLeastThirtyMinutesAhead(day: string, time: string, now: Date): boolean {
  const selectedDateTimeKey = `${day}T${time}`;
  const minAllowedDateTimeKey = getParisDateTimeKey(
    new Date(now.getTime() + MIN_ADVANCE_MINUTES * 60 * 1000)
  );

  return selectedDateTimeKey >= minAllowedDateTimeKey;
}

function isValidIsoDate(day: string): boolean {
  if (!DAY_PATTERN.test(day)) {
    return false;
  }

  const [yearRaw, monthRaw, dateRaw] = day.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const date = Number.parseInt(dateRaw, 10);
  const value = new Date(year, month - 1, date);

  return (
    value.getFullYear() === year &&
    value.getMonth() === month - 1 &&
    value.getDate() === date
  );
}

export function getRestaurantDays(now = new Date()): string[] {
  const today = getParisDateTimeKey(now).slice(0, 10);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today + "T12:00:00Z");
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function parseString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export function parseReservationPayload(payload: unknown, now = new Date()):
  | { ok: true; data: ReservationRequestBody }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Informations invalides." };
  }

  const source = payload as Record<string, unknown>;
  const day = parseString(source.day);
  const time = parseString(source.time);
  const name = parseString(source.name);
  const email = parseString(source.email);
  const phone = parseString(source.phone);
  const message = parseString(source.message);
  const partySizeRaw = source.partySize;
  const partySize =
    typeof partySizeRaw === "number"
      ? partySizeRaw
      : typeof partySizeRaw === "string" ? Number(partySizeRaw) : NaN;

  if (!isValidIsoDate(day)) {
    return { ok: false, error: "Date invalide." };
  }

  if (!getRestaurantDays(now).includes(day)) {
    return { ok: false, error: "La date doit être comprise dans les 7 prochains jours." };
  }

  if (!TIME_PATTERN.test(time) || !ALLOWED_SLOTS.has(time)) {
    return { ok: false, error: "Créneau invalide." };
  }

  if (!isSlotAtLeastThirtyMinutesAhead(day, time, now)) {
    return {
      ok: false,
      error:
        "Ce créneau est trop proche. Merci de réserver au moins 30 minutes avant l'heure choisie.",
    };
  }

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Nom invalide." };
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  if (phone.length > MAX_PHONE_LENGTH) {
    return { ok: false, error: "Téléphone invalide." };
  }

  if (
    !Number.isInteger(partySize) ||
    partySize < 1 ||
    partySize > MAX_PARTY_SIZE
  ) {
    return { ok: false, error: "Nombre de personnes invalide." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Message trop long." };
  }

  return {
    ok: true,
    data: {
      day,
      time,
      name,
      email,
      phone: phone || undefined,
      partySize,
      message: message || undefined,
    },
  };
}
