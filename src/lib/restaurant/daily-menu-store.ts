import "server-only";

import type { DailyMenu } from "@/data/daily-menu";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DailyMenuRow = {
  menu_date: string;
  starters: DailyMenu["starters"];
  mains: DailyMenu["mains"];
  desserts: DailyMenu["desserts"];
};

const columns = "menu_date,starters,mains,desserts";

function fromRow(row: DailyMenuRow): DailyMenu {
  return { date: row.menu_date, starters: row.starters, mains: row.mains, desserts: row.desserts };
}

export async function getDailyMenu(date: string, options?: { timeoutMs?: number }): Promise<DailyMenu | null> {
  let query = createSupabaseAdminClient()
    .from("restaurant_daily_menus").select(columns).eq("menu_date", date);
  if (options?.timeoutMs) query = query.abortSignal(AbortSignal.timeout(options.timeoutMs));
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as DailyMenuRow) : null;
}

export async function saveDailyMenu(menu: DailyMenu): Promise<DailyMenu> {
  const { data, error } = await createSupabaseAdminClient().from("restaurant_daily_menus")
    .upsert({ menu_date: menu.date, starters: menu.starters, mains: menu.mains, desserts: menu.desserts, updated_at: new Date().toISOString() }, { onConflict: "menu_date" })
    .select(columns).single();
  if (error) throw error;
  return fromRow(data as DailyMenuRow);
}

export async function deleteDailyMenu(date: string): Promise<boolean> {
  const { data, error } = await createSupabaseAdminClient().from("restaurant_daily_menus")
    .delete().eq("menu_date", date).select("menu_date").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
