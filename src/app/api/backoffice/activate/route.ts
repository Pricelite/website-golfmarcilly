import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { hashPassword, revokeUserSessions, tokenHash } from "@/lib/backoffice/auth";
import { audit, openDb } from "@/lib/backoffice/db";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const body = await readJsonBody(request, 2048);
  if (!body.ok) return NextResponse.json({ error: "Données invalides." }, { status: body.tooLarge ? 413 : 400 });
  const { token, password } = body.data as Record<string, unknown>;
  if (typeof token !== "string" || token.length > 100 || typeof password !== "string" || password.length < 14 || password.length > 256) return NextResponse.json({ error: "Lien ou mot de passe invalide (14 caractères minimum)." }, { status: 400 });
  const db = openDb();
  try {
    const invite = db.prepare("SELECT user_id FROM invites WHERE token_hash=? AND expires_at>?").get(tokenHash(token), Math.floor(Date.now() / 1000)) as { user_id: string } | undefined;
    if (!invite) return NextResponse.json({ error: "Lien expiré ou déjà utilisé." }, { status: 400 });
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?").run(hashPassword(password), new Date().toISOString(), invite.user_id);
      revokeUserSessions(db, invite.user_id);
      db.prepare("DELETE FROM invites WHERE user_id=?").run(invite.user_id);
      audit(db, invite.user_id, "user.activate", invite.user_id);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    return NextResponse.json({ ok: true });
  } finally { db.close(); }
}
