const DEFAULT_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=golfmarcilly45%40gmail.com&ctz=Europe%2FParis&showPrint=0&showTabs=0&showCalendars=0&showTz=0&color=%237BD148";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export const CALENDAR_EMBED_URL =
  process.env.NEXT_PUBLIC_CALENDAR_EMBED_URL?.trim() || DEFAULT_CALENDAR_EMBED_URL;

export const CALENDAR_DATA_REFRESH_SECONDS = parsePositiveInt(
  process.env.CALENDAR_DATA_REFRESH_SECONDS,
  60
);

export const CALENDAR_IFRAME_REFRESH_SECONDS = parsePositiveInt(
  process.env.NEXT_PUBLIC_CALENDAR_IFRAME_REFRESH_SECONDS,
  300
);

export function getCalendarIcsUrlsFromEnv(): string[] {
  const raw = process.env.CALENDAR_ICS_URLS;
  if (!raw) {
    return [];
  }

  return raw
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter((value) => value.startsWith("https://"));
}
