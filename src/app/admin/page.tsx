import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { absoluteUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Administration du golf",
  description: "Suivi des demandes d'initiation par e-mail et gestion du golf.",
  alternates: { canonical: absoluteUrl("/admin") },
  robots: { index: false, follow: false },
};

type AdminPageProps = { searchParams: Promise<{ error?: string; next?: string }> };
const adminDestinations = ["/admin/competitions", "/admin/restaurant", "/admin/site-conditions", "/admin/archives"] as const;

function AdminLogin({ error, next }: { error?: string; next?: string }) {
  const message = error === "rate_limited"
    ? "Trop de tentatives. Merci de patienter avant de réessayer."
    : error === "untrusted_origin"
      ? "Origine non autorisée. Rechargez la page puis réessayez."
      : error === "missing_password"
        ? "Le mot de passe est requis."
        : error ? "Mot de passe invalide." : "";

  return <div className="mx-auto w-full max-w-md px-6 py-12">
    <section className="rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10">
      <h1 className="font-serif text-2xl text-emerald-950">Administration du golf</h1>
      <p className="mt-2 text-sm text-emerald-900/70">Entrez le mot de passe administrateur.</p>
      {message && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>}
      <form action="/admin/login" method="post" className="mt-4 space-y-4">
        <input type="hidden" name="next" value={adminDestinations.includes(next as typeof adminDestinations[number]) ? next : "/admin"} />
        <label className="block text-sm text-emerald-900/80">Mot de passe
          <input className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300" type="password" name="password" required />
        </label>
        <button className="inline-flex rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800" type="submit">Se connecter</button>
      </form>
    </section>
  </div>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return <div className="mx-auto max-w-xl px-6 py-12"><h1 className="font-serif text-3xl">Administration du golf</h1><p className="mt-4">L’accès administrateur n’est pas encore configuré.</p></div>;
  }
  if (!(await isAdminAuthenticated(await cookies()))) {
    return <AdminLogin error={params.error} next={params.next} />;
  }
  if (adminDestinations.includes(params.next as typeof adminDestinations[number])) redirect(params.next!);

  const inbox = process.env.EMAIL_TO?.trim() || "golf@marcilly.com";
  return <div className="mx-auto w-full max-w-5xl px-6 py-10">
    <section className="rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-emerald-950">Administration du golf</h1>
        <form action="/admin/logout" method="post"><button type="submit" className="rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">Déconnexion</button></form>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white" href="/admin/competitions">Gérer les compétitions</Link>
        <Link className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white" href="/admin/restaurant">Modifier la carte du jour</Link>
        <Link className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white" href="/admin/site-conditions">État du golf</Link>
        <Link className="rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900" href="/admin/archives">Archives des initiations</Link>
      </div>
      <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-5" aria-labelledby="initiation-inbox">
        <h2 id="initiation-inbox" className="font-serif text-2xl text-emerald-950">Demandes d’initiation</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/80">Le formulaire transmet les demandes à <strong>{inbox}</strong>. Consultez les messages dont l’objet commence par <strong>[Initiation] Demande pour le</strong>, puis répondez au visiteur pour confirmer le créneau. Le règlement se fait sur place.</p>
        <p className="mt-3 text-sm leading-7 text-emerald-900/80">Les demandes par e-mail n’apparaissent pas dans cette administration. En cas d’échec d’envoi, le formulaire affiche une erreur au visiteur.</p>
      </section>
    </section>
  </div>;
}
