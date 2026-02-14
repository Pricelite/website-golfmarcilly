import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { toProtectedImageSrc } from "@/lib/protected-image";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "École de Golf",
  description:
    "Découvrez l'École de Golf de Marcilly : enseignants, pédagogie et cours enfant débutant ou perfectionnement.",
};

type Teacher = {
  name: string;
  role: string;
  imageSrc: string;
  website?: string;
};

const teachers: Teacher[] = [
  {
    name: "Roman",
    role: "Enseignant indépendant",
    imageSrc: "/roman.png",
    website: "https://www.romanlissowski.com/",
  },
  {
    name: "Adrien",
    role: "Enseignant indépendant",
    imageSrc: "/adrien.png",
    website: "https://www.adrienlafuge.com/",
  },
  {
    name: "Baptiste",
    role: "Enseignant indépendant",
    imageSrc: "/baptiste.png",
  },
];

const courses = [
  {
    title: "Cours enfant débutant",
    level: "Âge minimum : 6 ans",
    price: "95 € / mois",
    schedule: "Mercredi et samedi • 1h15 par séance",
  },
  {
    title: "Cours enfant perfectionnement",
    level: "Accès selon niveau et validation enseignant",
    price: "120 € / mois",
    schedule: "Mercredi • 1h30 par séance",
  },
] as const;

export default function Page() {
  return (
    <div className="bg-emerald-50/20 text-emerald-950">
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white text-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.10),transparent_34%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="self-center">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-700">
              École de golf
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-tight md:text-5xl">
              École de Golf
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-900/80 md:text-base">
              Un accompagnement structuré pour apprendre, progresser et jouer
              en confiance. Nos enseignants encadrent les jeunes dans un cadre
              pédagogique exigeant, bienveillant et sportif.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={CONTACT_EMAIL_LINK}
                className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Je réserve
              </Link>
              <a
                href="#cours"
                className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                Voir les cours
              </a>
            </div>
          </div>

          <div
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            aria-label="Enseignants de l'école de golf"
          >
            {teachers.map((teacher) => (
              <article
                key={teacher.name}
                className="rounded-2xl border border-emerald-900/10 bg-white p-3 shadow-sm"
              >
                <div className="relative h-40 overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-100/40">
                  <Image
                    src={toProtectedImageSrc(teacher.imageSrc)}
                    alt={teacher.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-cover object-center"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-emerald-950">
                  {teacher.website ? (
                    <a
                      href={teacher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Accéder au site"
                      aria-label={`${teacher.name} - Accéder au site`}
                      className="underline decoration-emerald-700/40 underline-offset-2 hover:text-emerald-700"
                    >
                      {teacher.name}
                    </a>
                  ) : (
                    teacher.name
                  )}
                </p>
                <p className="text-xs text-emerald-900/70">{teacher.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[28px] border border-emerald-900/10 bg-emerald-50/50 p-8 shadow-sm">
          <h2 className="font-[var(--font-display)] text-3xl text-emerald-950">
            Informations pédagogiques
          </h2>
          <p className="mt-4 text-sm leading-7 text-emerald-900/80">
            L&apos;École de Golf propose une progression adaptée à chaque
            enfant, avec un encadrement technique, des objectifs de jeu et un
            suivi régulier avec les familles.
          </p>
          <p className="mt-3 text-sm leading-7 text-emerald-900/80">
            Depuis 10 ans, le Golf de Marcilly obtient le Label Sportif. Ce
            label valide la qualité de l&apos;accueil des enfants pendant les
            séances et la structuration pédagogique de l&apos;école.
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-emerald-900/80 md:grid-cols-3">
            <li className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3">
              Roman - Enseignant diplômé
            </li>
            <li className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3">
              Adrien - Enseignant diplômé
            </li>
            <li className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3">
              Baptiste - Enseignant diplômé
            </li>
          </ul>
        </section>

        <section id="cours" className="mt-8">
          <h2 className="font-[var(--font-display)] text-3xl text-emerald-950">
            Nos cours
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article
                key={course.title}
                className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-emerald-950">
                  {course.title}
                </h3>
                <p className="mt-3 text-sm text-emerald-900/80">{course.level}</p>
                <p className="mt-2 text-2xl font-bold text-emerald-800">
                  {course.price}
                </p>
                <p className="mt-2 text-sm text-emerald-900/80">{course.schedule}</p>
                <Link
                  href={CONTACT_EMAIL_LINK}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Je réserve
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
