import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api/request-body";
import { currentActor } from "@/lib/backoffice/auth";
import { createPage, listPages, openDb } from "@/lib/backoffice/db";
import { can, parsePageContent } from "@/lib/backoffice/model";
import { parseUserGrants } from "@/lib/backoffice/db";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });

export async function GET() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) return denied();
    const grants = parseUserGrants(actor);
    const pages = listPages(db).filter(page => can(grants, actor.role, "view", `page:${page.id}`))
      .map(({ id, slug, draft_revision, published_revision, review_requested, updated_at }) => ({ id, slug, draftRevision: draft_revision, publishedRevision: published_revision, reviewRequested: Boolean(review_requested), updatedAt: updated_at }));
    return NextResponse.json({ pages });
  } finally { db.close(); }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "create", "pages")) return denied();
    const body = await readJsonBody(request, 300_000);
    if (!body.ok) return NextResponse.json({ error: "Données invalides." }, { status: body.tooLarge ? 413 : 400 });
    const value = body.data as Record<string, unknown>;
    if (!value || typeof value.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) || value.slug.length > 80) return NextResponse.json({ error: "Adresse de page invalide." }, { status: 400 });
    const content = parsePageContent(value.content);
    if (!content) return NextResponse.json({ error: "Contenu invalide." }, { status: 400 });
    try {
      const page = createPage(db, value.slug, content, actor.id);
      return NextResponse.json({ page: { id: page.id, slug: page.slug, draftRevision: page.draft_revision } }, { status: 201 });
    } catch (error) {
      if (String(error).includes("UNIQUE")) return NextResponse.json({ error: "Cette adresse existe déjà." }, { status: 409 });
      throw error;
    }
  } finally { db.close(); }
}
