import "server-only";

import { cookies } from "next/headers";

import { currentActor } from "@/lib/backoffice/auth";
import { openDb } from "@/lib/backoffice/db";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";

export async function canViewStatistics(): Promise<boolean> {
  if (process.env.ADMIN_PASSWORD?.trim() && await isAdminAuthenticated(await cookies())) return true;
  try {
    const db = openDb();
    try { return (await currentActor(db))?.role === "admin"; }
    finally { db.close(); }
  } catch { return false; }
}
