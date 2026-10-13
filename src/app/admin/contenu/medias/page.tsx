import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MediaManager } from "@/components/backoffice/media-manager";
import { currentActor } from "@/lib/backoffice/auth";
import { openDb, parseUserGrants, type MediaRow } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";

export const metadata: Metadata = { title: "Médiathèque", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MediaPage() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    const grants = parseUserGrants(actor);
    if (!can(grants, actor.role, "view", "media")) notFound();
    const media = db.prepare("SELECT id,filename,mime,size,created_at FROM media ORDER BY created_at DESC LIMIT 200").all() as MediaRow[];
    return <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Link className="text-sm underline" href="/admin/contenu">← Back-office</Link><h1 className="mt-5 font-serif text-4xl">Médiathèque</h1><p className="mt-3 text-sm text-emerald-900/70">Images JPEG, PNG ou WebP, 5 Mo maximum. Une image de brouillon reste privée.</p><MediaManager initialMedia={media} mayCreate={can(grants, actor.role, "create", "media")} mayDelete={can(grants, actor.role, "delete", "media")} /></section>;
  } finally { db.close(); }
}
