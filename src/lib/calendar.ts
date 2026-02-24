const DEFAULT_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=golfmarcilly45%40gmail.com&ctz=Europe%2FParis&showPrint=0&showTabs=0&showCalendars=0&showTz=0&color=%237BD148";
const DEFAULT_INITIATION_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=mv4qumtlbp8t34cihjgerkddqc%40group.calendar.google.com&ctz=Europe%2FParis";
const PLACEHOLDER_PATTERN = /<[^>]+>/;

function hasCalendarPlaceholder(value: string): boolean {
  return (
    PLACEHOLDER_PATTERN.test(value) ||
    value.toLowerCase().includes("calendar_id")
  );
}

function sanitizeCalendarEmbedUrl(
  value: string | undefined,
  fallbackUrl: string = DEFAULT_CALENDAR_EMBED_URL
): string {
  if (!value) {
    return fallbackUrl;
  }

  const trimmed = value.trim();
  if (!trimmed || hasCalendarPlaceholder(trimmed)) {
    return fallbackUrl;
  }

  try {
    const url = new URL(trimmed);
    const isGoogleCalendarHost =
      url.protocol === "https:" && url.hostname === "calendar.google.com";

    if (!isGoogleCalendarHost) {
      return fallbackUrl;
    }

    if (!url.pathname.startsWith("/calendar/embed")) {
      return fallbackUrl;
    }

    const calendarId = url.searchParams.get("src")?.trim();
    if (!calendarId || hasCalendarPlaceholder(calendarId)) {
      return fallbackUrl;
    }

    if (!url.searchParams.has("ctz")) {
      url.searchParams.set("ctz", "Europe/Paris");
    }

    if (!url.searchParams.has("showPrint")) {
      url.searchParams.set("showPrint", "0");
    }

    if (!url.searchParams.has("showTabs")) {
      url.searchParams.set("showTabs", "0");
    }

    if (!url.searchParams.has("showCalendars")) {
      url.searchParams.set("showCalendars", "0");
    }

    if (!url.searchParams.has("showTz")) {
      url.searchParams.set("showTz", "0");
    }

    if (!url.searchParams.has("color")) {
      url.searchParams.set("color", "#7BD148");
    }

    return url.toString();
  } catch {
    return fallbackUrl;
  }
}

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
  sanitizeCalendarEmbedUrl(process.env.NEXT_PUBLIC_CALENDAR_EMBED_URL);

export const INITIATION_CALENDAR_EMBED_URL = sanitizeCalendarEmbedUrl(
  process.env.NEXT_PUBLIC_INITIATION_CALENDAR_EMBED_URL,
  DEFAULT_INITIATION_CALENDAR_EMBED_URL
);

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
    .filter(
      (value) => value.startsWith("https://") && !hasCalendarPlaceholder(value)
    );
}
