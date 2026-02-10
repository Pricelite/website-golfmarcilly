import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/page-hero";
import TarifsSections from "@/components/tarifs-sections";

export const metadata: Metadata = {
  title: "Tarifs 2026 - Vie du club",
  description:
    "Consultez les tarifs 2026 du Golf de Marcilly depuis la rubrique Vie du club.",
};

export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Tarifs 2026"
        subtitle="Rubrique Vie du club: consultez les sections tarifaires completes."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
            Vie du club
          </p>
          <h2 className="mt-4 font-[var(--font-display)] text-2xl text-emerald-950">
            Tarifs 2026
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            Vous pouvez aussi consulter la page principale des tarifs avec le
            meme detail.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              href="/tarifs"
            >
              Voir la page principale des tarifs
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              href="/vie-du-club"
            >
              Retour vie du club
            </Link>
          </div>
        </section>

        <TarifsSections />
      </main>
    </div>
  );
}
