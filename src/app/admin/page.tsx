import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { absoluteUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Administration du golf",
  description: "Suivi des demandes d’initiation par e-mail et gestion du golf.",
  alternates: { canonical: absoluteUrl("/admin") },
  robots: { index: false, follow: false },
};

type AdminPageProps = { searchParams: Promise<{ error?: string; next?: string }> };
const adminDestinations = ["/admin/competitions", "/admin/restaurant", "/admin/site-conditions", "/admin/archives", "/admin/statistiques"] as const;

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
  return <div className="w-full">
    <section>
      <h1 className="font-serif text-3xl text-emerald-950 sm:text-4xl">Votre tableau de bord</h1>
      <p className="mt-3 text-sm leading-7 text-emerald-950/70">Retrouvez les outils du golf dans le menu latéral et accédez directement aux mises à jour du quotidien.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { href: "/admin/competitions", title: "Calendrier", text: "Voir le mois entier, ajouter une compétition ou modifier une animation." },
          { href: "/admin/restaurant", title: "Restaurant La Bergerie", text: "Actualiser la carte, les prix et le plat du jour." },
          { href: "/admin/site-conditions", title: "État du golf", text: "Mettre à jour les conditions des parcours et des services." },
          { href: "/admin/statistiques", title: "Statistiques", text: "Consulter la fréquentation du site et les connexions." },
          { href: "/admin/archives", title: "Archives des initiations", text: "Retrouver les anciens dossiers en lecture seule." },
          { href: "/admin/contenu", title: "Pages et médias", text: "Ouvrir l’espace de contenu avec votre compte personnel." },
        ].map(item => <Link key={item.href} href={item.href} className="group flex flex-col rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm transition hover:border-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-700"><h2 className="font-serif text-2xl">{item.title}</h2><p className="mt-3 flex-1 text-sm leading-7 text-emerald-950/70">{item.text}</p><span className="mt-5 text-sm font-semibold text-emerald-800">Ouvrir la rubrique →</span></Link>)}
      </div>
      <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-5" aria-labelledby="initiation-inbox">
        <h2 id="initiation-inbox" className="font-serif text-2xl text-emerald-950">Demandes d’initiation</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/80">Le formulaire transmet les demandes à <strong>{inbox}</strong>. Consultez les messages dont l’objet commence par <strong>[Initiation] Demande pour le</strong>, puis répondez au visiteur pour confirmer le créneau. Le règlement se fait sur place.</p>
        <p className="mt-3 text-sm leading-7 text-emerald-900/80">Les demandes par e-mail n’apparaissent pas dans cette administration. Si l’envoi échoue mais que la demande est enregistrée dans la file de secours, le visiteur est informé que l’équipe la traitera après rétablissement de la messagerie. Aucune place n’est réservée avant votre confirmation.</p>
      </section>
    </section>
  </div>;
}
