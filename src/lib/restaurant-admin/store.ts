import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/backoffice/auth";
import { createContentAdminClient } from "@/lib/supabase/content";
import { canAccessAdminSection, RESTAURANT_ID, type AdminSection, type RestaurantActor } from "./policy";

export const RESTAURANT_SESSION_COOKIE = "marcilly_restaurant_session";
const SESSION_SECONDS = 8 * 60 * 60;
const INVITE_SECONDS = 24 * 60 * 60;

type StaffRow = {
  id: string;
  email: string | null;
  username: string | null;
  name: string;
  password_hash: string | null;
  role: string;
  restaurant_id: string;
  active: boolean;
  sections: AdminSection[];
  created_at: string;
};

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
function newToken() { return randomBytes(32).toString("base64url"); }
function accountTable() { return createContentAdminClient().from("restaurant_staff_accounts"); }
function sessionTable() { return createContentAdminClient().from("restaurant_staff_sessions"); }
function inviteTable() { return createContentAdminClient().from("restaurant_staff_invites"); }
function futureDate(seconds: number) { return new Date(Date.now() + seconds * 1000).toISOString(); }

export function restaurantSessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: SESSION_SECONDS };
}

export async function listRestaurantStaff() {
  const { data, error } = await accountTable().select("id,email,username,name,role,restaurant_id,active,sections,created_at").order("created_at");
  if (error) throw error;
  return (data ?? []).map(row => ({ id: row.id, email: row.email, username: row.username, name: row.name, role: row.role, restaurantId: row.restaurant_id, active: row.active, sections: row.sections as AdminSection[], createdAt: row.created_at }));
}

export async function createRestaurantStaff(name: string, email: string | null, username: string | null, sections: AdminSection[] = ["restaurant"]) {
  const id = randomUUID();
  const { error } = await accountTable().insert({ id, name: name.trim(), email: email?.trim().toLowerCase() ?? null, username: username?.trim().toLowerCase() ?? null, role: "staff", restaurant_id: RESTAURANT_ID, active: false, sections });
  if (error) throw error;
  try { return { id, token: await issueRestaurantInvite(id) }; }
  catch (error) { await accountTable().delete().eq("id", id); throw error; }
}

export async function issueRestaurantInvite(id: string): Promise<string> {
  const { data: account, error: lookupError } = await accountTable().select("id").eq("id", id).maybeSingle();
  if (lookupError) throw lookupError;
  if (!account) throw new Error("Compte introuvable.");
  const { error: revokeError } = await accountTable().update({ active: false, password_hash: null, updated_at: new Date().toISOString() }).eq("id", id);
  if (revokeError) throw revokeError;
  const { error: sessionsError } = await sessionTable().delete().eq("account_id", id);
  if (sessionsError) throw sessionsError;
  const { error: invitesError } = await inviteTable().delete().eq("account_id", id);
  if (invitesError) throw invitesError;
  const token = newToken();
  const { error } = await inviteTable().insert({ token_hash: hashToken(token), account_id: id, expires_at: futureDate(INVITE_SECONDS) });
  if (error) throw error;
  return token;
}

export async function revokeRestaurantStaff(id: string): Promise<boolean> {
  const { data, error } = await createContentAdminClient().rpc("revoke_restaurant_staff", { p_account_id: id });
  if (error) throw error;
  return data === true;
}

export async function updateStaffSections(id: string, sections: AdminSection[]): Promise<boolean> {
  const { data, error } = await accountTable().update({ sections, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) return false;
  const { error: sessionsError } = await sessionTable().delete().eq("account_id", id);
  if (sessionsError) throw sessionsError;
  return true;
}

export async function deleteStaffAccount(id: string): Promise<boolean> {
  const { data, error } = await accountTable().delete().eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function activateRestaurantStaff(token: string, password: string): Promise<boolean> {
  const passwordHash = hashPassword(password, 13);
  const { data, error } = await createContentAdminClient().rpc("activate_restaurant_staff", { p_token_hash: hashToken(token), p_password_hash: passwordHash });
  if (error) throw error;
  return data === true;
}

export async function authenticateRestaurantStaff(identifier: string, password: string): Promise<RestaurantActor | null> {
  const normalized = identifier.trim().toLowerCase();
  const field = normalized.includes("@") ? "email" : "username";
  const { data, error } = await accountTable().select("id,email,username,name,password_hash,role,restaurant_id,active,sections,created_at").eq(field, normalized).maybeSingle();
  if (error) throw error;
  const account = data as StaffRow | null;
  const dummy = "scrypt$0000000000000000000000000000000000000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const valid = verifyPassword(password, account?.password_hash ?? dummy);
  const actor = account && { id: account.id, email: account.email, username: account.username, name: account.name, role: account.role, restaurantId: account.restaurant_id, active: account.active, sections: account.sections };
  return valid && actor && actor.sections.some(section => canAccessAdminSection(actor, section)) ? actor : null;
}

export async function issueRestaurantSession(actor: RestaurantActor): Promise<string> {
  if (!actor.sections.some(section => canAccessAdminSection(actor, section))) throw new Error("Accès refusé.");
  const token = newToken();
  const { error } = await sessionTable().insert({ token_hash: hashToken(token), account_id: actor.id, expires_at: futureDate(SESSION_SECONDS) });
  if (error) throw error;
  return token;
}

export async function restaurantActorFromToken(token: string | undefined): Promise<RestaurantActor | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { data: session, error: sessionError } = await sessionTable().select("account_id").eq("token_hash", hashToken(token)).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) return null;
  const { data: account, error: accountError } = await accountTable().select("id,email,username,name,role,restaurant_id,active,sections").eq("id", session.account_id).maybeSingle();
  if (accountError) throw accountError;
  if (!account) return null;
  const actor = { id: account.id, email: account.email, username: account.username, name: account.name, role: account.role, restaurantId: account.restaurant_id, active: account.active, sections: account.sections as AdminSection[] };
  return actor.sections.some(section => canAccessAdminSection(actor, section)) ? actor : null;
}

export async function currentRestaurantActor(): Promise<RestaurantActor | null> {
  return restaurantActorFromToken((await cookies()).get(RESTAURANT_SESSION_COOKIE)?.value);
}

export async function revokeRestaurantSession(token: string | undefined): Promise<void> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
  const { error } = await sessionTable().delete().eq("token_hash", hashToken(token));
  if (error) throw error;
}
