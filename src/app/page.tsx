import Image from "next/image";
import { Hero } from "@/components/sections/hero";
import { BlogCard } from "@/components/ui/blog-card";
import { CTAButton } from "@/components/ui/cta-button";
import { CourseCard } from "@/components/ui/course-card";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { homeHighlights } from "@/data/home";
import { siteOffers } from "@/data/offers";
import { posts } from "@/data/posts";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "45 trous aux portes d'Orléans",
  description:
    "Découvrez les parcours, le restaurant La Bergerie, les cours et les événements du Golf de Marcilly, aux portes d'Orléans.",
  path: "/",
});

export default function HomePage() {
  const orderedCourses = [
    courses.find((course) => course.slug === "practice"),
    courses.find((course) => course.slug === "parcours-decouverte-9-trous"),
    courses.find((course) => course.slug === "pitch-putt-kaleka-18-trous"),
    courses.find((course) => course.slug === "parcours-competitions-18-trous"),
  ].filter((course): course is (typeof courses)[number] => Boolean(course));

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }])} />

      <Hero
        eyebrow="Golf près d'Orléans"
        image="/images/club-house-marcilly.png"
        primaryCta={{ label: "Réserver un départ", href: siteConfig.reservationUrl }}
        promoCta={{ label: "Offre du moment", offers: siteOffers }}
        subtitle="Golf, restaurant, enseignement et événements dans un domaine naturel unique."
        tertiaryCta={{ label: "Je débute le golf", href: "/je-debute-le-golf" }}
        title="45 trous aux portes d'Orléans"
      />

      <nav aria-label="Informations compétition" className="border-b border-emerald-950/10 bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold text-emerald-950">Vous jouez en compétition ?</span>
          <CTAButton href="https://pages.ffgolf.org/departs/golf/5824d6b19f01d21a2e53b0249f2e9656" variant="ghost">Consulter les départs</CTAButton>
          <CTAButton href="https://pages.ffgolf.org/resultats/liste-competitions/5824d6b19f01d21a2e53b0249f2e9656" variant="ghost">Voir les résultats</CTAButton>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SectionTitle
          eyebrow="Pourquoi choisir Marcilly"
          title="Jouer, apprendre et se retrouver au golf"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {homeHighlights.map((item) => (
            <FeatureCard
              description={item.description}
              eyebrow={item.eyebrow}
              key={item.title}
              title={item.title}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SectionTitle
          eyebrow="Les parcours"
          title="Choisissez votre parcours ou votre espace d'entraînement"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {orderedCourses.map((course) => (
            <CourseCard key={course.slug} sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(100vw - 48px), (max-width: 1024px) calc((100vw - 72px) / 2), (max-width: 1280px) calc((100vw - 88px) / 2), 286px" {...course} />
          ))}
        </div>
        <div className="mt-6"><CTAButton href="/golf" variant="ghost">Explorer les parcours et leurs caractéristiques</CTAButton></div>
      </section>

      <section id="restaurant" className="bg-white/60 py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] lg:aspect-[3/2]">
            <Image src="/images/cuisine.png" alt="Des plats préparés en cuisine" fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 112px) / 2), 584px" className="object-cover" />
          </div>
          <div>
            <SectionTitle
              eyebrow="Restaurant La Bergerie"
              title="Retrouvez-vous autour d'un déjeuner"
              description="Après une partie ou simplement pour déjeuner, découvrez la carte et les menus de La Bergerie."
            />
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/80">
              <li>Ouvert aux golfeurs et aux visiteurs qui ne jouent pas.</li>
              <li>Menus pour les déjeuners, les groupes et les séminaires.</li>
              <li>Demande de table en ligne, à confirmer par le restaurant.</li>
            </ul>
            <div className="mt-6"><CTAButton href="/restaurant">Voir les menus et demander une table</CTAButton></div>
          </div>
        </div>
      </section>

      <section id="enseignement" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] lg:order-2 lg:aspect-[3/2]">
            <Image src="/images/ecoledegolf.png" alt="Des enfants s'entraînent au golf" fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 112px) / 2), 584px" className="object-cover" />
          </div>
          <div>
            <SectionTitle
              eyebrow="École de golf & enseignement"
              title="Apprenez et progressez à votre rythme"
              description="Vous découvrez le golf ou souhaitez travailler votre jeu ? Retrouvez les formules d'enseignement et les enseignants du club."
            />
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/80">
              <li>Des programmes pour les débutants, les adultes et les enfants.</li>
              <li>Cours collectifs, coaching individuel et stages.</li>
              <li>Un accompagnement pour préparer les compétitions.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <CTAButton href="/enseignement">Découvrir les cours et les enseignants</CTAButton>
              <CTAButton href="/je-debute-le-golf" variant="ghost">Je débute le golf</CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section id="evenements" className="bg-emerald-950 py-10 text-stone-50 sm:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] lg:aspect-[3/2]">
            <Image src="/restaurant/hero.jpg" alt="Le club-house et ses abords lors d'un événement de golf" fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 112px) / 2), 584px" className="object-cover" />
          </div>
          <div>
            <SectionTitle eyebrow="Séminaires & événements" tone="inverse" title="Réunissez votre équipe au golf" description="Organisez une journée de travail, une activité de groupe ou une réception avec l'équipe de Marcilly." />
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-stone-100/85">
              <li>Journées d&apos;étude, réunions et rendez-vous clients.</li>
              <li>Initiations, challenges et footgolf pour vos activités d&apos;équipe.</li>
              <li>Restauration pour les groupes et réceptions privées.</li>
            </ul>
            <div className="mt-6"><CTAButton href="/evenements#devis" variant="secondary">Parler de mon événement et demander un devis</CTAButton></div>
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Actualités"
            title="Les temps forts du Golf de Marcilly"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          description={`${siteConfig.addressLine1}, ${siteConfig.addressLine2}.`}
          eyebrow="Carte / accès"
          title="Un accès simple depuis Orléans"
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <MapEmbed src={siteConfig.mapEmbedUrl} title="Accès Golf de Marcilly" />
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <h2 className="font-serif text-3xl text-emerald-950">Nous contacter</h2>
            <div className="mt-6 space-y-3 text-sm leading-7 text-emerald-950/76">
              <p>{siteConfig.addressLine1}</p>
              <p>{siteConfig.addressLine2}</p>
              <p>
                <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
              </p>
              <p>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
            </div>
            <div className="mt-8">
              <CTAButton href="/contact">Voir la page contact</CTAButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
