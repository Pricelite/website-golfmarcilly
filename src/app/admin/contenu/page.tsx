import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/backoffice/logout-button";
import { NewPageForm } from "@/components/backoffice/new-page-form";
import { currentActor } from "@/lib/backoffice/auth";
import { listPages, openDb, parseUserGrants } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";

export const metadata: Metadata = { title: "Gestion du contenu", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BackOfficePage() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    const grants = parseUserGrants(actor);
    const pages = listPages(db).filter(page => can(grants, actor.role, "view", `page:${page.id}`));
    return <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-700">Back-office · {actor.role}</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">Gestion du contenu</h1><p className="mt-2 text-sm text-emerald-900/70">Connecté en tant que {actor.name}</p></div><LogoutButton /></div>
      <nav className="mt-8 flex flex-wrap gap-3" aria-label="Rubriques du back-office">
        <Link className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" href="/admin/contenu">Pages</Link>
        {can(grants, actor.role, "view", "media") ? <Link className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" href="/admin/contenu/medias">Médiathèque</Link> : null}
        {actor.role === "admin" ? <Link className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" href="/admin/contenu/conditions">Conditions du site</Link> : null}
        {actor.role === "admin" ? <Link className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" href="/admin/contenu/utilisateurs">Utilisateurs et droits</Link> : null}
        {actor.role === "admin" ? <Link className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" href="/admin">Administration existante</Link> : null}
      </nav>
      <div className="mt-10 flex items-baseline justify-between"><h2 className="font-serif text-2xl">Pages administrables</h2><span className="text-sm text-emerald-900/60">{pages.length} page{pages.length > 1 ? "s" : ""}</span></div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">{pages.map(page => <li key={page.id} className="rounded-2xl border border-emerald-950/10 bg-white p-5"><Link href={`/admin/contenu/pages/${page.id}`} className="font-serif text-xl underline-offset-4 hover:underline">/pages/{page.slug}</Link><p className="mt-2 text-xs text-emerald-900/70">{page.published_revision ? `Publié · version ${page.published_revision}` : "Brouillon non publié"}{page.review_requested ? " · Validation demandée" : ""}</p><p className="mt-1 text-xs text-emerald-900/50">Modifié le {new Date(page.updated_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p></li>)}</ul>
      {can(grants, actor.role, "create", "pages") ? <div className="mt-12"><h2 className="font-serif text-2xl">Nouvelle page</h2><NewPageForm /></div> : null}
    </section>;
  } finally { db.close(); }
}
