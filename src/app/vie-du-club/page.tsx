import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/page-hero";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import TarifsSections from "@/components/tarifs-sections";
import { CALENDAR_EMBED_URL } from "@/lib/calendar";
import { toProtectedImageSrc } from "@/lib/protected-image";

export const metadata: Metadata = {
  title: "Présentation",
  description:
    "Présentation, actualités, événements et tarifs du Golf de Marcilly réunis sur une seule page.",
};

const sectionClass =
  "scroll-mt-28 mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur";

type TeamPhoto = {
  name: string;
  src: string;
  position?: string;
  href?: string;
};

const directionPhotos: TeamPhoto[] = [
  { name: "Michel", src: "/images/michel.png", position: "50% 30%" },
  { name: "Damien", src: "/images/damien.png", position: "50% 32%" },
];

const directeurAdjointPhotos: TeamPhoto[] = [
  { name: "Anthony", src: "/images/anthony.png", position: "50% 32%" },
];

const accueilPhotos: TeamPhoto[] = [
  { name: "Nathalie", src: "/images/nathalie.png", position: "50% 30%" },
  { name: "Titouan", src: "/images/titouan.png", position: "50% 32%" },
  { name: "Camille", src: "/images/camille.png", position: "50% 30%" },
];

const cuisinePhotos: TeamPhoto[] = [
  { name: "Benjamin", src: "/images/benjamin.png", position: "50% 28%" },
  { name: "Charles", src: "/images/charles.png", position: "50% 30%" },
  { name: "Lotfi", src: "/images/chef1.png", position: "50% 26%" },
];

const sallePhotos: TeamPhoto[] = [
  { name: "Olivier", src: "/images/olivier.png", position: "50% 30%" },
  { name: "Maxance", src: "/images/maxance.png", position: "50% 30%" },
  { name: "Marine", src: "/images/marine.png", position: "50% 30%" },
];

const enseignantPhotos: TeamPhoto[] = [
  { name: "Roman", src: "/roman.png", position: "50% 30%" },
  {
    name: "Adrien",
    src: "/adrien.png",
    position: "50% 30%",
    href: "https://www.adrienlafuge.com/",
  },
  { name: "Baptiste", src: "/baptiste.png", position: "50% 30%" },
];

function TeamPhotoGrid({
  members,
  imageHeightClass = "h-28",
  hierarchy = false,
}: {
  members: TeamPhoto[];
  imageHeightClass?: string;
  hierarchy?: boolean;
}) {
  const renderPhoto = (member: TeamPhoto) => (
    <div key={member.name}>
      <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/50">
        <Image
          src={toProtectedImageSrc(member.src)}
          alt={member.name}
          width={240}
          height={240}
          className={`${imageHeightClass} w-full object-cover object-center`}
          style={{ objectPosition: member.position ?? "50% 35%" }}
        />
      </div>
      <p className="mt-1 text-center text-xs font-medium text-emerald-900/80">
        {member.href ? (
          <a
            href={member.href}
            target="_blank"
            rel="noopener noreferrer"
            title="Accéder au site"
            aria-label={`${member.name} - Accéder au site`}
            className="underline decoration-emerald-700/40 underline-offset-2 hover:text-emerald-700"
          >
            {member.name}
          </a>
        ) : (
          member.name
        )}
      </p>
    </div>
  );

  if (hierarchy && members.length > 1) {
    const [leader, ...team] = members;
    const teamGridClass =
      team.length === 1
        ? "mx-auto grid max-w-28 grid-cols-1 gap-2"
        : team.length === 2
          ? "mx-auto grid max-w-[14rem] grid-cols-2 gap-2"
          : "mx-auto grid w-full max-w-[22rem] grid-cols-3 gap-3";

    return (
      <div className="mt-4">
        <div className="mx-auto max-w-28">{renderPhoto(leader)}</div>
        <div className="mx-auto mt-2 h-4 w-px bg-emerald-900/20" />
        <div className={teamGridClass}>{team.map((member) => renderPhoto(member))}</div>
      </div>
    );
  }

  const gridClass =
    members.length === 1
      ? "mt-4 mx-auto grid max-w-28 grid-cols-1 gap-2"
      : members.length === 2
        ? "mt-4 mx-auto grid max-w-[14rem] grid-cols-2 gap-2"
        : "mt-4 mx-auto grid w-full max-w-[22rem] grid-cols-3 gap-3";

  return <div className={gridClass}>{members.map((member) => renderPhoto(member))}</div>;
}


export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Présentation"
        subtitle="Présentation, actualités, événements et tarifs 2026."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">

        <section id="presentation" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Présentation du golf
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Le Golf de Marcilly est un domaine créé en 1986, situé au Domaine
            de la Plaine à Marcilly-en-Villette, au sud d&apos;Orléans.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Parcours disponibles
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900/80">
                <li>18 trous compétition (Par 72)</li>
                <li>Pitch and putt 18 trous (Par 55)</li>
                <li>Parcours découverte / compact / Kaleka</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Installations
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900/80">
                <li>Practice (plus de 40 postes)</li>
                <li>Zones d&apos;approche et greens d&apos;entraînement</li>
                <li>Club-house, restaurant et pro-shop</li>
              </ul>
            </div>
          </div>

          <div
            id="equipe"
            className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-6"
          >
            <h3 className="font-[var(--font-display)] text-xl text-emerald-950">
              Organigramme et équipe du club
            </h3>
            <p className="mt-2 text-sm text-emerald-900/75">
              Composition de l&apos;équipe dirigeante et opérationnelle, avec
              les responsables et leurs équipes.
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="w-full max-w-md rounded-2xl border border-emerald-900/15 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Direction
                </p>
                <TeamPhotoGrid members={directionPhotos} />
              </div>
              <div className="h-6 w-px bg-emerald-900/20" />
              <div className="w-full max-w-md rounded-2xl border border-emerald-900/15 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Directeur adjoint
                </p>
                <TeamPhotoGrid members={directeurAdjointPhotos} />
              </div>
              <div className="h-6 w-px bg-emerald-900/20" />
              <div className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable espace vert
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-950">
                    James
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/75">
                    <li>Jérémy</li>
                    <li>Wilfried</li>
                    <li>Gwennaël</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable de salle
                  </p>
                  <TeamPhotoGrid members={sallePhotos} hierarchy />
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable cuisine
                  </p>
                  <TeamPhotoGrid members={cuisinePhotos} hierarchy />
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Responsable accueil
                  </p>
                  <TeamPhotoGrid members={accueilPhotos} hierarchy />
                </div>
              </div>
              <div className="mx-auto mt-4 w-full max-w-xl rounded-2xl border border-emerald-900/10 bg-white p-3">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">
                  Enseignants indépendants
                </p>
                <TeamPhotoGrid members={enseignantPhotos} imageHeightClass="h-36" />
              </div>
            </div>
          </div>
        </section>

        <section id="evenements" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Événements
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Consultez les prochaines dates et animations du club via le
            calendrier public.
          </p>
          <div className="mt-8">
            <PublicCalendarEmbed
              title="Calendrier public du club"
              src={CALENDAR_EMBED_URL}
              highlightWeekends
            />
          </div>
        </section>


        <section id="tarifs" className={sectionClass}>
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950 md:text-3xl">
            Tarifs 2026
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/80">
            Retrouvez ci-dessous les sections tarifaires déjà en place.
          </p>
        </section>

        <TarifsSections />
      </main>
    </div>
  );
}





