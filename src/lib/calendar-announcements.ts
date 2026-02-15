import {
  CALENDAR_DATA_REFRESH_SECONDS,
  CALENDAR_EMBED_URL,
  getCalendarIcsUrlsFromEnv,
} from "./calendar";
const PARIS_TIMEZONE = "Europe/Paris";

type RRule = {
  freq?: "DAILY" | "WEEKLY" | "MONTHLY";
  interval: number;
  byDay: string[];
  untilDateKey?: string;
  count?: number;
};

export type PlanningEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (local date)
  time?: string; // HH:mm
  url?: string;
  location?: string;
  calendarColor?: string;
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function dateKeyToNumber(dateKey: string): number {
  return Number.parseInt(dateKey.replaceAll("-", ""), 10);
}

function dateKeyToUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey
    .split("-")
    .map((value) => Number.parseInt(value, 10));

  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(dateKey: string, days: number): string {
  const base = dateKeyToUtcDate(dateKey);
  base.setUTCDate(base.getUTCDate() + days);

  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`;
}

function diffDays(startDateKey: string, endDateKey: string): number {
  const start = dateKeyToUtcDate(startDateKey);
  const end = dateKeyToUtcDate(endDateKey);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function diffMonths(startDateKey: string, endDateKey: string): number {
  const [startYear, startMonth] = startDateKey
    .split("-")
    .map((value) => Number.parseInt(value, 10));
  const [endYear, endMonth] = endDateKey
    .split("-")
    .map((value) => Number.parseInt(value, 10));

  return (endYear - startYear) * 12 + (endMonth - startMonth);
}

function maxDateKey(a: string, b: string): string {
  return dateKeyToNumber(a) >= dateKeyToNumber(b) ? a : b;
}

export function getDateKeyInTimeZone(
  date: Date,
  timeZone: string = PARIS_TIMEZONE
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getDaysUntil(dateKey: string, todayKey: string): number {
  return diffDays(todayKey, dateKey);
}

export function selectUpcomingPlanningEvents(
  events: readonly PlanningEvent[],
  options?: {
    today?: Date;
    daysAhead?: number;
    limit?: number;
    timeZone?: string;
  }
): PlanningEvent[] {
  const timeZone = options?.timeZone ?? PARIS_TIMEZONE;
  const todayKey = getDateKeyInTimeZone(options?.today ?? new Date(), timeZone);
  const daysAhead = options?.daysAhead ?? 7;
  const limit = options?.limit;
  const start = dateKeyToNumber(todayKey);
  const end = dateKeyToNumber(addDays(todayKey, daysAhead));

  const selected = [...events]
    .filter((event) => {
      const value = dateKeyToNumber(event.date);
      return value >= start && value <= end;
    })
    .sort((a, b) => {
      const dateDiff = dateKeyToNumber(a.date) - dateKeyToNumber(b.date);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      const aTime = a.time ?? "99:99";
      const bTime = b.time ?? "99:99";
      return aTime.localeCompare(bTime);
    });

  if (typeof limit === "number") {
    return selected.slice(0, Math.max(0, limit));
  }

  return selected;
}

type CalendarSource = {
  id: string;
  color?: string;
};

type CalendarFeedSource = {
  icsUrl: string;
  color?: string;
};

function normalizeCalendarColor(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  if (/^[0-9a-f]{6}$/.test(trimmed)) {
    return `#${trimmed}`;
  }

  return trimmed;
}

function parseHexColor(value: string): [number, number, number] | null {
  const match = value.match(/^#?([0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function isGreenOrBlueColor(color: string | undefined): boolean {
  const normalized = normalizeCalendarColor(color);
  if (!normalized) {
    return false;
  }

  if (normalized.includes("green") || normalized.includes("blue")) {
    return true;
  }

  const rgb = parseHexColor(normalized);
  if (!rgb) {
    return false;
  }

  const [r, g, b] = rgb;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread < 16) {
    return false;
  }

  return (g >= r && g >= b) || (b >= r && b >= g);
}

function getCalendarSourcesFromEmbedUrl(embedUrl: string): CalendarSource[] {
  try {
    const url = new URL(embedUrl);
    const sources = url.searchParams
      .getAll("src")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const colors = url.searchParams.getAll("color").map(normalizeCalendarColor);

    const mapped = sources.map((id, index) => ({
      id,
      color: colors[index],
    }));

    return mapped.filter(
      (source, index, all) =>
        all.findIndex(
          (entry) => entry.id === source.id && entry.color === source.color
        ) === index
    );
  } catch {
    return [];
  }
}

function getCalendarFeedSources(): CalendarFeedSource[] {
  const configuredIcsUrls = getCalendarIcsUrlsFromEnv();
  if (configuredIcsUrls.length > 0) {
    return configuredIcsUrls.map((icsUrl) => ({ icsUrl }));
  }

  return getCalendarSourcesFromEmbedUrl(CALENDAR_EMBED_URL).map(({ id, color }) => ({
    icsUrl: `https://calendar.google.com/calendar/ical/${encodeURIComponent(
      id
    )}/public/basic.ics`,
    color,
  }));
}

