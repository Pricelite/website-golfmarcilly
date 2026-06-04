import Image from "next/image";

import { ContactForm } from "@/components/forms/contact-form";
import { Hero } from "@/components/sections/hero";
import { BlogCard } from "@/components/ui/blog-card";
import { CTAButton } from "@/components/ui/cta-button";
import { CourseCard } from "@/components/ui/course-card";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { courses } from "@/data/courses";
import { homeFaqs, homeHighlights, homeOffers, homeReasons } from "@/data/home";
import { posts } from "@/data/posts";
import { globalTestimonials, siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "45 trous aux portes d'Orleans",
  description:
    "Golf, restaurant, enseignement et evenements dans un domaine naturel unique. Une destination premium pour jouer, recevoir et progresser dans le Loiret.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildFaqSchema(homeFaqs)} />
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
        <div className="overflow-hidden rounded-[36px] border border-emerald-950/10 bg-[linear-gradient(135deg,rgba(8,39,30,0.96),rgba(18,78,61,0.92))] p-6 text-stone-50 shadow-2xl shadow-emerald-950/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/80">
                Offres du moment
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                Les offres qui donnent envie de reserver des la premiere visite
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-50/80 sm:text-base">
                Une section directe, visible et commerciale pour mettre en avant
                vos meilleures opportunites du moment.
              </p>
            </div>
            <div className="w-fit rounded-full border border-stone-50/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-50/88">
              Saison 2026
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {homeOffers.map((offer) => (
              <article
                className="flex min-h-[360px] flex-col rounded-[28px] border border-white/12 bg-white/92 p-5 text-emerald-950 shadow-lg shadow-emerald-950/10"
                key={offer.title}
              >
                <div className="relative overflow-hidden rounded-[24px] border border-emerald-950/10 bg-stone-100">
                  {offer.imageSrc ? (
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        alt={offer.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        src={offer.imageSrc}
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`aspect-[4/5] w-full bg-gradient-to-br ${offer.accentClassName}`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="rounded-full border border-emerald-950/12 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-950">
                          {offer.eyebrow}
                        </div>
                        <div className="font-serif text-3xl leading-tight text-emerald-950">
                          Affiche a venir
                        </div>
                        <div className="max-w-[14rem] text-sm leading-6 text-emerald-950/72">
                          Remplacez cette zone par votre visuel promotionnel.
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <h3 className="mt-5 font-serif text-2xl leading-tight">
                  {offer.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-emerald-950/76">
                  {offer.description}
                </p>
                <CTAButton className="mt-6 w-full" href={offer.ctaHref}>
                  {offer.ctaLabel}
                </CTAButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          description="Un site pense pour les joueurs, les visiteurs, les entreprises et les familles qui recherchent une experience premium, naturelle et lisible."
          eyebrow="Pourquoi choisir Marcilly"
          title="Une destination complete pour jouer, dejeuner, progresser et recevoir"
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
          description="Chaque espace du domaine a un role clair dans l'experience client et la progression sportive."
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
              description="Une table credible et chaleureuse pour prolonger l'experience golf, recevoir des clients ou organiser un dejeuner d'equipe."
              eyebrow="Restaurant La Bergerie"
              title="L'adresse du domaine pour les dejeuners golf et les rendez-vous d'affaires"
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
              description="Des parcours pedagogiques lisibles pour debuter, retrouver de la regularite ou preparer un objectif plus ambitieux."
              eyebrow="Ecole de golf"
              title="Un enseignement structure pour debutants, joueurs loisirs et competiteurs"
            />
          </div>
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <p className="text-sm leading-7 text-emerald-950/76">
              Cours collectifs, coaching individuel, stages et accompagnement jeune :
              l&apos;offre est pensee pour transformer l&apos;envie en progression concrete.
            </p>
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
            description="Seminaires, team buildings, dejeuners clients et receptions privees dans un cadre qui marque les esprits."
            eyebrow="Seminaires & evenements"
            title="Un lieu naturellement convaincant pour vos temps forts"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          description="Des retours qui renforcent la credibilite du lieu autant pour le golf que pour la restauration et l'evenementiel."
          eyebrow="Avis clients"
          title="Une experience premium mais accessible"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {globalTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            description="Un blog structure pour travailler le SEO, valoriser la vie du domaine et soutenir la conversion."
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
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionTitle eyebrow="FAQ" title="Questions frequentes" />
            <div className="mt-8">
              <FAQAccordion items={homeFaqs} />
            </div>
          </div>
          <div>
            <SectionTitle
              description={`${siteConfig.addressLine1}, ${siteConfig.addressLine2}. Golf Orleans, restaurant golf Orleans et seminaire golf Orleans sur un meme domaine.`}
              eyebrow="Carte / acces"
              title="Un acces simple depuis Orleans"
            />
            <div className="mt-8">
              <MapEmbed src={siteConfig.mapEmbedUrl} title="Acces Golf de Marcilly" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionTitle
                description="Besoin d'un green fee, d'un cours, d'une table au restaurant ou d'un devis evenementiel ?"
                eyebrow="Contact rapide"
                title="Parlons de votre projet a Marcilly"
              />
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
