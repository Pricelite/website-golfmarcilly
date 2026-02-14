import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/page-hero";
import { toProtectedImageSrc } from "@/lib/protected-image";

export const metadata: Metadata = {
  title: "Académie",
  description:
    "Présentation de l'académie du Golf de Marcilly et des jeunes en formation.",
};

const youngFrames = [
  {
    slot: "Sarah GRATTE",
    imageSrc: "/sarahgratte.png",
  },
  {
    slot: "Camille DA VIOLANTE",
    imageSrc: "/images/camilledaviolante.png",
  },
  {
    slot: "Victor DELMAS",
    imageSrc: "/images/victordelmas.png",
  },
] as const;

const ACADOMIA_URL = "https://www.acadomia.fr/";

export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Académie du Golf de Marcilly"
        backgroundImage="/images/acadomia.png"
      >
        <a
          className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          href={ACADOMIA_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Acadomia
        </a>
      </PageHero>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                Pédagogie de l&apos;académie
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
                Suivi personnalisé et progression mesurée
              </h2>
              <p className="mt-4 text-sm leading-7 text-emerald-900/80">
                Cette section est construite pour reprendre un style académique :
                informations claires, objectifs visibles et parcours évolutif.
                Chaque jeune peut être présenté avec sa photo, son groupe et son
                objectif du moment.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Petit effectif par séance",
                "Coaching par objectifs",
                "Bilans de progression réguliers",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Jeunes de l&apos;académie
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {youngFrames.map((profile) => (
              <article
                key={profile.slot}
                className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm"
              >
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/60">
                  <Image
                    src={toProtectedImageSrc(profile.imageSrc)}
                    alt={profile.slot}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1280px) 44vw, 320px"
                    className="object-cover object-center"
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-emerald-950">
                  {profile.slot}
                </h3>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
