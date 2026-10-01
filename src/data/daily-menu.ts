export type DailyMenuChoice = { name: string; price: string };

export type DailyMenu = {
  date: string;
  starters: [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice];
  mains: [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice];
  desserts: [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice];
};

// Intitulés repris de la carte éditoriale existante. Ce modèle n'est pas une offre publiée.
export const dailyMenuExample: Omit<DailyMenu, "date"> = {
  starters: [
    { name: "Poireaux revisités à la vinaigrette", price: "9 €" },
    { name: "Œuf cocotte", price: "10 €" },
    { name: "Saumon gravlax", price: "10 €" },
  ],
  mains: [
    { name: "Araignée de porc en persillade", price: "17 €" },
    { name: "Burger de la Bergerie", price: "17 €" },
    { name: "Parmentier de canard sauce foie gras", price: "20 €" },
  ],
  desserts: [
    { name: "Cookie crème choco–caramel", price: "9,50 €" },
    { name: "Cheesecake fruits rouges, pistaches", price: "9,50 €" },
    { name: "Nuage de riz au lait caramélisé", price: "9,50 €" },
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
