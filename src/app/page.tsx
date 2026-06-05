import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/sections/hero";
import { BlogCard } from "@/components/ui/blog-card";
import { CTAButton } from "@/components/ui/cta-button";
import { CourseCard } from "@/components/ui/course-card";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { homeHighlights, homeOffers, homeReasons } from "@/data/home";
import { posts } from "@/data/posts";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "45 trous aux portes d'Orleans",
  description:
    "Golf, restaurant, enseignement et evenements dans un domaine naturel unique. Une destination premium pour jouer, recevoir et progresser dans le Loiret.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }])} />

      <Hero
        eyebrow="Golf pres d'Orleans"
        image="/images/club-house-marcilly.png"
        primaryCta={{ label: "Reserver un depart", href: siteConfig.reservationUrl }}
        secondaryCta={{ label: "Decouvrir le golf", href: "/golf" }}
        subtitle="Golf, restaurant, enseignement et evenements dans un domaine naturel unique."
        tertiaryCta={{ label: "Je debute le golf", href: "/je-debute-le-golf" }}
        title="45 trous aux portes d'Orleans"
      />

      <section className="relative z-10 -mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-emerald-950/10 bg-[linear-gradient(135deg,rgba(8,39,30,0.96),rgba(18,78,61,0.92))] p-4 shadow-2xl shadow-emerald-950/20 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {homeOffers.map((offer) => (
              <article
                className="overflow-hidden rounded-[28px] border border-white/12 bg-white/96 shadow-lg shadow-emerald-950/10"
                key={offer.slug}
              >
                <Link
                  aria-label={`Voir ${offer.title}`}
                  className="block"
                  href={`/offres/${offer.slug}`}
                >
                  <div className="relative aspect-[4/5] w-full bg-stone-100">
                    <Image
                      alt={offer.title}
                      className="object-contain"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      src={offer.imageSrc}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <CTAButton className="w-full" href={`/offres/${offer.slug}`}>
                    Voir l'offre
                  </CTAButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Pourquoi choisir Marcilly"
          title="Une destination complete pour jouer, dejeuner et recevoir"
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
          title="Des formats complementaires pour tous les rythmes de jeu"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {courses.slice(0, 4).map((course) => (
            <CourseCard key={course.slug} showMeta={false} {...course} />
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <SectionTitle
              eyebrow="Restaurant La Bergerie"
              title="L'adresse du domaine pour dejeuner et recevoir"
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
              eyebrow="Ecole de golf"
              title="Un enseignement structure pour debutants et competiteurs"
            />
          </div>
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <div className="mt-6">
              <CTAButton href="/je-debute-le-golf">Je debute le golf</CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 py-16 text-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            align="center"
            eyebrow="Seminaires & evenements"
            title="Un lieu naturellement convaincant pour vos temps forts"
          />
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Actualites"
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
          eyebrow="Carte / acces"
          title="Un acces simple depuis Orleans"
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <MapEmbed src={siteConfig.mapEmbedUrl} title="Acces Golf de Marcilly" />
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
