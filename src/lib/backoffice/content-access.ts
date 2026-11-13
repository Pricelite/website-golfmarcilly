import "server-only";

import { currentStaffActor, isSuperAdmin } from "@/lib/admin-access";
import { canAccessAdminSection } from "@/lib/restaurant-admin/policy";
import { currentActor } from "./auth";
import type { Db, UserRow } from "./db";
import type { Grant, Role } from "./model";

const SUPER_ADMIN_ID = "00000000-0000-4000-8000-000000000001";

function mirrorAccount(db: Db, id: string, name: string, role: Role, grants: Grant[]): UserRow {
  const now = new Date().toISOString();
  const email = `${id}@internal.invalid`;
  db.prepare("INSERT OR IGNORE INTO users(id,email,name,password_hash,role,grants_json,active,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)")
    .run(id, email, name, "disabled", role, JSON.stringify(grants), now, now);
  db.prepare("UPDATE users SET name=?,role=?,grants_json=?,active=1,updated_at=? WHERE id=?")
    .run(name, role, JSON.stringify(grants), now, id);
  return db.prepare("SELECT * FROM users WHERE id=?").get(id) as UserRow;
}

export async function currentContentActor(db: Db): Promise<UserRow | null> {
  if (await isSuperAdmin()) return mirrorAccount(db, SUPER_ADMIN_ID, "Super administrateur", "admin", []);
  const local = await currentActor(db);
  if (local) return local;
  const staff = await currentStaffActor();
  if (!staff) return null;
  const grants: Grant[] = [];
  if (canAccessAdminSection(staff, "pages")) grants.push({ resource: "pages", actions: ["view", "create", "edit", "delete", "submit", "publish", "restore"] });
  if (canAccessAdminSection(staff, "media")) grants.push({ resource: "media", actions: ["view", "create", "delete"] });
  return grants.length ? mirrorAccount(db, staff.id, staff.name, "contributor", grants) : null;
}
