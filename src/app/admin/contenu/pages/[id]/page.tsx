import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageEditor } from "@/components/backoffice/page-editor";
import { currentActor } from "@/lib/backoffice/auth";
import { getPage, openDb, parseUserGrants } from "@/lib/backoffice/db";
import { can, parsePageContent } from "@/lib/backoffice/model";

export const metadata: Metadata = { title: "Éditeur de page", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    const grants = parseUserGrants(actor);
    if (!can(grants, actor.role, "view", `page:${id}`)) notFound();
    const page = getPage(db, id);
    if (!page) notFound();
    const content = parsePageContent(JSON.parse(page.draft_json));
    if (!content) notFound();
    const history = db.prepare("SELECT r.revision,r.action,u.name AS author,r.created_at FROM revisions r JOIN users u ON u.id=r.actor_id WHERE r.page_id=? ORDER BY r.revision DESC LIMIT 50").all(id) as { revision: number; action: string; author: string; created_at: string }[];
    return <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm"><Link className="underline" href="/admin/contenu">← Toutes les pages</Link></nav>
      <PageEditor id={id} slug={page.slug} initialContent={content} initialRevision={page.draft_revision} initialPublishedRevision={page.published_revision} initialReviewRequested={Boolean(page.review_requested)} history={history} permissions={{ edit: can(grants, actor.role, "edit", `page:${id}`), submit: can(grants, actor.role, "submit", `page:${id}`), publish: can(grants, actor.role, "publish", `page:${id}`), restore: can(grants, actor.role, "restore", `page:${id}`), delete: can(grants, actor.role, "delete", `page:${id}`), media: can(grants, actor.role, "view", "media") }} />
    </section>;
  } finally { db.close(); }
}
