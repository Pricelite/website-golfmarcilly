import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Db, UserRow } from "./db";

export const COOKIE_NAME = "marcilly_backoffice";
const SESSION_SECONDS = 8 * 60 * 60;

export function hashPassword(password: string): string {
  if (password.length < 14 || password.length > 256) throw new Error("Mot de passe invalide.");
  const salt = randomBytes(32);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const expected = Buffer.from(parts[2], "hex");
    if (expected.length !== 64) return false;
    const actual = scryptSync(password, Buffer.from(parts[1], "hex"), 64, { N: 16384, r: 8, p: 1 });
    return timingSafeEqual(actual, expected);
  } catch { return false; }
}

export function tokenHash(token: string): string { return createHash("sha256").update(token).digest("hex"); }

export function issueSession(db: Db, user: UserRow): string {
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)")
    .run(tokenHash(token), user.id, Math.floor(Date.now() / 1000) + SESSION_SECONDS, new Date().toISOString());
  return token;
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: SESSION_SECONDS };
}

export function actorFromToken(db: Db, token: string | undefined): UserRow | null {
  if (!token || token.length > 100) return null;
  const row = db.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1")
    .get(tokenHash(token), Math.floor(Date.now() / 1000));
  return (row as UserRow | undefined) ?? null;
}

export async function currentActor(db: Db): Promise<UserRow | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return actorFromToken(db, token);
}

export function revokeUserSessions(db: Db, id: string): void {
  db.prepare("DELETE FROM sessions WHERE user_id=?").run(id);
}
