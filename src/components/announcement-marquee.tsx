import {
  getDateKeyInTimeZone,
  getDaysUntil,
  getUpcomingPlanningAnnouncements,
} from "@/lib/calendar-announcements";

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

export default async function AnnouncementMarquee() {
  const events = await getUpcomingPlanningAnnouncements({
    limit: 20,
    daysAhead: 10,
  });

  const todayKey = getDateKeyInTimeZone(new Date(), "Europe/Paris");
  const announcements =
    events.length > 0
      ? events.map((event) => {
          const daysUntil = getDaysUntil(event.date, todayKey);
          const relative =
            daysUntil === 0
              ? "Aujourd'hui"
              : daysUntil === 1
                ? "Dans 1 jour"
                : `Dans ${daysUntil} jours`;
          const timePart = event.time ? ` - ${event.time}` : "";
          const locationPart = event.location ? ` - ${event.location}` : "";
          const text = `Competition / Evenement: ${event.title} - ${formatFrenchDate(event.date)}${timePart}${locationPart} - ${relative}`;

          return {
            id: event.id,
            url: event.url,
            text,
          };
        })
      : [
          {
            id: "no-event",
            text: "Aucune competition ou evenement dans les 10 prochains jours.",
          },
        ];

  const renderItemContent = (item: { id: string; text: string; url?: string }) => {
    const className =
      "announcement-marquee__item rounded-full border border-emerald-900/20 bg-white/60 px-4 py-1.5 text-sm font-bold text-black";

    if (item.url) {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${className} hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200`}
          aria-label={`Acceder a l'annonce: ${item.text}`}
          title="Acceder a l'annonce"
        >
          {item.text}
        </a>
      );
    }

    return (
      <span className={className}>
        {item.text}
      </span>
    );
  };

  return (
    <section
      className="announcement-marquee border-b border-emerald-300 bg-emerald-100 text-black"
      aria-label="Prochaines competitions ou evenements"
    >
      <div className="w-full px-6 py-2">
        <div className="flex flex-col gap-1.5">
          {announcements.map((item, index) => {
            return (
              <div
                key={`${item.id}-${index}`}
                className="announcement-marquee__viewport w-full overflow-hidden"
              >
                <div className="announcement-marquee__track flex w-max items-center whitespace-nowrap">
                  {renderItemContent(item)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
