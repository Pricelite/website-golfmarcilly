import ical from "node-ical";
import { parisDate } from "./request";

export type InitiationOption = { date: string; time: string };
export const INITIATION_LOOKAHEAD_DAYS = 183;

export async function parseInitiationOptions(ics: string, now = new Date()): Promise<InitiationOption[]> {
  if (!ics.trimStart().startsWith("BEGIN:VCALENDAR") || !ics.includes("END:VCALENDAR")) throw new Error("Invalid calendar feed");
  const calendar = await ical.async.parseICS(ics);
  const to = new Date(now.getTime() + INITIATION_LOOKAHEAD_DAYS * 86_400_000);
  const timeFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false });
  const slots = new Map<string, InitiationOption>();
  for (const event of Object.values(calendar)) {
    if (event?.type !== "VEVENT") continue;
    for (const instance of ical.expandRecurringEvent(event, { from: now, to })) {
      const title = typeof instance.summary === "string" ? instance.summary : instance.summary?.val || "";
      if (instance.isFullDay || instance.event.status === "CANCELLED" || instance.start <= now || instance.start > to) continue;
      // Only empty discovery sessions; never publish private groups or customer names.
      if (!/^\s*DEC\s*[-–—]?\s*VIDE\b/i.test(title)) continue;
      const slot = { date: parisDate(instance.start), time: timeFormat.format(instance.start) };
      slots.set(`${slot.date}|${slot.time}`, slot);
    }
  }
  return [...slots.values()].sort((a, b) => `${a.date}|${a.time}`.localeCompare(`${b.date}|${b.time}`));
}
