import type { DailyMenu } from "@/data/daily-menu";

export function prepareDailyMenuEditor(date: string, exact: DailyMenu | null, latest: DailyMenu | null) {
  if (exact) return { menu: exact, published: true, copiedFromDate: null };
  if (!latest) return { menu: null, published: false, copiedFromDate: null };

  return {
    menu: {
      date,
      starters: latest.starters.map((choice) => ({ ...choice })),
      mains: latest.mains.map(({ name, price }) => ({ name, price })),
      desserts: latest.desserts.map((choice) => ({ ...choice })),
    },
    published: false,
    copiedFromDate: latest.date,
  };
}
