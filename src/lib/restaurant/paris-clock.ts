export type ClockTime = { hours: number; minutes: number; seconds: number; label: string };

const formatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

export function getParisTime(now: Date): ClockTime {
  const parts = formatter.formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    hours: value("hour"),
    minutes: value("minute"),
    seconds: value("second"),
    label: formatter.format(now),
  };
}
