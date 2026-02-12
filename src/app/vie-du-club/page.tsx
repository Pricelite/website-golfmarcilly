import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/components/page-hero";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import TarifsSections from "@/components/tarifs-sections";
import { CALENDAR_EMBED_URL } from "@/lib/calendar";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Présentation",
  description:
    "Presentation, actualites, evenements et tarifs du Golf de Marcilly reunis sur une seule page.",
};

const sectionClass =
  "scroll-mt-28 mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur";


export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Présentation"
        subtitle="Presentation, actualites, evenements et tarifs 2026."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">

        <section id="presentation" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Presentation du golf
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Le Golf de Marcilly est un domaine cree en 1986, situe au Domaine
            de la Plaine a Marcilly-en-Villette, au sud d&apos;Orleans.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Parcours disponibles
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900/80">
                <li>18 trous competition (Par 72)</li>
                <li>Pitch and putt 18 trous (Par 55)</li>
                <li>Parcours decouverte / compact / Kaleka</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Installations
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900/80">
                <li>Practice (plus de 40 postes)</li>
                <li>Zones d&apos;approche et greens d&apos;entrainement</li>
                <li>Club-house, restaurant et pro-shop</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-6">
            <h3 className="font-[var(--font-display)] text-xl text-emerald-950">
              Organigramme du club
            </h3>
            <p className="mt-2 text-sm text-emerald-900/75">
              Composition de l&apos;equipe dirigeante et operationnelle.
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="w-full max-w-md rounded-2xl border border-emerald-900/15 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Direction
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-950">
                  Michel et Damien
                </p>
              </div>
              <div className="h-6 w-px bg-emerald-900/20" />
              <div className="w-full max-w-md rounded-2xl border border-emerald-900/15 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Directeur adjoint
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-950">
                  Anthony
                </p>
              </div>
              <div className="h-6 w-px bg-emerald-900/20" />
              <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable espace vert
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    James
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/75">
                    <li>Jeremy</li>
                    <li>Wilfried</li>
                    <li>Gwennael</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable de salle
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    Olivier
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/75">
                    <li>Maxance</li>
                    <li>Marine</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable cuisine
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    Benjamin
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/75">
                    <li>Charles</li>
                    <li>Lotfi</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable accueil
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    Nathalie
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/75">
                    <li>Titouan</li>
                    <li>Camille</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="equipe" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Presentation de l&apos;equipe du golf
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Une equipe experimentee au service des membres, du parcours et de
            la restauration.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Direction
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                Michel, Damien, Anthony
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Accueil
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                Nathalie, Titouan, Camille
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { name: "Nathalie", src: "/images/nathalie.png" },
                  { name: "Titouan", src: "/images/titouan.png" },
                  { name: "Camille", src: "/images/camille.png" },
                ].map((member) => (
                  <div key={member.name}>
                    <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/50">
                      <Image
                        src={member.src}
                        alt={member.name}
                        width={240}
                        height={240}
                        className="h-20 w-full object-cover"
                      />
                    </div>
                    <p className="mt-1 text-center text-xs font-medium text-emerald-900/80">
                      {member.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Cuisine
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                Benjamin, Charles, Lotfi
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { name: "Benjamin", src: "/images/benjamin.png" },
                  { name: "Charles", src: "/images/charles.png" },
                ].map((member) => (
                  <div key={member.name}>
                    <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/50">
                      <Image
                        src={member.src}
                        alt={member.name}
                        width={240}
                        height={240}
                        className="h-20 w-full object-cover"
                      />
                    </div>
                    <p className="mt-1 text-center text-xs font-medium text-emerald-900/80">
                      {member.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Salle
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                Olivier, Maxance, Marine
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 md:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Espace vert
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                James, Jeremy, Wilfried, Gwennael
              </p>
            </div>
          </div>
        </section>

        <section id="actualites" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Actualites
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Les dernieres nouvelles du club seront publiees ici. Vous pouvez
            vous abonner pour recevoir les informations importantes.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              href={CONTACT_EMAIL_LINK}
            >
              S&apos;abonner aux infos
            </Link>
          </div>
        </section>

        <section id="evenements" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Evenements
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Consultez les prochaines dates et animations du club via le
            calendrier public.
          </p>
          <div className="mt-8">
            <PublicCalendarEmbed
              title="Calendrier public du club"
              src={CALENDAR_EMBED_URL}
            />
          </div>
        </section>


        <section id="tarifs" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Tarifs 2026
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Retrouvez ci-dessous les sections tarifaires deja en place.
          </p>
        </section>

        <TarifsSections />
      </main>
    </div>
  );
}




