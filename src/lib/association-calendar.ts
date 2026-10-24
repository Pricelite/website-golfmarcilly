import type { AssociationEvent } from "@/data/association-events";

export function upcomingCompetitions(events: AssociationEvent[], today: string) {
  return events.filter(event => (!event.category || event.category === "competition") && event.title !== "Créneau à définir" && !isPastEvent(event, today))
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}

export function calendarDefaultDate(today: string, events: AssociationEvent[] = []) {
  const next = upcomingCompetitions(events, today);
  if (next.some(event => event.start <= `${today.slice(0, 7)}-31` && (event.end ?? event.start) >= `${today.slice(0, 7)}-01`)) return today;
  return next[0]?.start ?? today;
}

export function isPastEvent(event: AssociationEvent, today: string) {
  return (event.end ?? event.start) < today;
}

export function monthDays(year: number, month: number): (string | null)[] {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > count ? null : `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

export function eventsOnDay(events: AssociationEvent[], day: string) {
  return events.filter(event => event.start <= day && (event.end ?? event.start) >= day)
    .sort((a, b) => eventPriority(a) - eventPriority(b) || a.start.localeCompare(b.start));
}

function eventPriority(event: AssociationEvent) {
  if (event.category === "holiday" || event.category === "vacation" || event.category === "celebration") return 2;
  if (event.category === "open_slot" || event.title === "Créneau à définir") return 1;
  return 0;
}

export function eventsInMonth(events: AssociationEvent[], year: number, month: number) {
  const days = monthDays(year, month).filter((day): day is string => day !== null);
  return events.filter(event => event.start <= days[days.length - 1] && (event.end ?? event.start) >= days[0])
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function formatCalendarDate(day: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}
