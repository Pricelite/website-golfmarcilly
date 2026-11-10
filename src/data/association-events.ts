import agenda2027 from "./association-events-2027.json";
import context2027 from "./association-calendar-context-2027.json";
import clubProgramme from "./association-club-events-2026-2027.json";

export const associationCalendarStartsOn = "2026-11-01";

export type AssociationEvent = {
  id: string;
  title: string;
  start: string;
  end?: string; // Inclusive final day, YYYY-MM-DD.
  time?: string;
  note?: string;
  internalNote?: string; // Local planning note, never shown on the public calendar.
  gameFormat?: "score_max" | "scramble_2" | "scramble_4" | "other";
  gameFormatDetail?: string;
  status?: "private" | "provisional" | "unconfirmed" | "confirmed";
  category?: "competition" | "open_slot" | "holiday" | "vacation" | "celebration";
  zone?: "all" | "A" | "B" | "C";
};

// The owner-supplied 2027 agenda is the fallback before Supabase setup.
// Once configured, updates are made through /admin/competitions.
export const associationEvents2027: AssociationEvent[] = agenda2027 as AssociationEvent[];
export const associationCalendar2027: AssociationEvent[] = [...associationEvents2027, ...context2027] as AssociationEvent[];
export const associationClubEvents: AssociationEvent[] = clubProgramme as AssociationEvent[];
// The supplied 2027 agenda is complete; keep only the existing 2026 club dates alongside it.
export const associationEvents: AssociationEvent[] = [...associationCalendar2027, ...associationClubEvents.filter(event => event.start.startsWith("2026-"))];
