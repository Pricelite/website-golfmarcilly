import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CompetitionManager } from "@/components/admin/competition-manager";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { CalendarStoreError, listAssociationEvents } from "@/lib/association-events-db";

export const metadata: Metadata = { title: "Administration des compétitions", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCompetitionsPage() {
  if (!process.env.ADMIN_PASSWORD || !(await isAdminAuthenticated(await cookies()))) redirect("/admin?next=/admin/competitions");
  let events;
  let error = "";
  try { events = await listAssociationEvents(); }
  catch (cause) {
    error = cause instanceof CalendarStoreError && cause.reason === "setup"
      ? "La gestion du calendrier doit être activée : configurez Supabase et appliquez la migration des compétitions indiquée dans CALENDRIER-AS.md. Le programme actuel reste visible sur le site."
      : "Le calendrier est temporairement indisponible. Rechargez la page pour réessayer.";
  }
  return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-3xl text-emerald-950">Gestion des compétitions</h1>
      <form action="/admin/logout" method="post"><button className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" type="submit">Déconnexion</button></form>
    </div>
    <nav className="mt-4 flex flex-wrap gap-5 text-sm text-emerald-900" aria-label="Administration">
      <Link className="underline underline-offset-4" href="/admin">Réservations initiation</Link>
      <Link className="underline underline-offset-4" href="/association-sportive#competitions" target="_blank" rel="noreferrer">Voir le calendrier public ↗</Link>
    </nav>
    {error ? <p role="alert" className="mt-8 rounded-2xl bg-amber-50 p-5 text-amber-950">{error}</p> : <CompetitionManager initialEvents={events ?? []} />}
  </div>;
}
