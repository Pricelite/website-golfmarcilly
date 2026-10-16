import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { currentActor, revokeUserSessions, tokenHash } from "@/lib/backoffice/auth";
import { audit, getUser, openDb } from "@/lib/backoffice/db";
import { parseGrants, type Role } from "@/lib/backoffice/model";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });

export async function PATCH(request: Request, context: Context) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const { id } = await context.params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (actor?.role !== "admin") return denied();
    const target = getUser(db, id);
    if (!target) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    const body = await readJsonBody(request, 16_384);
    if (!body.ok) return NextResponse.json({ error: "Données invalides." }, { status: body.tooLarge ? 413 : 400 });
    const value = body.data as Record<string, unknown>;
    if (!value || typeof value.action !== "string") return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    if (value.action === "revoke") {
      revokeUserSessions(db, id); audit(db, actor.id, "user.revoke", id);
      return NextResponse.json({ ok: true });
    }
    if (value.action === "reset") {
      const token = randomBytes(32).toString("base64url");
      db.exec("BEGIN IMMEDIATE");
      try {
        // Keep the current administrator signed in until the new password is set.
        // Activating the link revokes all sessions for that account.
        if (actor.id !== id) revokeUserSessions(db, id);
        db.prepare("DELETE FROM invites WHERE user_id=?").run(id);
        db.prepare("INSERT INTO invites(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").run(tokenHash(token), id, Math.floor(Date.now() / 1000) + 86400, new Date().toISOString());
        audit(db, actor.id, "user.reset", id);
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
      return NextResponse.json({ activationPath: `/admin/contenu/activer?token=${token}` }, { headers: { "Cache-Control": "no-store" } });
    }
    if (value.action !== "update") return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
    if (actor.id === id) return NextResponse.json({ error: "Vous ne pouvez pas modifier vos propres droits ou votre accès." }, { status: 403 });
    if (!["admin", "editor", "contributor"].includes(value.role as string) || typeof value.active !== "boolean") return NextResponse.json({ error: "Rôle ou état invalide." }, { status: 400 });
    const grants = parseGrants(value.grants);
    if (!grants) return NextResponse.json({ error: "Permissions invalides." }, { status: 400 });
    db.exec("BEGIN IMMEDIATE");
    try {
      if (target.role === "admin" && target.active && (value.role !== "admin" || !value.active)) {
        const count = db.prepare("SELECT count(*) AS n FROM users WHERE role='admin' AND active=1").get() as { n: number };
        if (count.n <= 1) { db.exec("ROLLBACK"); return NextResponse.json({ error: "Le dernier administrateur doit rester actif." }, { status: 409 }); }
      }
      db.prepare("UPDATE users SET role=?,active=?,grants_json=?,updated_at=? WHERE id=?")
        .run(value.role as Role, value.active ? 1 : 0, JSON.stringify(grants), new Date().toISOString(), id);
      if (!value.active || value.role !== target.role || JSON.stringify(grants) !== target.grants_json) revokeUserSessions(db, id);
      audit(db, actor.id, "user.update", id);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    return NextResponse.json({ ok: true });
  } finally { db.close(); }
}
