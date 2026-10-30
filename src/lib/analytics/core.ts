export const ANALYTICS_TIME_ZONE = "Europe/Paris";
export const VISIT_TIMEOUT_MS = 30 * 60_000;

export function needsNewVisit(visitId: string | null, previousAt: number, now: number): boolean {
  return !visitId || !Number.isFinite(previousAt) || previousAt <= 0 || previousAt > now || now - previousAt > VISIT_TIMEOUT_MS;
}

export function parisDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ANALYTICS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(day: string, count: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

export function reportRange(start: unknown, end: unknown, today: string): { start: string; end: string; previousStart: string; previousEnd: string } | null {
  if (!validDay(start) || !validDay(end) || end < start || end > today) return null;
  const days = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000) + 1;
  if (days < 1 || days > 366) return null;
  return { start, end, previousStart: addDays(start, -days), previousEnd: addDays(start, -1) };
}

export function publicPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 300 || !/^\/[\p{L}\p{N}/_%.-]*$/u.test(value)) return null;
  if (value.startsWith("/admin") || value.startsWith("/api") || value.startsWith("/_next")) return null;
  return value.length > 1 ? value.replace(/\/$/, "") : value;
}

export function isIdentifiableBot(agent: string | null): boolean {
  return !agent || /bot|crawler|spider|slurp|preview|headless|lighthouse|monitor|facebookexternalhit|curl|wget/i.test(agent);
}

export function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
