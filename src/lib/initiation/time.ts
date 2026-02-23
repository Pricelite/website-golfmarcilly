import {
  INITIATION_MAX_DAYS_AHEAD,
  INITIATION_SLOT_TEMPLATES,
  INITIATION_TIME_ZONE,
} from "./constants";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function parseIsoDateKey(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function formatIsoDateKey(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day
  ).padStart(2, "0")}`;
}

function addDays(dateKey: string, days: number): string {
  const parsed = parseIsoDateKey(dateKey);
  if (!parsed) {
    throw new Error(`Invalid ISO date key: ${dateKey}`);
  }

  const next = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  next.setUTCDate(next.getUTCDate() + days);

  return formatIsoDateKey({
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  });
}

export function getParisTodayIsoDateKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INITIATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number.parseInt(
    parts.find((part) => part.type === "year")?.value ?? "",
    10
  );
  const month = Number.parseInt(
    parts.find((part) => part.type === "month")?.value ?? "",
    10
  );
  const day = Number.parseInt(
    parts.find((part) => part.type === "day")?.value ?? "",
    10
  );

  return formatIsoDateKey({ year, month, day });
}

export function getAllowedBookingDateKeys(now: Date = new Date()): string[] {
  const today = getParisTodayIsoDateKey(now);
  const keys: string[] = [];

  for (let dayOffset = 0; dayOffset <= INITIATION_MAX_DAYS_AHEAD; dayOffset += 1) {
    keys.push(addDays(today, dayOffset));
  }

  return keys;
}

export function isDateWithinBookingWindow(
  dateKey: string,
  now: Date = new Date()
): boolean {
  return getAllowedBookingDateKeys(now).includes(dateKey);
}

export function isWeekendBookingDate(dateKey: string): boolean {
  const parsed = parseIsoDateKey(dateKey);
  if (!parsed) {
    return false;
  }

  const dayIndex = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day)
  ).getUTCDay();

  return dayIndex === 5 || dayIndex === 6 || dayIndex === 0;
}

export function isAllowedInitiationSlotTime(
  startTime: string,
  endTime: string
): boolean {
  return INITIATION_SLOT_TEMPLATES.some(
    (slot) => slot.startTime === startTime && slot.endTime === endTime
  );
}

export function resolveEndTimeForStart(startTime: string): string | null {
  const slot = INITIATION_SLOT_TEMPLATES.find(
    (template) => template.startTime === startTime
  );
  return slot?.endTime ?? null;
}

export function buildAllowedWeekendSlots(now: Date = new Date()): Array<{
  date: string;
  startTime: string;
  endTime: string;
}> {
  const dates = getAllowedBookingDateKeys(now).filter(isWeekendBookingDate);
  const slots: Array<{ date: string; startTime: string; endTime: string }> = [];

  for (const date of dates) {
    for (const template of INITIATION_SLOT_TEMPLATES) {
      slots.push({
        date,
        startTime: template.startTime,
        endTime: template.endTime,
      });
    }
  }

  return slots;
}

export function isAllowedBookingSlot(
  date: string,
  startTime: string,
  endTime: string,
  now: Date = new Date()
): boolean {
  return (
    isDateWithinBookingWindow(date, now) &&
    isWeekendBookingDate(date) &&
    isAllowedInitiationSlotTime(startTime, endTime)
  );
}

