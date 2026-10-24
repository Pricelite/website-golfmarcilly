import { NextResponse } from "next/server";
import { COOKIE_NAME, actorFromToken, issueSession, sessionCookieOptions, tokenHash, verifyPassword } from "@/lib/backoffice/auth";
import { readJsonBody, readLimitedTextBody } from "@/lib/api/request-body";
import { audit, openDb, type UserRow } from "@/lib/backoffice/db";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const isForm = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") ?? false;
  const fail = (error: string, status: number, code: string) => isForm
    ? NextResponse.redirect(new URL(`/admin/contenu/connexion?error=${code}`, request.url), 303)
    : NextResponse.json({ error }, { status });
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return fail("Origine non autorisée.", 403, "origin_denied");
  const rate = await consumeRateLimit({ namespace: "backoffice-login", identifier: parseClientIpFromHeaders(request.headers), limit: 8, windowMs: 10 * 60_000 });
  if (!rate.allowed) return fail("Trop de tentatives. Réessayez dans quelques minutes.", 429, "rate_limited");
  let fields: Record<string, unknown>;
  if (isForm) {
    const body = await readLimitedTextBody(request, 2048);
    if (!body.ok) return fail("Données invalides.", body.tooLarge ? 413 : 400, "invalid");
    const params = new URLSearchParams(body.text);
    fields = { email: params.get("email"), password: params.get("password") };
  } else {
    const body = await readJsonBody(request, 2048);
    if (!body.ok) return fail("Données invalides.", body.tooLarge ? 413 : 400, "invalid");
    fields = body.data as Record<string, unknown>;
  }
  const { email, password } = fields;
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 256) return fail("Identifiants invalides.", 400, "invalid");
  let db;
  try { db = openDb(); }
  catch { return fail("Administration indisponible.", 503, "unavailable"); }
  try {
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email.trim().toLowerCase()) as UserRow | undefined;
    // Always do password work to reduce account enumeration through timing.
    const dummy = "scrypt$0000000000000000000000000000000000000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const valid = verifyPassword(password, user?.password_hash ?? dummy);
    if (!user || !user.active || !valid) return fail("Identifiants invalides.", 401, "invalid");
    const token = issueSession(db, user);
    audit(db, user.id, "session.login", user.id);
    const response = isForm
      ? NextResponse.redirect(new URL("/admin/contenu", request.url), 303)
      : NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } finally { db.close(); }
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)marcilly_backoffice=([^;]+)/)?.[1];
  let db;
  try { db = openDb(); } catch { return NextResponse.json({ error: "Administration indisponible." }, { status: 503 }); }
  try {
    const user = actorFromToken(db, token);
    if (token) db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash(token));
    if (user) audit(db, user.id, "session.logout", user.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
    return response;
  } finally { db.close(); }
}
