import type { Metadata } from "next";
import Link from "next/link";

import { INITIATION_CALENDAR_EMBED_URL } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Reservation initiation | Golf de Marcilly",
  description:
    "Consultez le planning Google Agenda des initiations et contactez-nous pour reserver votre creneau.",
};

export default function InitiationReservationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-7 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Reservation initiation
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-emerald-900/75">
          Consultez le planning officiel Google Agenda des initiations puis
          envoyez votre demande de reservation.
        </p>
      </section>

      <section className="mt-7 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">
          1. Planning initiation
        </h2>
        <p className="mt-2 text-sm text-emerald-900/70">
          Le planning ci-dessous est le vrai agenda Google initiation.
        </p>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Avertissement: lorsqu&apos;un creneau est reserve, il apparait comme
          indisponible. Aucune coordonnee, nom ou prenom client n&apos;est affiche
          publiquement.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white">
          <iframe
            src={INITIATION_CALENDAR_EMBED_URL}
            title="Planning Google Agenda - Initiation"
            className="h-[700px] w-full border-0"
            loading="lazy"
          />
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">2. Reservation</h2>
        <p className="mt-2 text-sm text-emerald-900/75">
          Choisissez votre creneau dans l&apos;agenda puis contactez-nous pour le
          valider.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/contact?type=reservation-initiation"
            className="inline-flex rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
          >
            Contacter pour reserver
          </Link>
          <a
            href={INITIATION_CALENDAR_EMBED_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-emerald-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
          >
            Ouvrir l agenda dans un onglet
          </a>
        </div>
      </section>
    </main>
  );
}
