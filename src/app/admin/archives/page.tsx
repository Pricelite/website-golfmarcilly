import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { ARCHIVE_PAGE_SIZE, listArchivedReservations } from "@/lib/initiation/archive";

export const metadata: Metadata = { title: "Archives des initiations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PAID: "Réglée (historique)",
  CONFIRMED: "Confirmée",
  PENDING: "En attente (historique)",
  CANCELED: "Annulée",
  FAILED: "Échouée",
  EXPIRED: "Expirée",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeZone: "Europe/Paris" }).format(date);
}

export default async function AdminArchivesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) redirect("/admin?next=/admin/archives");

  const rawPage = (await searchParams).page;
  const parsedPage = Number(rawPage);
  const page = rawPage && Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 100_000 ? parsedPage : 1;
  let result: Awaited<ReturnType<typeof listArchivedReservations>> | null = null;
  try { result = await listArchivedReservations(page); }
  catch { /* The current administration remains usable when the historic table is absent. */ }

  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    <Link href="/admin" className="text-sm font-semibold text-emerald-900 underline underline-offset-4">← Retour à l’administration</Link>
    <h1 className="mt-6 font-serif text-3xl text-emerald-950">Archives des initiations</h1>
    <p className="mt-3 text-sm leading-7 text-emerald-900/75">Anciennes réservations conservées dans Supabase. Cette liste est en lecture seule ; les demandes actuelles se suivent par e-mail.</p>
    {!result ? <p role="alert" className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">Les archives sont momentanément indisponibles. Vérifiez la connexion Supabase et les anciennes migrations.</p> : <>
      <p className="mt-6 text-sm text-emerald-900/75">{result.total} réservation{result.total > 1 ? "s" : ""} au total · page {page}</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-white">
        <table className="min-w-[800px] w-full text-left text-sm text-emerald-950">
          <thead className="bg-emerald-50"><tr><th className="px-4 py-3">Créneau</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Personnes</th><th className="px-4 py-3">Repas</th><th className="px-4 py-3">Statut</th></tr></thead>
          <tbody>{result.reservations.map(reservation => {
            const slot = Array.isArray(reservation.slot) ? reservation.slot[0] : reservation.slot;
            return <tr key={reservation.id} className="border-t border-emerald-950/10 align-top">
              <td className="px-4 py-3">{slot ? `${formatDate(`${slot.date}T12:00:00Z`)} · ${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}` : "—"}</td>
              <td className="px-4 py-3">{reservation.full_name}</td>
              <td className="px-4 py-3"><a className="underline underline-offset-2" href={`mailto:${reservation.email}`}>{reservation.email}</a><br />{reservation.phone}</td>
              <td className="px-4 py-3">{reservation.participants_count}</td>
              <td className="px-4 py-3">{reservation.meal_option === "WITH_MEAL" ? "Oui" : "Non"}</td>
              <td className="px-4 py-3">{statusLabels[reservation.status] ?? reservation.status}</td>
            </tr>;
          })}</tbody>
        </table>
        {result.reservations.length === 0 && <p className="p-5 text-sm text-emerald-900/75">Aucune réservation sur cette page.</p>}
      </div>
      <nav aria-label="Pages des archives" className="mt-6 flex gap-4 text-sm font-semibold text-emerald-900">
        {page > 1 && <Link className="underline underline-offset-4" href={`/admin/archives?page=${page - 1}`}>Page précédente</Link>}
        {page * ARCHIVE_PAGE_SIZE < result.total && <Link className="underline underline-offset-4" href={`/admin/archives?page=${page + 1}`}>Page suivante</Link>}
      </nav>
    </>}
  </main>;
}