function unescapeIcsText(value: string): string {
  return value
    .replaceAll("\\n", " ")
    .replaceAll("\\,", ",")
    .replaceAll("\\;", ";")
    .replaceAll("\\\\", "\\")
    .trim();
}

function parseDateOnly(value: string): string | null {
  if (!/^\d{8}$/.test(value)) {
    return null;
  }

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function toParisDateAndTime(utcValue: string): { date: string; time: string } | null {
  const match = utcValue.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
  );

  if (!match) {
    return null;
  }

  const [, y, m, d, hh, mm, ss] = match;
  const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
  const dateKey = getDateKeyInTimeZone(date, PARIS_TIMEZONE);
  const time = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return { date: dateKey, time };
}

function parseLocalDateTime(value: string): { date: string; time: string } | null {
  const match = value.match(/^(\d{8})T(\d{2})(\d{2})/);
  if (!match) {
    return null;
  }

  const date = parseDateOnly(match[1]);
  if (!date) {
    return null;
  }

  return { date, time: `${match[2]}:${match[3]}` };
}

function parseDtStart(line: string): { date: string; time?: string } | null {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return null;
  }

  const value = line.slice(separatorIndex + 1).trim();

  if (line.includes("VALUE=DATE")) {
    const date = parseDateOnly(value);
    return date ? { date } : null;
  }

  if (value.endsWith("Z")) {
    const utc = toParisDateAndTime(value);
    return utc ?? null;
  }

  const local = parseLocalDateTime(value);
  return local ?? null;
}

function unfoldIcsLines(ics: string): string[] {
  return ics
    .replace(/\r\n[ \t]/g, "")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
}

function getIcsPropertyRawValue(
  lines: readonly string[],
  propertyName: string
): string | undefined {
  const prefix = `${propertyName.toUpperCase()}`;
  const line = lines.find((entry) => {
    const upper = entry.toUpperCase();
    return upper.startsWith(`${prefix}:`) || upper.startsWith(`${prefix};`);
  });

  if (!line) {
    return undefined;
  }

  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return undefined;
  }

  return line.slice(separatorIndex + 1).trim();
}

function dayCodeFromDateKey(dateKey: string): string {
  const date = dateKeyToUtcDate(dateKey);
  const day = date.getUTCDay();
  const codes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return codes[day];
}

function parseRRule(rruleLine: string): RRule {
  const raw = rruleLine.startsWith("RRULE:")
    ? rruleLine.slice("RRULE:".length)
    : rruleLine;

  const values = raw.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const freqRaw = values.FREQ;
  const freq =
    freqRaw === "DAILY" || freqRaw === "WEEKLY" || freqRaw === "MONTHLY"
      ? freqRaw
      : undefined;

  const interval = Number.parseInt(values.INTERVAL ?? "1", 10);
  const untilMatch = values.UNTIL?.match(/^(\d{8})/);
  const untilDateKey = untilMatch ? parseDateOnly(untilMatch[1]) ?? undefined : undefined;
  const count = values.COUNT ? Number.parseInt(values.COUNT, 10) : undefined;
  const byDay = values.BYDAY ? values.BYDAY.split(",").filter(Boolean) : [];

  return {
    freq,
    interval: Number.isFinite(interval) && interval > 0 ? interval : 1,
    byDay,
    untilDateKey,
    count: Number.isFinite(count ?? Number.NaN) ? count : undefined,
  };
}

function matchesRRuleOnDay(
  dayKey: string,
  startDateKey: string,
  rule: RRule
): boolean {
  const days = diffDays(startDateKey, dayKey);
  if (days < 0) {
    return false;
  }

  const baseDayCode = dayCodeFromDateKey(startDateKey);
  const allowedDays = rule.byDay.length > 0 ? rule.byDay : [baseDayCode];

  if (rule.freq === "DAILY") {
    return days % rule.interval === 0;
  }

  if (rule.freq === "WEEKLY") {
    const weekIndex = Math.floor(days / 7);
    if (weekIndex % rule.interval !== 0) {
      return false;
    }

    return allowedDays.includes(dayCodeFromDateKey(dayKey));
  }

  if (rule.freq === "MONTHLY") {
    const months = diffMonths(startDateKey, dayKey);
    if (months < 0 || months % rule.interval !== 0) {
      return false;
    }

    const startDay = startDateKey.split("-")[2];
    const day = dayKey.split("-")[2];
    return day === startDay;
  }

  return false;
}

