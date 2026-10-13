import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { currentActor } from "@/lib/backoffice/auth";
import { audit, mediaDirectory, openDb, parseUserGrants, type MediaRow } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const db = openDb();
  try {
    const media = db.prepare("SELECT * FROM media WHERE id=?").get(id) as MediaRow | undefined;
    if (!media) return new Response(null, { status: 404 });
    const candidates = db.prepare("SELECT published_json FROM pages WHERE published_json LIKE ?").all(`%${id}%`) as { published_json: string }[];
    const published = candidates.some(candidate => {
      try {
        const content = JSON.parse(candidate.published_json) as { blocks?: { type?: string; mediaId?: string }[] };
        return content.blocks?.some(block => block.type === "image" && block.mediaId === id) ?? false;
      } catch { return false; }
    });
    if (!published) {
      const actor = await currentActor(db);
      if (!actor || !can(parseUserGrants(actor), actor.role, "view", "media")) return denied();
    }
    try {
      const data = await readFile(join(mediaDirectory(), id));
      return new Response(new Uint8Array(data), { headers: { "Content-Type": media.mime, "Content-Length": String(data.length), "X-Content-Type-Options": "nosniff", "Cache-Control": published ? "public, max-age=3600" : "private, no-store" } });
    } catch { return new Response(null, { status: 404 }); }
  } finally { db.close(); }
}

export async function DELETE(request: Request, context: Context) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const { id } = await context.params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "delete", "media")) return denied();
    if (db.prepare("SELECT id FROM pages WHERE draft_json LIKE ? OR published_json LIKE ? LIMIT 1").get(`%${id}%`, `%${id}%`)) return NextResponse.json({ error: "Cette image est utilisée par une page." }, { status: 409 });
    db.prepare("DELETE FROM media WHERE id=?").run(id);
    await unlink(join(mediaDirectory(), id)).catch(() => {});
    audit(db, actor.id, "media.delete", id);
    return NextResponse.json({ ok: true });
  } finally { db.close(); }
}
