import type { Metadata } from "next";

import TarifsSections from "@/components/tarifs-sections";

export const metadata: Metadata = {
  title: "Tarifs 2026",
  description: "Consultez les tarifs 2026 du Golf de Marcilly.",
};

export default function TarifsPage() {
  return (
    <div className="text-emerald-950">
      <main className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <h1 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
            Tarifs 2026
          </h1>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            Consultez les tarifs par catégorie : initiation, practice, green fees
            et location.
          </p>
        </section>

        <TarifsSections />
      </main>
    </div>
  );
}
