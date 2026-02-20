import Link from "next/link";
import type { Metadata } from "next";

import PageHero from "@/components/page-hero";
import ProCard from "@/components/enseignement/pro-card";

export const metadata: Metadata = {
  title: "Enseignement",
  description:
    "Cours de golf, coaching et accompagnement personnalisé pour progresser à votre rythme, du débutant au confirmé.",
};

const pros = [
  {
    name: "Roman",
    specialty: "Enseignement & progression technique",
    imageSrc: "/roman.png",
    website: "https://www.romanlissowski.com/",
  },
  {
    name: "Adrien",
    specialty: "Coaching personnalisé & performance",
    imageSrc: "/adrien.png",
    website: "https://www.adrienlafuge.com/",
  },
  {
    name: "Baptiste",
    specialty: "Parcours & stratégie de jeu",
    imageSrc: "/baptiste.png",
    website: "https://baptistecourtachon.com/",
  },
] as const;

const schoolFormulas = [
  {
    title: "Cours enfant débutant",
    level: "Âge minimum : 6 ans",
    price: "15 € / mois",
    schedule: "Mercredi : 11h-12h ou Samedi : 14h-15h",
  },
  {
    title: "Cours enfant perfectionnement",
    level: "Accès selon niveau et validation enseignant",
    price: "35 € / mois",
    schedule: "Mercredi : 11h-12h ou Samedi : 14h-15h",
  },
] as const;

export default function Page() {
  return (
    <div className="bg-emerald-50/20 text-emerald-950">
      <PageHero
        title="Enseignement"
        description="Progressez avec un accompagnement sur-mesure, du premier swing à la performance, grâce à une pédagogie claire et bienveillante."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section aria-labelledby="nos-pros">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="nos-pros"
              className="font-[var(--font-display)] text-3xl text-emerald-950"
            >
              Nos Pros
            </h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pros.map((pro) => (
              <ProCard key={pro.name} {...pro} />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="ecole-de-golf">
          <div className="rounded-[28px] border border-emerald-900/10 bg-white p-8 shadow-sm">
            <h2
              id="ecole-de-golf"
              className="font-[var(--font-display)] text-3xl text-emerald-950"
            >
              École de Golf
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-emerald-900/80">
              <p>
                L&apos;École de Golf accueille les enfants, les débutants et les
                passionnés qui souhaitent progresser dans un cadre structuré.
              </p>
              <p>
                Les apprentissages sont encadrés par nos pros et s&apos;articulent
                autour de séances régulières, d&apos;objectifs de progression et
                d&apos;un suivi pédagogique.
              </p>
              <p>
                Cours collectifs, stages et accompagnement individuel sont
                proposés tout au long de la saison pour accompagner chaque
                joueur.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Nous contacter
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {schoolFormulas.map((formula) => (
                <article
                  key={formula.title}
                  className="rounded-3xl border border-emerald-900/10 bg-emerald-50/50 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-emerald-950">
                    {formula.title}
                  </h3>
                  <p className="mt-3 text-sm text-emerald-900/80">
                    {formula.level}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {formula.price}
                  </p>
                  <p className="mt-2 text-sm text-emerald-900/80">
                    {formula.schedule}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
