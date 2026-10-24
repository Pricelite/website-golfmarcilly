import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BlockContent } from "@/components/backoffice/block-content";
import { currentActor } from "@/lib/backoffice/auth";
import { getPage, openDb, parseUserGrants } from "@/lib/backoffice/db";
import { can, parsePageContent } from "@/lib/backoffice/model";

export const metadata: Metadata = { title: "Aperçu privé", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    if (!can(parseUserGrants(actor), actor.role, "view", `page:${id}`)) notFound();
    const page = getPage(db, id);
    if (!page) notFound();
    const content = parsePageContent(JSON.parse(page.draft_json));
    if (!content) notFound();
    return <><div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">Aperçu privé du brouillon · <Link className="underline" href={`/admin/contenu/pages/${id}`}>Revenir à l’éditeur</Link></div><BlockContent content={content} /></>;
  } finally { db.close(); }
}
