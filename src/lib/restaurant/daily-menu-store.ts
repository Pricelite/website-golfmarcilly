import "server-only";

import { sortDailyMenuChoices, type DailyMenu, type DailyMenuChoice } from "@/data/daily-menu";
import { createContentAdminClient } from "@/lib/supabase/content";
import { normalizeDailyMenuName, normalizeDailyMenuPrice } from "./daily-menu-validation";

type DailyMenuRow = {
  menu_date: string;
  starters: DailyMenu["starters"];
  mains: DailyMenu["mains"];
  desserts: DailyMenu["desserts"];
};

const columns = "menu_date,starters,mains,desserts";

function fromRow(row: DailyMenuRow): DailyMenu {
  const clean = (choices: DailyMenuChoice[]) => sortDailyMenuChoices(choices.map((choice) => ({
    name: normalizeDailyMenuName(choice.name),
    price: normalizeDailyMenuPrice(choice.price),
  })));
  return { date: row.menu_date, starters: clean(row.starters), mains: clean(row.mains), desserts: clean(row.desserts) };
}

export async function getDailyMenu(date: string, options?: { timeoutMs?: number }): Promise<DailyMenu | null> {
  let query = createContentAdminClient()
    .from("restaurant_daily_menus").select(columns).eq("menu_date", date);
  if (options?.timeoutMs) query = query.abortSignal(AbortSignal.timeout(options.timeoutMs));
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as DailyMenuRow) : null;
}

export async function getLatestDailyMenu(date: string, options?: { timeoutMs?: number }): Promise<DailyMenu | null> {
  let query = createContentAdminClient()
    .from("restaurant_daily_menus")
    .select(columns)
    .lte("menu_date", date)
    .order("menu_date", { ascending: false })
    .limit(1);
  if (options?.timeoutMs) query = query.abortSignal(AbortSignal.timeout(options.timeoutMs));
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as DailyMenuRow) : null;
}

export async function saveDailyMenu(menu: DailyMenu): Promise<DailyMenu> {
  const { data, error } = await createContentAdminClient().from("restaurant_daily_menus")
    .upsert({ menu_date: menu.date, starters: menu.starters, mains: menu.mains, desserts: menu.desserts, updated_at: new Date().toISOString() }, { onConflict: "menu_date" })
    .select(columns).single();
  if (error) throw error;
  return fromRow(data as DailyMenuRow);
}

export async function deleteDailyMenu(date: string): Promise<boolean> {
  const { data, error } = await createContentAdminClient().from("restaurant_daily_menus")
    .delete().eq("menu_date", date).select("menu_date").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
