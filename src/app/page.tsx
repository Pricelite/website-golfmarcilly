import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/page-hero";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import { CALENDAR_EMBED_URL } from "@/lib/calendar";
import { PRIMA_URL } from "@/lib/prima";
import { SITE_DESCRIPTION } from "@/lib/site";
import { toProtectedImageSrc } from "@/lib/protected-image";
import { getTodayWeather, type TodayWeather } from "@/lib/weather";

export const metadata: Metadata = {
  title: "Accueil",
  description: SITE_DESCRIPTION,
};

const clubGolfUrl =
  "https://leclub-golf.com/fr/green-fees/france/5-golf-de-marcilly";
const todayLabel = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
}).format(new Date());

const dailyStatus = [
  { label: "Practice", status: "open" },
  { label: "Parcours Découverte", status: "open" },
  { label: "Parcours Pitch and Putt", status: "open" },
  { label: "Parcours Kaleka", status: "open" },
  { label: "Parcours Compétition Aller", status: "open" },
  { label: "Parcours Compétition Retour", status: "open" },
  { label: "Restaurant La Bergerie", status: "open" },
];

const HOME_NEWS_ASSETS = [
  { title: "Actualité 1", src: "/images/gp 2026 - 2.png" },
  { title: "Actualité 2", src: "/images/gp 2026 - 2.png" },
  { title: "Actualité 3", src: "/images/gp 2026 - 2.png" },
] as const;

function WeatherIllustration({
  visual,
  size = "lg",
}: {
  visual: TodayWeather["visual"];
  size?: "sm" | "lg";
}) {
  const iconSize = size === "sm" ? "h-7 w-7" : "h-16 w-16";

  if (visual === "sun") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="12" fill="#f59e0b" />
        <g stroke="#d97706" strokeLinecap="round" strokeWidth="4">
          <line x1="32" y1="5" x2="32" y2="15" />
          <line x1="32" y1="49" x2="32" y2="59" />
          <line x1="5" y1="32" x2="15" y2="32" />
          <line x1="49" y1="32" x2="59" y2="32" />
          <line x1="11" y1="11" x2="18" y2="18" />
          <line x1="46" y1="46" x2="53" y2="53" />
          <line x1="11" y1="53" x2="18" y2="46" />
          <line x1="46" y1="18" x2="53" y2="11" />
        </g>
      </svg>
    );
  }

  if (visual === "partly") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <circle cx="22" cy="20" r="9" fill="#f59e0b" />
        <g stroke="#d97706" strokeLinecap="round" strokeWidth="2.5">
          <line x1="22" y1="6" x2="22" y2="11" />
          <line x1="10" y1="20" x2="15" y2="20" />
          <line x1="29" y1="11" x2="32" y2="8" />
        </g>
        <path
          d="M12 45c0-6.3 5.1-11.4 11.4-11.4 3.5 0 6.6 1.5 8.7 3.9 1.4-.7 3-1.1 4.8-1.1 5.8 0 10.5 4.7 10.5 10.6H12z"
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (visual === "fog") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <path
          d="M12 34c0-6 4.9-10.9 10.9-10.9 3 0 5.9 1.3 8 3.4 1.3-.6 2.7-.9 4.2-.9 5.6 0 10.1 4.5 10.1 10.1H12z"
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth="2"
        />
        <g stroke="#64748b" strokeLinecap="round" strokeWidth="3">
          <line x1="10" y1="44" x2="54" y2="44" />
          <line x1="14" y1="51" x2="50" y2="51" />
        </g>
      </svg>
    );
  }

  if (visual === "rain") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <path
          d="M12 33c0-6.2 5-11.2 11.2-11.2 3.2 0 6.1 1.4 8.2 3.6 1.3-.6 2.8-.9 4.3-.9 5.8 0 10.5 4.7 10.5 10.5H12z"
          fill="#64748b"
          stroke="#334155"
          strokeWidth="2"
        />
        <g stroke="#0284c7" strokeLinecap="round" strokeWidth="3.5">
          <line x1="22" y1="41" x2="18" y2="51" />
          <line x1="32" y1="41" x2="28" y2="51" />
          <line x1="42" y1="41" x2="38" y2="51" />
        </g>
      </svg>
    );
  }

  if (visual === "snow") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <path
          d="M12 33c0-6.2 5-11.2 11.2-11.2 3.2 0 6.1 1.4 8.2 3.6 1.3-.6 2.8-.9 4.3-.9 5.8 0 10.5 4.7 10.5 10.5H12z"
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth="2"
        />
        <g fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5">
          <circle cx="22" cy="45" r="3" />
          <circle cx="32" cy="47" r="3" />
          <circle cx="42" cy="45" r="3" />
        </g>
      </svg>
    );
  }

  if (visual === "storm") {
    return (
      <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
        <path
          d="M12 33c0-6.2 5-11.2 11.2-11.2 3.2 0 6.1 1.4 8.2 3.6 1.3-.6 2.8-.9 4.3-.9 5.8 0 10.5 4.7 10.5 10.5H12z"
          fill="#475569"
          stroke="#1f2937"
          strokeWidth="2"
        />
        <path d="M33 38l-8 13h6l-3 9 11-16h-6l3-6z" fill="#fbbf24" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={iconSize} viewBox="0 0 64 64">
      <path
        d="M12 36c0-6.2 5-11.2 11.2-11.2 3.2 0 6.1 1.4 8.2 3.6 1.3-.6 2.8-.9 4.3-.9 5.8 0 10.5 4.7 10.5 10.5H12z"
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth="2"
      />
    </svg>
  );
}

