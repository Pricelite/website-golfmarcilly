import type { Metadata } from "next";

import PageHero from "@/components/page-hero";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import { CALENDAR_EMBED_URL } from "@/lib/calendar";
import { RESERVATION_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accueil",
  description: SITE_DESCRIPTION,
};

const reserveUrl = RESERVATION_URL;
const todayLabel = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
}).format(new Date());

const dailyStatus = [
  { label: "Practice", status: "open" },
  { label: "Parcours Decouverte", status: "open" },
  { label: "Parcours Pitch and Putt", status: "open" },
  { label: "Parcours Kaleka", status: "open" },
  { label: "Parcours Competition Alle", status: "open" },
  { label: "Parcours Competition Retour", status: "open" },
  { label: "Restaurant La Bergerie", status: "open" },
];

export default function Home() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Golf de Marcilly-Orleans"
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
              {dailyStatus.map((item, index) => {
                const isOpen = item.status === "open";

                return (
                  <div
                    key={item.label}
                    className={`${index > 0 ? "mt-3" : ""} flex items-center justify-between`}
                  >
                    <span>{item.label}</span>
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOpen ? "bg-emerald-600" : "bg-rose-500"
                        }`}
                        aria-hidden="true"
                      />
                      {isOpen ? "Ouvert" : "Ferme"}
                    </span>
                  </div>
                );
              })}
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
          <PublicCalendarEmbed
            title="Competition et evenement"
            src={CALENDAR_EMBED_URL}
          />
        </section>
      </main>
    </div>
  );
}
