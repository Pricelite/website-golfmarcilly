import type { DailyMenu, DailyMenuChoice } from "@/data/daily-menu";

export function validDailyMenuDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < "1900-01-01" || value > "2199-12-31") return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function choices(value: unknown): [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const cleaned = value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const choice = item as Record<string, unknown>;
    if (typeof choice.name !== "string" || typeof choice.price !== "string") return null;
    return { name: choice.name.trim(), price: choice.price.trim() };
  });
  if (cleaned.some((item) => !item || !item.name || item.name.length > 120 || /[\u0000-\u001f\u007f]/.test(item.name) || !/^(?:0|[1-9]\d{0,3})(?:,\d{2})?\s?€$/.test(item.price))) return null;
  const result = cleaned as [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice];
  if (new Set(result.map((item) => item.name.toLocaleLowerCase("fr"))).size !== 3) return null;
  return result;
}

export function parseDailyMenu(value: unknown): { ok: true; menu: DailyMenu } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Carte du jour invalide." };
  const input = value as Record<string, unknown>;
  if (!validDailyMenuDate(input.date)) return { ok: false, error: "Date invalide." };
  const starters = choices(input.starters);
  const mains = choices(input.mains);
  const desserts = choices(input.desserts);
  if (!starters || !mains || !desserts) return { ok: false, error: "Saisissez trois choix distincts avec un prix en euros pour chaque catégorie." };
  return { ok: true, menu: { date: input.date, starters, mains, desserts } };
}
