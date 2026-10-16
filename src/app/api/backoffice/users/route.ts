import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { currentActor, hashPassword, tokenHash } from "@/lib/backoffice/auth";
import { audit, openDb, type UserRow } from "@/lib/backoffice/db";
import { parseGrants, type Role } from "@/lib/backoffice/model";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });

export async function GET() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (actor?.role !== "admin") return denied();
    const users = db.prepare("SELECT id,email,name,role,grants_json,active,created_at FROM users ORDER BY created_at").all() as UserRow[];
    const auditLog = db.prepare("SELECT id,actor_id,action,target,created_at FROM audit ORDER BY id DESC LIMIT 50").all();
    return NextResponse.json({ users: users.map(user => ({ ...user, grants: JSON.parse(user.grants_json), grants_json: undefined })), audit: auditLog });
  } finally { db.close(); }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (actor?.role !== "admin") return denied();
    const body = await readJsonBody(request, 16_384);
    if (!body.ok) return NextResponse.json({ error: "Données invalides." }, { status: body.tooLarge ? 413 : 400 });
    const value = body.data as Record<string, unknown>;
    if (!value || typeof value.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) || value.email.length > 254 ||
        typeof value.name !== "string" || !value.name.trim() || value.name.length > 100 ||
        !["admin", "editor", "contributor"].includes(value.role as string)) return NextResponse.json({ error: "Compte invalide." }, { status: 400 });
    const grants = parseGrants(value.grants);
    if (!grants) return NextResponse.json({ error: "Permissions invalides." }, { status: 400 });
    const id = randomUUID();
    const now = new Date().toISOString();
    const randomPassword = randomBytes(32).toString("base64url");
    try {
      db.prepare("INSERT INTO users(id,email,name,password_hash,role,grants_json,active,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)")
        .run(id, value.email.trim().toLowerCase(), value.name.trim(), hashPassword(randomPassword), value.role as Role, JSON.stringify(grants), now, now);
    } catch (error) {
      if (String(error).includes("UNIQUE")) return NextResponse.json({ error: "Cette adresse possède déjà un compte." }, { status: 409 });
      throw error;
    }
    const token = randomBytes(32).toString("base64url");
    db.prepare("INSERT INTO invites(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").run(tokenHash(token), id, Math.floor(Date.now() / 1000) + 86400, now);
    audit(db, actor.id, "user.create", id);
    return NextResponse.json({ user: { id, email: value.email.trim().toLowerCase(), name: value.name.trim(), role: value.role, active: true, grants }, activationPath: `/admin/contenu/activer?token=${token}` }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } finally { db.close(); }
}
