import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import PageHero from "@/components/page-hero";
import { toProtectedImageSrc } from "@/lib/protected-image";
import { restaurantData } from "@/lib/restaurant-data";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Restaurant La Bergerie | ${SITE_NAME}`,
  description:
    "Cuisine simple et gourmande, carte du moment et menus de groupes pour réceptions, séminaires et événements.",
};

const reservationHref = "/contact";
const quoteHref = "/contact";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50";

function splitEuroPrice(price: string): {
  amount: string;
  hasEuro: boolean;
  suffix: string;
} {
  const trimmed = price.trim();
  const euroIndex = trimmed.indexOf("€");

  if (euroIndex === -1) {
    return { amount: trimmed, hasEuro: false, suffix: "" };
  }

  const amount = trimmed.slice(0, euroIndex).trim();
  const suffix = trimmed.slice(euroIndex + 1).trim();

  return { amount, hasEuro: true, suffix };
}

export default function RestaurantPage() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title={restaurantData.title}
        subtitle={restaurantData.name}
        description={restaurantData.intro.paragraphs[0]}
        backgroundImage="/images/cuisine.png"
        ctaLabel="Réserver une table"
        ctaHref={reservationHref}
        secondaryCtaLabel="Carte du moment"
        secondaryCtaHref="#carte"
      />

      <main>
        <section className="bg-white py-16 sm:py-20" id="infos">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                  Présentation
                </p>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                  Une table ouverte aux réceptions et aux événements
                </h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-emerald-900/80">
                  {restaurantData.intro.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {restaurantData.services.map((service) => (
                    <div
                      key={service.title}
                      className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4"
                    >
                      <h3 className="text-sm font-semibold text-emerald-950">
                        {service.title}
                      </h3>
                      {service.description ? (
                        <p className="mt-2 text-sm text-emerald-900/75">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                    Équipe cuisine
                  </p>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      src: "/images/benjamin.png",
                      alt: "Benjamin en cuisine",
                      overlayLabel: "Benjamin Chef de cuisine",
                    },
                    {
                      src: "/images/charles.png",
                      alt: "Charles en cuisine",
                      overlayLabel: "Charles second de cuisine",
                    },
                    {
                      src: "/restaurant/chef-1.jpg",
                      alt: "Chef en finition d'une préparation",
                    },
                  ].map((member, index) => (
                    <div
                      key={member.alt}
                      className="relative overflow-hidden rounded-3xl border border-emerald-900/10 shadow-sm"
                    >
                      <Image
                        src={toProtectedImageSrc(member.src)}
                        alt={member.alt}
                        width={520}
                        height={640}
                        className="h-64 w-full object-cover sm:h-72 lg:h-80"
                        sizes="(min-width: 1280px) 18vw, (min-width: 640px) 45vw, 100vw"
                        priority={index === 0}
                      />
                      {member.overlayLabel ? (
                        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[1px]">
                          {member.overlayLabel}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                    Location de salle
                  </p>
                  <p className="mt-3 text-base font-semibold text-emerald-950">
                    {restaurantData.intro.roomRental}
                  </p>
                  <p className="mt-2 text-sm text-emerald-900/70">
                    {restaurantData.intro.roomRentalNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20" id="carte">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                {restaurantData.carte.title}
              </p>
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                La Carte du Moment
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {restaurantData.carte.sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-emerald-950">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-emerald-900">
                    {section.items.map((item) => {
                      const { amount, hasEuro, suffix } = splitEuroPrice(item.price);

                      return (
                        <li
                          key={`${section.title}-${item.name}`}
                          className="border-b border-emerald-900/10 pb-3 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-medium text-emerald-950">
                              {item.name}
                            </span>
                            {hasEuro ? (
                              <span className="inline-flex items-baseline whitespace-nowrap font-semibold text-emerald-950">
                                <span className="w-14 text-right tabular-nums">
                                  {amount}
                                </span>
                                <span className="ml-1 w-3 text-left">€</span>
                                {suffix ? (
                                  <span className="ml-1 text-xs font-medium text-emerald-900/75">
                                    {suffix}
                                  </span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="font-semibold text-emerald-950 tabular-nums">
                                {item.price}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {section.note ? (
                    <p className="mt-4 text-xs text-emerald-900/70">
                      {section.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-emerald-50/60 py-16 sm:py-20" id="menus">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                Menus de groupes
              </p>
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                {restaurantData.groupMenus.title}
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {restaurantData.groupMenus.items.map((menu) => (
                <div
                  key={menu.name}
                  className="flex h-full flex-col items-center rounded-3xl border border-emerald-900/10 bg-white p-6 text-center shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-emerald-950">
                    {menu.name}
                  </h3>

                  {menu.sections.map((section) => (
                    <div key={`${menu.name}-${section.title}`} className="mt-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                        {section.title}
                      </p>
                      {section.type === "list" ? (
                        <ul className="mt-2 space-y-2 text-sm text-emerald-900/80">
                          {section.items.map((item) => (
                            <li key={`${section.title}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 space-y-2 text-center text-sm text-emerald-900/80">
                          {section.items.map((item, index) => (
                            <div key={`${section.title}-${item}`}>
                              <p>{item}</p>
                              {index < section.items.length - 1 ? (
                                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-emerald-600/80">
                                  OU
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="mt-auto pt-6 text-sm font-semibold text-emerald-900 tabular-nums">
                    {menu.price}
                  </div>

                  <div className="pt-4">
                    <Link className={secondaryButtonClass} href={quoteHref}>
                      {restaurantData.groupMenus.ctaLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20" id="seminaire">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                {restaurantData.seminarMenu.title}
              </p>
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                Menu Séminaire
              </h2>
            </div>

            <div className="mt-8 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                {restaurantData.seminarMenu.sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4"
                  >
                    <h3 className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                      {section.title}
                    </h3>
                    {section.items.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-emerald-900/80">
                        {section.items.map((item) => (
                          <li key={`${section.title}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center text-sm font-semibold text-emerald-900 tabular-nums">
                {restaurantData.seminarMenu.price}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-emerald-50/60 py-16 sm:py-20" id="cgv">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-sm">
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                {restaurantData.cgv.title}
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {restaurantData.cgv.sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold text-emerald-950">
                      {section.title}
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900/80">
                      {section.items.map((item) => (
                        <li key={`${section.title}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm italic text-emerald-900/70">
                {restaurantData.cgv.closingNote}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-emerald-50/60 py-16 sm:py-20" id="horaires">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">
                Horaires
              </p>
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
                Horaires du restaurant
              </h2>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Horaires du restaurant</caption>
                <thead className="bg-emerald-900/5 text-xs uppercase tracking-[0.2em] text-emerald-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Jours
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      Horaires
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantData.hours.map((row) => (
                    <tr key={row.label} className="border-t border-emerald-900/10">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-emerald-950"
                      >
                        {row.label}
                      </th>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-950">
                        {row.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
