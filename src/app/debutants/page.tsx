import Link from "next/link";
import type { Metadata } from "next";

import PageHero from "@/components/page-hero";

const pageTitle = "D\u00e9butants & non-golfeurs";
const introText =
  "Vous n\u2019avez jamais jou\u00e9 ? Ici, tout est fait pour commencer simplement : initiation, pr\u00eat du mat\u00e9riel, et accompagnement par nos pros.";
type BeginnerTariff = {
  title: string;
  price: string;
  details: string;
  reservationHref?: string;
  reservationLabel?: string;
};

const beginnerTariffs: readonly BeginnerTariff[] = [
  {
    title: "1 seau de balles",
    price: "4 \u20ac",
    details: "Acc\u00e8s practice pour 1 seau.",
  },
  {
    title: "2 seaux de balles",
    price: "6 \u20ac",
    details: "Acc\u00e8s practice pour 2 seaux.",
  },
  {
    title: "Practice d\u00e9butant",
    price: "10 \u20ac / personne",
    details: "Acc\u00e8s illimit\u00e9 au practice.",
  },
  {
    title: "Parcours d\u00e9couverte 9 trous",
    price: "10 \u20ac",
    details: "Parcours sp\u00e9cialement con\u00e7u pour d\u00e9butant.",
  },
  {
    title: "Formule initiation 1",
    price: "25 \u20ac",
    details: "1 heure de cours avec un pro et parcours d\u00e9couverte 9 trous.",
    reservationHref: "/initiation/reservation?mealOption=WITHOUT_MEAL",
    reservationLabel: "Reservez et payer",
  },
  {
    title: "Formule initiation 2",
    price: "48 \u20ac",
    details:
      "1 heure de cours avec un pro, repas du midi inclus et parcours 9 trous d\u00e9couverte l\u2019apr\u00e8s-midi.",
    reservationHref: "/initiation/reservation?mealOption=WITH_MEAL",
    reservationLabel: "Reservez et payer",
  },
];

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
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {beginnerTariffs.map((tariff) => (
              <article
                key={tariff.title}
                className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5"
              >
                <h3 className="text-base font-semibold text-emerald-950">
                  {tariff.title}
                </h3>
                <p className="mt-2 text-2xl font-bold text-emerald-900">
                  {tariff.price}
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                  {tariff.details}
                </p>
                {tariff.reservationHref ? (
                  <Link
                    href={tariff.reservationHref}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  >
                    {tariff.reservationLabel ?? "Reservez et payer"}
                  </Link>
                ) : null}
              </article>
            ))}
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
