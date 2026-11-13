import "server-only";

import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { canAccessAdminSection, type AdminSection, type RestaurantActor } from "@/lib/restaurant-admin/policy";
import { currentRestaurantActor } from "@/lib/restaurant-admin/store";

export async function isSuperAdmin(): Promise<boolean> {
  return Boolean(process.env.ADMIN_PASSWORD?.trim()) && isAdminAuthenticated(await cookies());
}

export async function currentStaffActor(): Promise<RestaurantActor | null> {
  try { return await currentRestaurantActor(); }
  catch { return null; }
}

export async function canAccessAdmin(section: AdminSection): Promise<boolean> {
  if (await isSuperAdmin()) return true;
  return canAccessAdminSection(await currentStaffActor(), section);
}
