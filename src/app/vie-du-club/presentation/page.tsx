import type { Metadata } from "next";

import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Presentation du golf",
  description:
    "Decouvrez la presentation generale du Golf de Marcilly, ses parcours et ses installations.",
};

export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Presentation generale du golf"
        subtitle="Domaine, parcours et services du Golf de Marcilly."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-sm leading-6 text-emerald-900/80">
            Le Golf de Marcilly est un domaine de golf bien etabli, cree en
            1986, situe au Domaine de la Plaine a Marcilly-en-Villette, au sud
            d&apos;Orleans dans la region Centre-Val de Loire.
          </p>
        </section>

        <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
            Parcours disponibles
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Le club est l&apos;un des rares en France a proposer jusqu&apos;a
            45 trous differents repartis sur plusieurs parcours adaptes a tous
            les niveaux.
          </p>

          <div className="mt-6 space-y-6 text-sm leading-6 text-emerald-900/80">
            <div>
              <h3 className="font-semibold text-emerald-950">
                Parcours 18 trous competition
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Par 72</li>
                <li>Environ 6 273 a 6 303 m selon les departs choisis</li>
                <li>Concu par Olivier Brizon</li>
                <li>
                  Convient aux joueurs experimentes et aux competitions
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-950">
                Parcours Pitch and Putt 18 trous
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Par 55</li>
                <li>Plus court et ideal pour s&apos;initier ou jouer rapidement</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-950">
                Parcours decouverte / Compact / Kaleka
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Formats 9 trous ou multiples 9 trous</li>
                <li>Parcours plus courts et accessibles aux debutants</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
            Score et difficultes
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Sur le parcours 18 trous classique, chaque trou a un par total de
            72, avec une variete de pars 3, 4 et 5. Un exemple de scorecard
            (distance et handicap par trou) est disponible si vous souhaitez
            une liste complete.
          </p>
        </section>

        <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
            Installations et services
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-6 text-emerald-900/80">
            <li>Practice avec plus de 40 postes (dont certains couverts)</li>
            <li>Zones d&apos;approche et greens d&apos;entrainement</li>
            <li>Location de clubs, chariots et voiturettes</li>
            <li>Club-house, restaurant et bar sur place</li>
            <li>Pro-shop avec materiel de golf</li>
            <li>Cours et stages pour tous niveaux</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
