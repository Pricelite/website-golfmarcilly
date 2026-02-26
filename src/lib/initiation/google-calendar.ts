import "server-only";

import { createSign } from "node:crypto";

import { INITIATION_SLOT_CAPACITY } from "./constants";
import { buildAllowedWeekendSlots } from "./time";
import type { InitiationMealOption, InitiationSlot } from "./types";

type GoogleCalendarEvent = {
  id?: string;
  htmlLink?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: {
    private?: Record<string, string | undefined>;
  };
};

type GoogleCalendarEnv = {
  calendarId: string;
  clientEmail: string;
  privateKey: string;
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const DEFAULT_INITIATION_CALENDAR_ID =
  "mv4qumtlbp8t34cihjgerkddqc@group.calendar.google.com";
const CALENDAR_TIME_ZONE = "Europe/Paris";

let tokenCache:
  | {
      accessToken: string;
      expiresAtMs: number;
    }
  | null = null;

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signJwt(assertionInput: string, privateKey: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(assertionInput);
  signer.end();
  return signer.sign(privateKey, "base64url");
}

function parsePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

function readGoogleCalendarEnv(): {
  env: GoogleCalendarEnv | null;
  missing: string[];
} {
  const calendarId =
    process.env.GOOGLE_CALENDAR_INITIATION_ID?.trim() ||
    DEFAULT_INITIATION_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL?.trim() || "";
  const privateKeyRaw = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.trim() || "";
  const missing: string[] = [];

  if (!clientEmail) {
    missing.push("GOOGLE_CALENDAR_CLIENT_EMAIL");
  }
  if (!privateKeyRaw) {
    missing.push("GOOGLE_CALENDAR_PRIVATE_KEY");
  }

  if (missing.length > 0) {
    return { env: null, missing };
  }

  return {
    env: {
      calendarId,
      clientEmail,
      privateKey: parsePrivateKey(privateKeyRaw),
    },
    missing: [],
  };
}

export function hasGoogleCalendarEnv(): boolean {
  return readGoogleCalendarEnv().env !== null;
}

export function getMissingGoogleCalendarEnv(): string[] {
  return readGoogleCalendarEnv().missing;
}

function getGoogleCalendarEnvOrThrow(): GoogleCalendarEnv {
  const { env, missing } = readGoogleCalendarEnv();
  if (!env) {
    throw new Error(
      `Missing required env var: ${missing.join(", ")}`
    );
  }
  return env;
}

function buildJwtAssertion(env: GoogleCalendarEnv): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60;
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.clientEmail,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: issuedAt,
    exp: expiresAt,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = signJwt(unsignedToken, env.privateKey);

  return `${unsignedToken}.${signature}`;
}

async function getGoogleAccessToken(env: GoogleCalendarEnv): Promise<string> {
  if (tokenCache && tokenCache.expiresAtMs - Date.now() > 60_000) {
    return tokenCache.accessToken;
  }

  const assertion = buildJwtAssertion(env);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as
    | { access_token?: string; expires_in?: number; error_description?: string }
    | undefined;

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ||
        `Google token request failed (${response.status})`
    );
  }

  tokenCache = {
    accessToken: payload.access_token,
    expiresAtMs: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };

  return payload.access_token;
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  return {
    year: Number.parseInt(yearRaw, 10),
    month: Number.parseInt(monthRaw, 10),
    day: Number.parseInt(dayRaw, 10),
  };
}

function parseTimeValue(time: string): { hour: number; minute: number } {
  const [hourRaw, minuteRaw] = time.split(":");
  return {
    hour: Number.parseInt(hourRaw, 10),
    minute: Number.parseInt(minuteRaw, 10),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number.parseInt(parts.find((entry) => entry.type === type)?.value ?? "0", 10);
  const asUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second")
  );

  return asUtc - date.getTime();
}

function toUtcDateFromParis(dateKey: string, time: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  const { hour, minute } = parseTimeValue(time);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetFirst = getTimeZoneOffsetMs(utcGuess, CALENDAR_TIME_ZONE);
  const firstPass = new Date(utcGuess.getTime() - offsetFirst);
  const offsetSecond = getTimeZoneOffsetMs(firstPass, CALENDAR_TIME_ZONE);

  if (offsetSecond !== offsetFirst) {
    return new Date(utcGuess.getTime() - offsetSecond);
  }

  return firstPass;
}

function addOneDay(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + 1);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getEventRange(event: GoogleCalendarEvent): { start: Date; end: Date } | null {
  const startRaw = event.start?.dateTime ?? event.start?.date;
  const endRaw = event.end?.dateTime ?? event.end?.date;
  if (!startRaw || !endRaw) {
    return null;
  }

  const start = new Date(startRaw);
  const end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return { start, end };
}

