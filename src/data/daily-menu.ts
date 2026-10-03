export type DailyMenuChoice = { name: string; price: string };

export type DailyMenu = {
  date: string;
  starters: DailyMenuChoice[];
  mains: DailyMenuChoice[];
  desserts: DailyMenuChoice[];
};

// Carte transmise par le propriétaire le 3 octobre 2026. Elle sert de repli tant
// qu'aucune carte plus récente n'a été publiée dans Supabase.
export const dailyMenuExampleDate = "2026-10-03";
export const dailyMenuExample: Omit<DailyMenu, "date"> = {
  starters: [
    { name: "Terrine maison", price: "8 €" },
    { name: "Croustillant de reblochon façon tartiflette", price: "8 €" },
    { name: "Saucisson brioché", price: "9 €" },
  ],
  mains: [
    { name: "Faux-filet, sauce échalote", price: "23 €" },
    { name: "Burger de la Bergerie", price: "17 €" },
    { name: "Entrecôte", price: "25 €" },
    { name: "Souris d’agneau confite et son jus", price: "21 €" },
    { name: "Pavé de mahi-mahi, sauce aux fruits de mer safranée", price: "19 €" },
    { name: "Cuisse de canard confite, sauce au poivre vert", price: "17 €" },
    { name: "Jambon grillé", price: "12 €" },
  ],
  desserts: [
    { name: "Tarte fine aux mirabelles", price: "7,50 €" },
    { name: "Île flottante", price: "7 €" },
    { name: "Profiterole de la Bergerie", price: "8 €" },
    { name: "Omelette norvégienne", price: "9 €" },
  ],
};

export function parisDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function isDailyMenuDisplayTime(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? -1);
  const minutes = value("hour") * 60 + value("minute");
  return minutes >= 10 * 60 && minutes < 15 * 60;
}

export function formatDailyMenuDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
