import type { AssociationEvent } from "@/data/association-events";

export function monthDays(year: number, month: number): (string | null)[] {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > count ? null : `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

export function eventsOnDay(events: AssociationEvent[], day: string) {
  return events.filter(event => event.start <= day && (event.end ?? event.start) >= day);
}

export function eventsInMonth(events: AssociationEvent[], year: number, month: number) {
  const days = monthDays(year, month).filter((day): day is string => day !== null);
  return events.filter(event => event.start <= days[days.length - 1] && (event.end ?? event.start) >= days[0])
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function formatCalendarDate(day: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}