export default async function Home() {
  const weather = await getTodayWeather();

  return (
    <div className="text-emerald-950">
      <PageHero
        title="Golf de Marcilly-Orléans"
        backgroundImage="/images/club-house-marcilly.png"
        ctaLabel="Réserver un départ"
        ctaHref={PRIMA_URL}
        ctaExternal
        secondaryCtaLabel="Réserver Le ClubGolf"
        secondaryCtaHref={clubGolfUrl}
        secondaryCtaExternal
        tertiaryCtaLabel="Tarifs 2026"
        tertiaryCtaHref="/tarifs"
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
              <div className="mt-5 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Météo du jour
                </p>
                {weather ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/80">
                      <WeatherIllustration visual={weather.visual} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-emerald-950">
                        {weather.summary}
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        Mise à jour {weather.updatedAtLabel}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-900">
                        {weather.temperatureC} °C
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-emerald-900/80">
                        <span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">
                          Min {weather.minC} °C
                        </span>
                        <span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">
                          Max {weather.maxC} °C
                        </span>
                        <span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">
                          Vent {weather.windKmh} km/h
                        </span>
                        <span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">
                          Pluie 3h {weather.precipitationNext3hMm} mm
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                {weather?.hourly.length ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                      Prochaines 3 heures
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {weather.hourly.map((slot) => (
                        <div
                          key={slot.label}
                          className="rounded-xl border border-emerald-900/10 bg-white/90 px-2.5 py-2"
                        >
                          <p className="text-[11px] font-semibold text-emerald-700">
                            {slot.label}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <WeatherIllustration visual={slot.visual} size="sm" />
                            <p className="text-sm font-bold text-emerald-900">
                              {slot.temperatureC} Â°
                            </p>
                          </div>
                          <p className="mt-1 text-[11px] text-emerald-800/80">
                            Vent {slot.windKmh} km/h
                          </p>
                          <p className="text-[11px] text-emerald-800/80">
                            Pluie {slot.precipitationMm} mm
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !weather && (
                    <p className="mt-2 text-sm leading-6 text-emerald-900/70">
                      Météo indisponible pour le moment.
                    </p>
                  )
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900 md:h-fit md:self-center">
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
                      {isOpen ? "Ouvert" : "Non accessible"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="competitions" className="mx-auto w-full max-w-6xl px-6 py-12">
          <PublicCalendarEmbed
            title="Compétition"
            src={CALENDAR_EMBED_URL}
            sectionBorderClassName="border-emerald-200/80"
            frameBorderClassName="border-emerald-200/80"
            frameAspectClassName="aspect-[16/6.5]"
          />
        </section>

        <section id="actualites" className="mx-auto w-full max-w-6xl px-6 pb-12">
          <div className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
            <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
              Actualités
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-900/80">
              Les dernières nouvelles du club seront publiées ici. Vous pouvez
              vous abonner pour recevoir les informations importantes.
            </p>
            <article className="mt-6 rounded-2xl border border-emerald-900/10 bg-white p-4">
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {HOME_NEWS_ASSETS.map((asset, index) => (
                  <div
                    key={`${asset.src}-${index}`}
                    className="overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/20"
                  >
                    <p className="px-3 pt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {asset.title}
                    </p>
                    <Image
                      src={toProtectedImageSrc(asset.src)}
                      alt={`Actualité ${index + 1}`}
                      width={1200}
                      height={1697}
                      className="mx-auto h-auto w-full"
                    />
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}


