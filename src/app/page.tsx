import { Hero } from "@/components/sections/hero";
import { BlogCard } from "@/components/ui/blog-card";
import { CTAButton } from "@/components/ui/cta-button";
import { CourseCard } from "@/components/ui/course-card";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { homeHighlights, homeReasons } from "@/data/home";
import { siteOffers } from "@/data/offers";
import { posts } from "@/data/posts";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "45 trous aux portes d'Orléans",
  description:
    "Golf, restaurant, enseignement et événements dans un domaine naturel unique. Une destination premium pour jouer, recevoir et progresser dans le Loiret.",
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
        quaternaryCta={{
          label: "Départs compétition",
          href: "https://pages.ffgolf.org/departs/golf/5824d6b19f01d21a2e53b0249f2e9656",
        }}
        quinaryCta={{
          label: "Résultats compétition",
          href: "https://pages.ffgolf.org/resultats/liste-competitions/5824d6b19f01d21a2e53b0249f2e9656",
        }}
        subtitle="Golf, restaurant, enseignement et événements dans un domaine naturel unique."
        tertiaryCta={{ label: "Je débute le golf", href: "/je-debute-le-golf" }}
        title="45 trous aux portes d'Orléans"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Pourquoi choisir Marcilly"
          title="Une destination complète pour jouer, déjeuner et recevoir"
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Les parcours"
          title="Des formats complémentaires pour tous les rythmes de jeu"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {orderedCourses.map((course) => (
            <CourseCard key={course.slug} showMeta={false} {...course} />
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <SectionTitle
              eyebrow="Restaurant La Bergerie"
              title="L&apos;adresse du domaine pour déjeuner et recevoir"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {homeReasons.map((item) => (
              <FeatureCard
                description={item.description}
                key={item.title}
                title={item.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <SectionTitle
              eyebrow="École de golf"
              title="Un enseignement structuré pour débutants et compétiteurs"
            />
          </div>
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <div className="mt-6">
              <CTAButton href="/je-debute-le-golf">Je débute le golf</CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 py-16 text-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            align="center"
            eyebrow="Séminaires & événements"
            title="Un lieu naturellement convaincant pour vos temps forts"
          />
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
