import "server-only";

import { currentActor } from "@/lib/backoffice/auth";
import { openDb } from "@/lib/backoffice/db";
import { canAccessAdmin } from "@/lib/admin-access";

export async function canViewStatistics(): Promise<boolean> {
  if (await canAccessAdmin("statistiques")) return true;
  try {
    const db = openDb();
    try { return (await currentActor(db))?.role === "admin"; }
    finally { db.close(); }
  } catch { return false; }
}
