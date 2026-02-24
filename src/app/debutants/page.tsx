import Link from "next/link";
import type { Metadata } from "next";

import PageHero from "@/components/page-hero";

const pageTitle = "D\u00e9butants & non-golfeurs";
const introText =
  "Vous n\u2019avez jamais jou\u00e9 ? Ici, tout est fait pour commencer simplement : initiation, pr\u00eat du mat\u00e9riel, et accompagnement par nos pros.";

export const metadata: Metadata = {
  title: pageTitle,
  description:
    "Commencez le golf simplement \u00e0 Marcilly : initiation, mat\u00e9riel pr\u00eat\u00e9 et accompagnement pas \u00e0 pas.",
};

export default function DebutantsPage() {
  return (
    <div className="bg-emerald-50/20 text-emerald-950">
      <PageHero
        title={pageTitle}
        description={introText}
        backgroundImage="/images/practicemarcilly.png"
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section
          aria-labelledby="debutants-pour-qui"
          className="rounded-[28px] border border-emerald-900/10 bg-white p-8 shadow-sm"
        >
          <h2
            id="debutants-pour-qui"
            className="font-[var(--font-display)] text-3xl text-emerald-950"
          >
            Pour qui ?
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-emerald-900/80">
            <li>{"D\u00e9butants qui veulent d\u00e9marrer dans un cadre rassurant."}</li>
            <li>{"Joueurs en reprise qui souhaitent repartir sur de bonnes bases."}</li>
            <li>{"Curieux qui veulent d\u00e9couvrir le golf sans pression."}</li>
          </ul>
        </section>

        <section
          aria-labelledby="debutants-comment"
          className="mt-8 rounded-[28px] border border-emerald-900/10 bg-white p-8 shadow-sm"
        >
          <h2
            id="debutants-comment"
            className="font-[var(--font-display)] text-3xl text-emerald-950"
          >
            {"Comment \u00e7a se passe ?"}
          </h2>
          <ol className="mt-4 space-y-2 text-sm leading-7 text-emerald-900/80">
            <li>{"1. Prise de contact avec l\u2019\u00e9quipe."}</li>
            <li>{"2. S\u00e9ance d\u2019initiation adapt\u00e9e \u00e0 votre niveau."}</li>
            <li>{"3. Premiers cours pour installer les bons rep\u00e8res."}</li>
            <li>{"4. Acc\u00e8s progressif au parcours selon votre progression."}</li>
          </ol>
        </section>

        <section
          aria-labelledby="debutants-tarifs"
          className="mt-8 rounded-[28px] border border-emerald-900/10 bg-white p-8 shadow-sm"
        >
          <h2
            id="debutants-tarifs"
            className="font-[var(--font-display)] text-3xl text-emerald-950"
          >
            {"Tarifs d\u00e9butants"}
          </h2>
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-900/25 bg-emerald-50/50 px-4 py-5 text-sm text-emerald-900/80">
            {"Emplacement tarifs \u00e0 compl\u00e9ter."}
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-emerald-900/10 bg-emerald-950 px-8 py-8 text-emerald-50 shadow-sm">
          <h2 className="font-[var(--font-display)] text-2xl md:text-3xl">
            {"Pr\u00eat \u00e0 commencer ?"}
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Nous contacter
            </Link>
            <Link
              href="/enseignement"
              className="inline-flex items-center justify-center rounded-full border border-emerald-100/50 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {"D\u00e9couvrir l\u2019enseignement"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