function parseParticipantsCount(event: GoogleCalendarEvent): number {
  const privateCount = event.extendedProperties?.private?.participantsCount;
  if (privateCount) {
    const parsed = Number.parseInt(privateCount, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const fromDescription = /participants_count\s*:\s*(\d+)/i.exec(
    event.description ?? ""
  );
  if (fromDescription) {
    const parsed = Number.parseInt(fromDescription[1], 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1;
}

async function listCalendarEvents(params: {
  env: GoogleCalendarEnv;
  timeMinIso: string;
  timeMaxIso: string;
}): Promise<GoogleCalendarEvent[]> {
  const accessToken = await getGoogleAccessToken(params.env);
  const url = new URL(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
      params.env.calendarId
    )}/events`
  );
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeZone", CALENDAR_TIME_ZONE);
  url.searchParams.set("timeMin", params.timeMinIso);
  url.searchParams.set("timeMax", params.timeMaxIso);
  url.searchParams.set("maxResults", "2500");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = (await response.json()) as
    | { items?: GoogleCalendarEvent[]; error?: { message?: string } }
    | undefined;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `Google Calendar events fetch failed (${response.status})`
    );
  }

  return payload?.items ?? [];
}

export async function getGoogleCalendarSlotAvailability(
  now: Date = new Date()
): Promise<InitiationSlot[]> {
  const env = getGoogleCalendarEnvOrThrow();
  const slots = buildAllowedWeekendSlots(now);
  if (slots.length === 0) {
    return [];
  }

  const dates = slots.map((slot) => slot.date);
  const minDate = dates.reduce((a, b) => (a < b ? a : b));
  const maxDate = dates.reduce((a, b) => (a > b ? a : b));
  const timeMinIso = toUtcDateFromParis(minDate, "00:00").toISOString();
  const timeMaxIso = toUtcDateFromParis(addOneDay(maxDate), "00:00").toISOString();
  const events = await listCalendarEvents({ env, timeMinIso, timeMaxIso });

  return slots.map((slot) => {
    const slotStart = toUtcDateFromParis(slot.date, slot.startTime);
    const slotEnd = toUtcDateFromParis(slot.date, slot.endTime);
    let reservedSeats = 0;

    for (const event of events) {
      const range = getEventRange(event);
      if (!range) {
        continue;
      }
      const overlaps = range.start < slotEnd && range.end > slotStart;
      if (!overlaps) {
        continue;
      }
      reservedSeats += parseParticipantsCount(event);
    }

    const remainingSeats = Math.max(0, INITIATION_SLOT_CAPACITY - reservedSeats);

    return {
      id: `${slot.date}|${slot.startTime}|${slot.endTime}`,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: INITIATION_SLOT_CAPACITY,
      reservedSeats,
      remainingSeats,
    };
  });
}

export async function createGoogleCalendarReservation(input: {
  date: string;
  startTime: string;
  endTime: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  mealOption: InitiationMealOption;
}): Promise<{ eventId: string; htmlLink?: string }> {
  const env = getGoogleCalendarEnvOrThrow();
  const slots = await getGoogleCalendarSlotAvailability();
  const selectedSlot = slots.find(
    (slot) =>
      slot.date === input.date &&
      slot.startTime === input.startTime &&
      slot.endTime === input.endTime
  );

  if (!selectedSlot || selectedSlot.remainingSeats < input.participantsCount) {
    throw new Error("CAPACITY_EXCEEDED");
  }

  const accessToken = await getGoogleAccessToken(env);
  const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
    env.calendarId
  )}/events`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: "Creneau indisponible - Initiation golf",
      visibility: "private",
      start: {
        dateTime: `${input.date}T${input.startTime}:00`,
        timeZone: CALENDAR_TIME_ZONE,
      },
      end: {
        dateTime: `${input.date}T${input.endTime}:00`,
        timeZone: CALENDAR_TIME_ZONE,
      },
      extendedProperties: {
        private: {
          participantsCount: String(input.participantsCount),
          mealOption: input.mealOption,
          source: "website-golfmarcilly",
        },
      },
    }),
  });

  const payload = (await response.json()) as
    | { id?: string; htmlLink?: string; error?: { message?: string } }
    | undefined;

  if (!response.ok || !payload?.id) {
    throw new Error(
      payload?.error?.message ||
        `Google Calendar reservation creation failed (${response.status})`
    );
  }

  return { eventId: payload.id, htmlLink: payload.htmlLink };
}
