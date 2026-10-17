import { parisDateKey } from "../site-conditions";

// Optional for compatibility with existing callers and projects without a fixed date.
export function parseQuoteDate(value: unknown, now = new Date()): { ok: true; date: string } | { ok: false } {
  if (value === undefined || value === "") return { ok: true, date: "" };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false };
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < parisDateKey(now)) return { ok: false };
  return { ok: true, date: value };
}
