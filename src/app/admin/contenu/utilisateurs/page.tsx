import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserManager } from "@/components/backoffice/user-manager";
import { currentActor } from "@/lib/backoffice/auth";
import { listPages, openDb, type UserRow } from "@/lib/backoffice/db";

export const metadata: Metadata = { title: "Utilisateurs et permissions", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function UsersPage() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    if (actor.role !== "admin") notFound();
    const users = db.prepare("SELECT id,email,name,role,grants_json,active FROM users ORDER BY created_at").all() as UserRow[];
    const pages = listPages(db).map(page => ({ id: page.id, slug: page.slug }));
    const audit = (db.prepare("SELECT action,target,created_at FROM audit ORDER BY id DESC LIMIT 50").all() as { action: string; target: string; created_at: string }[])
      .map(({ action, target, created_at }) => ({ action, target, created_at }));
    return <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Link className="text-sm underline" href="/admin/contenu">← Back-office</Link><h1 className="mt-5 font-serif text-4xl">Utilisateurs et droits</h1><p className="mt-3 text-sm text-emerald-900/70">Chaque personne utilise son compte. Les droits sont explicites et vérifiés sur le serveur.</p><UserManager currentId={actor.id} initialUsers={users.map(user => ({ id: user.id, email: user.email, name: user.name, role: user.role, active: Boolean(user.active), grants: JSON.parse(user.grants_json) }))} pages={pages} audit={audit} /></section>;
  } finally { db.close(); }
}
