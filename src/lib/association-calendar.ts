import type { AssociationEvent } from "@/data/association-events";

export function upcomingCompetitions(events: AssociationEvent[], today: string) {
  return events.filter(event => (!event.category || event.category === "competition") && event.title !== "Créneau à définir" && !isPastEvent(event, today))
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}

export function shiftCalendarDate(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function calendarDefaultDate(today: string) {
  const weekday = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  return shiftCalendarDate(today, -weekday);
}

export function weekDays(day: string) {
  const monday = calendarDefaultDate(day);
  return Array.from({ length: 7 }, (_, index) => shiftCalendarDate(monday, index));
}

export function eventsInWeek(events: AssociationEvent[], day: string) {
  const days = weekDays(day);
  return events.filter(event => event.start <= days[6] && (event.end ?? event.start) >= days[0])
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function formatCalendarWeek(day: string) {
  const days = weekDays(day);
  const start = days[0].slice(0, 7) === days[6].slice(0, 7) ? Number(days[0].slice(-2)) : formatCalendarDate(days[0]);
  return `Du ${start} au ${formatCalendarDate(days[6])}`;
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
