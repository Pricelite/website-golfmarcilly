import type { PlanningEvent } from "./calendar-announcements";
import { getDateKeyInTimeZone, getDaysUntil } from "./calendar-announcements";

export type AnnouncementItem = {
  id: string;
  text: string;
  url?: string;
};

function formatFrenchDate(dateKey: string): string {
  const [year, month, day] = dateKey
    .split("-")
    .map((value) => Number.parseInt(value, 10));
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(date);
}

export function mapPlanningEventsToAnnouncementItems(
  events: readonly PlanningEvent[],
  fallbackText: string = "Aucune competition dans les 7 prochains jours."
): AnnouncementItem[] {
  const todayKey = getDateKeyInTimeZone(new Date(), "Europe/Paris");
  if (events.length === 0) {
    return [{ id: "no-event", text: fallbackText }];
  }

  return events.map((event) => {
    const daysUntil = getDaysUntil(event.date, todayKey);
    const relative =
      daysUntil === 0
        ? "Aujourd'hui"
        : daysUntil === 1
          ? "Dans 1 jour"
          : `Dans ${daysUntil} jours`;
    const timePart = event.time ? ` - ${event.time}` : "";
    const locationPart = event.location ? ` - ${event.location}` : "";
    const text = `Competition: ${event.title} - ${formatFrenchDate(event.date)}${timePart}${locationPart} - ${relative}`;

    return {
      id: event.id,
      url: event.url,
      text,
    };
  });
}
