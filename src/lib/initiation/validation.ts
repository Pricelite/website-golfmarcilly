import {
  INITIATION_PRICE_PER_PERSON_CENTS,
  INITIATION_SLOT_CAPACITY,
} from "./constants";
import {
  isAllowedBookingSlot,
  isDateWithinBookingWindow,
  resolveEndTimeForStart,
} from "./time";
import type { InitiationMealOption } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.-]{6,30}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_FULL_NAME_LENGTH = 120;

export type CreateInitiationReservationInput = {
  date: string;
  startTime: string;
  endTime: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  mealOption: InitiationMealOption;
  pricePerPersonCents: number;
  totalPriceCents: number;
};

function parseString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function parseInteger(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  return Number.parseInt(String(value ?? ""), 10);
}

function parseMealOption(value: string): InitiationMealOption | null {
  if (value === "WITH_MEAL" || value === "WITHOUT_MEAL") {
    return value;
  }
  return null;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function parseCreateReservationPayload(
  payload: unknown,
  now: Date = new Date()
):
  | { ok: true; data: CreateInitiationReservationInput }
  | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload." };
  }

  const source = payload as Record<string, unknown>;
  const date = parseString(source.date);
  const startTime = parseString(source.startTime);
  const suppliedEndTime = parseString(source.endTime);
  const fullName = parseString(source.fullName);
  const email = parseString(source.email).toLowerCase();
  const phone = parseString(source.phone);
  const participantsCount = parseInteger(source.participantsCount);
  const mealOption = parseMealOption(parseString(source.mealOption));
  const resolvedEndTime = resolveEndTimeForStart(startTime);
  const endTime = suppliedEndTime || resolvedEndTime || "";

  if (!isDateWithinBookingWindow(date, now)) {
    return {
      ok: false,
      error: "Booking date must be within the next 7 days.",
    };
  }

  if (!isAllowedBookingSlot(date, startTime, endTime, now)) {
    return { ok: false, error: "Selected slot is not available." };
  }

  if (
    !Number.isInteger(participantsCount) ||
    participantsCount < 1 ||
    participantsCount > INITIATION_SLOT_CAPACITY
  ) {
    return {
      ok: false,
      error: `Participants count must be between 1 and ${INITIATION_SLOT_CAPACITY}.`,
    };
  }

  if (!mealOption) {
    return { ok: false, error: "Meal option is required." };
  }

  if (!fullName || fullName.length > MAX_FULL_NAME_LENGTH) {
    return { ok: false, error: "Full name is invalid." };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Email is invalid." };
  }

  if (!phone || !PHONE_PATTERN.test(phone)) {
    return { ok: false, error: "Phone is invalid." };
  }

  const pricePerPersonCents = INITIATION_PRICE_PER_PERSON_CENTS[mealOption];
  const totalPriceCents = participantsCount * pricePerPersonCents;

  return {
    ok: true,
    data: {
      date,
      startTime,
      endTime,
      fullName,
      email,
      phone,
      participantsCount,
      mealOption,
      pricePerPersonCents,
      totalPriceCents,
    },
  };
}

