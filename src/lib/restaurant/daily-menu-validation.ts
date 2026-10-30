import { sortDailyMenuChoices, type DailyMenu, type DailyMenuChoice } from "@/data/daily-menu";

const commonSpelling = [
  [/\bch[eè]vre\b/giu, "chèvre"],
  [/\bcr[eè]me\b/giu, "crème"],
  [/\bbr[uû]l[eé]e\b/giu, "brûlée"],
  [/\bmaison\b/giu, "maison"],
  [/\bsaumons\b/giu, "saumons"],
  [/\bveau\b/giu, "veau"],
  [/\bnutella\b/giu, "Nutella"],
  [/\bsupreme\b/giu, "suprême"],
  [/\bpoulet riz\b/giu, "poulet, riz"],
  [/\briz a l(?:[’']|\s+)espagnol(?:e)?\b/giu, "riz à l’espagnole"],
] as const;

export function normalizeDailyMenuName(value: string): string {
  let name = value.normalize("NFC").replace(/'/g, "’").replace(/\s+/g, " ").trim();
  name = name.replace(/\s+([,.!?;])/g, "$1").replace(/([,.!?;])(?=\p{L})/gu, "$1 ")
    .replace(/’\s+/g, "’").replace(/\s*:\s*/g, "\u00a0: ").replace(/[.!?]+$/g, "").trim();
  for (const [pattern, replacement] of commonSpelling) name = name.replace(pattern, replacement);
  return name ? name[0].toLocaleUpperCase("fr") + name.slice(1) : name;
}

export function normalizeDailyMenuPrice(value: string): string {
  const compact = value.replace(/\s/g, "").replace(".", ",").replace(/€$/, "");
  if (!compact) return "";
  return `${compact.replace(/,(\d)$/, (_, digit: string) => `,${digit}0`)} €`;
}

export function validDailyMenuDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < "1900-01-01" || value > "2199-12-31") return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function choices(value: unknown, allowDailySpecial = false): DailyMenuChoice[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) return null;
  const cleaned = value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const choice = item as Record<string, unknown>;
    if (typeof choice.name !== "string" || typeof choice.price !== "string" || /[\u0000-\u001f\u007f]/.test(choice.name + choice.price)) return null;
    if (choice.dailySpecial !== undefined && (!allowDailySpecial || choice.dailySpecial !== true)) return null;
    return { name: normalizeDailyMenuName(choice.name), price: normalizeDailyMenuPrice(choice.price), ...(choice.dailySpecial === true ? { dailySpecial: true as const } : {}) };
  });
  if (cleaned.some((item) => !item || !item.name || item.name.length > 120 || /[\u0000-\u001f\u007f]/.test(item.name) || !/^(?:0|[1-9]\d{0,3})(?:,\d{2})?\s?€$/.test(item.price))) return null;
  const result = cleaned as DailyMenuChoice[];
  if (new Set(result.map((item) => item.name.toLocaleLowerCase("fr"))).size !== result.length) return null;
  if (result.filter((item) => item.dailySpecial).length > 1) return null;
  return sortDailyMenuChoices(result);
}

export function parseDailyMenu(value: unknown): { ok: true; menu: DailyMenu } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Carte du jour invalide." };
  const input = value as Record<string, unknown>;
  if (!validDailyMenuDate(input.date)) return { ok: false, error: "Date invalide." };
  const starters = choices(input.starters);
  const mains = choices(input.mains, true);
  const desserts = choices(input.desserts);
  if (!starters || !mains || !desserts) return { ok: false, error: "Saisissez entre 1 et 12 choix distincts avec un prix en euros pour chaque catégorie." };
  return { ok: true, menu: { date: input.date, starters, mains, desserts } };
}
