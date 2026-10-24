import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonBody } from "@/lib/api/request-body";
import { currentActor } from "@/lib/backoffice/auth";
import { audit, getPage, openDb, parseUserGrants, publishPage, updateDraft } from "@/lib/backoffice/db";
import { can, parsePageContent } from "@/lib/backoffice/model";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });
const conflict = () => NextResponse.json({ error: "Cette page a été modifiée entre-temps. Rechargez-la avant de continuer." }, { status: 409 });

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "view", `page:${id}`)) return denied();
    const page = getPage(db, id);
    if (!page) return NextResponse.json({ error: "Page introuvable." }, { status: 404 });
    const revisions = db.prepare("SELECT r.revision,r.action,u.name AS author,r.created_at FROM revisions r JOIN users u ON u.id=r.actor_id WHERE r.page_id=? ORDER BY r.revision DESC LIMIT 50").all(id);
    return NextResponse.json({ page: { id, slug: page.slug, draft: JSON.parse(page.draft_json), draftRevision: page.draft_revision, publishedRevision: page.published_revision, reviewRequested: Boolean(page.review_requested), published: page.published_json ? JSON.parse(page.published_json) : null }, revisions });
  } finally { db.close(); }
}

export async function PUT(request: Request, context: Context) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const { id } = await context.params;
  const body = await readJsonBody(request, 300_000);
  if (!body.ok) return NextResponse.json({ error: "Données invalides." }, { status: body.tooLarge ? 413 : 400 });
  const value = body.data as Record<string, unknown>;
  if (!value || !Number.isSafeInteger(value.expectedRevision) || (value.expectedRevision as number) < 1) return NextResponse.json({ error: "Révision invalide." }, { status: 400 });
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) return denied();
    const page = getPage(db, id);
    if (!page) return NextResponse.json({ error: "Page introuvable." }, { status: 404 });
    const resource = `page:${id}`;
    const grants = parseUserGrants(actor);
    if (value.action === "save") {
      if (!can(grants, actor.role, "edit", resource)) return denied();
      const content = parsePageContent(value.content);
      if (!content) return NextResponse.json({ error: "Contenu invalide." }, { status: 400 });
      if (!allMediaExist(db, content)) return NextResponse.json({ error: "Une image est introuvable." }, { status: 400 });
      const result = updateDraft(db, page, content, value.expectedRevision as number, actor.id);
      return result ? NextResponse.json({ draftRevision: result.draft_revision }) : conflict();
    }
    if (value.action === "submit") {
      if (!can(grants, actor.role, "submit", resource)) return denied();
      const result = db.prepare("UPDATE pages SET review_requested=1 WHERE id=? AND draft_revision=?").run(id, value.expectedRevision);
      if (!result.changes) return conflict();
      audit(db, actor.id, "page.submit", id);
      return NextResponse.json({ ok: true });
    }
    if (value.action === "publish") {
      if (!can(grants, actor.role, "publish", resource)) return denied();
      const content = parsePageContent(JSON.parse(page.draft_json));
      if (!content || !allMediaExist(db, content)) return NextResponse.json({ error: "Le contenu contient une image manquante ou invalide." }, { status: 400 });
      const result = publishPage(db, page, value.expectedRevision as number, actor.id);
      if (!result) return conflict();
      revalidatePath(`/pages/${page.slug}`);
      revalidatePath("/sitemap.xml");
      return NextResponse.json({ publishedRevision: result.published_revision });
    }
    if (value.action === "restore") {
      if (!can(grants, actor.role, "restore", resource) || !Number.isSafeInteger(value.revision)) return denied();
      const historical = db.prepare("SELECT content_json FROM revisions WHERE page_id=? AND revision=?").get(id, value.revision) as { content_json: string } | undefined;
      if (!historical) return NextResponse.json({ error: "Version introuvable." }, { status: 404 });
      const content = parsePageContent(JSON.parse(historical.content_json));
      if (!content) return NextResponse.json({ error: "Version invalide." }, { status: 400 });
      const result = updateDraft(db, page, content, value.expectedRevision as number, actor.id, "restore");
      if (!result) return conflict();
      return NextResponse.json({ draftRevision: result.draft_revision });
    }
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } finally { db.close(); }
}

export async function DELETE(request: Request, context: Context) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const { id } = await context.params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "delete", `page:${id}`)) return denied();
    const page = getPage(db, id);
    if (!page) return NextResponse.json({ error: "Page introuvable." }, { status: 404 });
    db.prepare("DELETE FROM pages WHERE id=?").run(id);
    audit(db, actor.id, "page.delete", id);
    revalidatePath(`/pages/${page.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true });
  } finally { db.close(); }
}

function allMediaExist(db: ReturnType<typeof openDb>, content: ReturnType<typeof parsePageContent>): boolean {
  if (!content) return false;
  return content.blocks.every(block => block.type !== "image" || Boolean(db.prepare("SELECT id FROM media WHERE id=?").get(block.mediaId)));
}