function expandRecurringEvent(
  baseEvent: PlanningEvent,
  rruleLine: string,
  windowStartKey: string,
  windowEndKey: string
): PlanningEvent[] {
  const rule = parseRRule(rruleLine);

  if (!rule.freq) {
    return [baseEvent];
  }

  let cursor = baseEvent.date;
  const result: PlanningEvent[] = [];
  let occurrenceCount = 0;

  const safeStart = maxDateKey(baseEvent.date, windowStartKey);
  if (dateKeyToNumber(safeStart) > dateKeyToNumber(windowEndKey)) {
    return [];
  }

  while (dateKeyToNumber(cursor) <= dateKeyToNumber(windowEndKey)) {
    if (rule.untilDateKey && dateKeyToNumber(cursor) > dateKeyToNumber(rule.untilDateKey)) {
      break;
    }

    if (matchesRRuleOnDay(cursor, baseEvent.date, rule)) {
      occurrenceCount += 1;

      if (rule.count && occurrenceCount > rule.count) {
        break;
      }

      if (dateKeyToNumber(cursor) >= dateKeyToNumber(windowStartKey)) {
        result.push({
          ...baseEvent,
          id: `${baseEvent.id}-${cursor}`,
          date: cursor,
        });
      }
    }

    cursor = addDays(cursor, 1);
  }

  return result;
}

function parseIcsEvents(
  ics: string,
  options?: { windowStartKey?: string; windowEndKey?: string }
): PlanningEvent[] {
  const lines = unfoldIcsLines(ics);
  const events: PlanningEvent[] = [];
  let block: string[] = [];
  let insideEvent = false;

  const defaultStart = getDateKeyInTimeZone(new Date(), PARIS_TIMEZONE);
  const windowStartKey = options?.windowStartKey ?? defaultStart;
  const windowEndKey = options?.windowEndKey ?? addDays(windowStartKey, 31);

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      insideEvent = true;
      block = [];
      continue;
    }

    if (line === "END:VEVENT") {
      insideEvent = false;

      const uid = getIcsPropertyRawValue(block, "UID");
      const summary = getIcsPropertyRawValue(block, "SUMMARY");
      const dtStart = block.find((entry) => entry.startsWith("DTSTART"));
      const rrule = getIcsPropertyRawValue(block, "RRULE");
      const url = getIcsPropertyRawValue(block, "URL");
      const location = getIcsPropertyRawValue(block, "LOCATION");
      const eventColor = getIcsPropertyRawValue(block, "COLOR");

      if (!summary || !dtStart) {
        continue;
      }

      const parsedDate = parseDtStart(dtStart);
      if (!parsedDate) {
        continue;
      }

      const baseEvent: PlanningEvent = {
        id: uid || `${summary}-${parsedDate.date}`,
        title: unescapeIcsText(summary),
        date: parsedDate.date,
        time: parsedDate.time,
        url: url ? unescapeIcsText(url) : undefined,
        location: location ? unescapeIcsText(location) : undefined,
        calendarColor: normalizeCalendarColor(
          eventColor ? unescapeIcsText(eventColor) : undefined
        ),
      };

      if (rrule) {
        events.push(
          ...expandRecurringEvent(
            baseEvent,
            `RRULE:${rrule}`,
            windowStartKey,
            windowEndKey
          )
        );
      } else {
        events.push(baseEvent);
      }

      block = [];
      continue;
    }

    if (insideEvent) {
      block.push(line);
    }
  }

  const deduped = new Map<string, PlanningEvent>();
  for (const event of events) {
    const key = `${event.id}-${event.date}-${event.time ?? ""}`;
    deduped.set(key, event);
  }

  return [...deduped.values()];
}

export async function fetchPlanningEventsFromExistingCalendar(
  options?: { daysAhead?: number }
): Promise<PlanningEvent[]> {
  const calendarFeeds = getCalendarFeedSources();
  if (calendarFeeds.length === 0) {
    return [];
  }

  const todayKey = getDateKeyInTimeZone(new Date(), PARIS_TIMEZONE);
  const windowEndKey = addDays(todayKey, Math.max(options?.daysAhead ?? 31, 31));

  const allCalendars = await Promise.all(
    calendarFeeds.map(async ({ icsUrl, color }) => {
      try {
        const response = await fetch(icsUrl, {
          next: { revalidate: CALENDAR_DATA_REFRESH_SECONDS },
          headers: { accept: "text/calendar" },
        });

        if (!response.ok) {
          return [] as PlanningEvent[];
        }

        const ics = await response.text();
        return parseIcsEvents(ics, {
          windowStartKey: todayKey,
          windowEndKey,
        }).map((event) => ({
          ...event,
          calendarColor: event.calendarColor ?? color,
        }));
      } catch {
        return [] as PlanningEvent[];
      }
    })
  );

  const merged = allCalendars.flat();
  const highlightedEvents = merged.filter((event) =>
    isGreenOrBlueColor(event.calendarColor)
  );
  const eventsToAnnounce =
    highlightedEvents.length > 0 ? highlightedEvents : merged;

  const deduped = new Map<string, PlanningEvent>();
  for (const event of eventsToAnnounce) {
    const key = `${event.title}-${event.date}-${event.time ?? ""}-${event.location ?? ""}`;
    deduped.set(key, event);
  }

  return [...deduped.values()];
}

export async function getUpcomingPlanningAnnouncements(
  options?: { limit?: number; daysAhead?: number }
): Promise<PlanningEvent[]> {
  const daysAhead = options?.daysAhead ?? 7;
  const events = await fetchPlanningEventsFromExistingCalendar({ daysAhead });

  return selectUpcomingPlanningEvents(events, {
    limit: options?.limit,
    daysAhead,
  });
}

