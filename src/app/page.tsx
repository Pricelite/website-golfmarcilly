import type { Metadata } from "next";

import PageHero from "@/components/page-hero";
import { RESERVATION_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accueil",
  description: SITE_DESCRIPTION,
};

const reserveUrl = RESERVATION_URL;
const todayLabel = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
}).format(new Date());

const competitions = [
  "Coupe du Printemps - 12 avril",
  "Trophee des Membres - 27 avril",
  "Open d'ete - 15 mai",
];

const clubHighlights = [
  { title: "Parcours nature", text: "Greens rapides, fairways larges." },
  { title: "Club house", text: "Terrasse, salon, espace detente." },
  { title: "Services", text: "Practice, pro shop, location." },
];

const teachingOffers = [
  { label: "Initiation", price: "A partir de 25 EUR" },
  { label: "Cours particuliers", price: "55 EUR" },
  { label: "Stages", price: "140 EUR" },
];

const associationTags = [
  "Competitions interclubs",
  "Classements",
  "Adhesion annuelle",
];

const tarifCards = [
  { title: "Green fee", price: "48 EUR", text: "Acces parcours." },
  { title: "Abonnement", price: "99 EUR/mois", text: "Illimite." },
  { title: "Practice", price: "12 EUR", text: "Seau 60 balles." },
];

export default function Home() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Golf de Marcilly"
        subtitle="Un parcours d'exception, un club house chaleureux et une ambiance conviviale au coeur de la Sologne."
        backgroundImage="/images/club-house-marcilly.png"
        ctaLabel="Reserver un depart"
        ctaHref={reserveUrl}
        ctaExternal
      />

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 py-12" id="info-jour">
          <div className="grid gap-6 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                Info du jour
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
                {todayLabel}
              </h2>
              <p className="mt-3 text-sm leading-6 text-emerald-900/70">
                Parcours ouverts, practice disponible et evenement club en fin de
                journee.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              <div className="flex items-center justify-between">
                <span>Parcours 18 trous</span>
                <span className="font-semibold">Ouvert</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Practice</span>
                <span className="font-semibold">Ouvert</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Evenement</span>
                <span className="font-semibold">Afterwork 18h00</span>
              </div>
            </div>
          </div>
        </section>

        <section id="reserver" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="rounded-[32px] border border-emerald-900/10 bg-emerald-950 px-8 py-10 text-emerald-50 shadow-xl shadow-emerald-900/20 md:flex md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                Reservation
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl md:text-4xl">
                Reservez votre depart en quelques clics
              </h2>
              <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                Choisissez votre horaire et profitez d&apos;un accueil personalise.
              </p>
            </div>
            <a
              className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-white md:mt-0"
              href={reserveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Reserver maintenant
            </a>
          </div>
        </section>

        <section id="competitions" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                Competitions & evenements
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
                Prochaines dates a ne pas manquer
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-emerald-900/70">
                {competitions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Calendrier
              </p>
              <p className="mt-3 text-sm leading-6 text-emerald-900/70">
                Consultez toutes les competitions, animations et soirees du club.
              </p>
              <button className="mt-6 w-full rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800">
                Voir le calendrier complet
              </button>
            </div>
          </div>
        </section>

        <section id="club" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Le Club
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
              Un cadre naturel et des equipements premium
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-900/70">
              Parcours entretenus, restaurant, pro shop et practice pour tous les
              niveaux.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {clubHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900"
                >
                  <h3 className="font-[var(--font-display)] text-lg text-emerald-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-emerald-900/70">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="enseignement" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                Enseignement
              </p>
              <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
                Ecole de golf et coaching sur mesure
              </h2>
              <p className="mt-3 text-sm leading-6 text-emerald-900/70">
                Cours particuliers, stages collectifs et accompagnement
                personnalise.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              {teachingOffers.map((offer) => (
                <div
                  key={offer.label}
                  className="flex items-center justify-between"
                >
                  <span>{offer.label}</span>
                  <span className="font-semibold">{offer.price}</span>
                </div>
              ))}
              <button className="mt-6 w-full rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800">
                Reserver un cours
              </button>
            </div>
          </div>
        </section>

        <section id="association" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Association sportive
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
              Vivre le golf en competition et en equipe
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-900/70">
              Rejoignez nos equipes, participez aux competitions et profitez de
              moments conviviaux.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {associationTags.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="tarifs" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Tarifs
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
              Formules adaptees a chaque joueur
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {tarifCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900"
                >
                  <h3 className="font-[var(--font-display)] text-lg text-emerald-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-2xl font-semibold text-emerald-950">
                    {item.price}
                  </p>
                  <p className="mt-2 text-sm text-emerald-900/70">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

