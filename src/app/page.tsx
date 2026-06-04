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
import { homeFaqs, homeHighlights, homeReasons } from "@/data/home";
import { posts } from "@/data/posts";
import { globalTestimonials, siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "45 trous d'exception aux portes d'Orléans",
  description:
    "Golf, restaurant, enseignement et événements dans un domaine naturel unique. Une destination premium pour jouer, recevoir et progresser dans le Loiret.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildFaqSchema(homeFaqs)} />
      <JsonLd
        data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }])}
      />
      <Hero
        eyebrow="Golf près d'Orléans"
        image="/images/club-house-marcilly.png"
        primaryCta={{ label: "Réserver un départ", href: siteConfig.reservationUrl }}
        secondaryCta={{ label: "Découvrir le golf", href: "/golf" }}
        subtitle="Golf, restaurant, enseignement et événements dans un domaine naturel unique."
        tertiaryCta={{ label: "Je débute le golf", href: "/je-debute-le-golf" }}
        title="45 trous d'exception aux portes d'Orléans"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          description="Un site pensé pour les joueurs, les visiteurs, les entreprises et les familles qui recherchent une expérience premium, naturelle et lisible."
          eyebrow="Pourquoi choisir Marcilly"
          title="Une destination complète pour jouer, déjeuner, progresser et recevoir"
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
          description="Chaque espace du domaine a un rôle clair dans l'expérience client et la progression sportive."
          eyebrow="Les parcours"
          title="Des formats complémentaires pour tous les rythmes de jeu"
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
              description="Une table crédible et chaleureuse pour prolonger l'expérience golf, recevoir des clients ou organiser un déjeuner d'équipe."
              eyebrow="Restaurant La Bergerie"
              title="L'adresse du domaine pour les déjeuners golf et les rendez-vous d'affaires"
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
              description="Des parcours pédagogiques lisibles pour débuter, retrouver de la régularité ou préparer un objectif plus ambitieux."
              eyebrow="École de golf"
              title="Un enseignement structuré pour débutants, joueurs loisirs et compétiteurs"
            />
          </div>
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <p className="text-sm leading-7 text-emerald-950/76">
              Cours collectifs, coaching individuel, stages et accompagnement jeune :
              l&apos;offre est pensée pour transformer l&apos;envie en progression concrète.
            </p>
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
            description="Séminaires, team buildings, déjeuners clients et réceptions privées dans un cadre qui marque les esprits."
            eyebrow="Séminaires & événements"
            title="Un lieu naturellement convaincant pour vos temps forts"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          description="Des retours qui renforcent la crédibilité du lieu autant pour le golf que pour la restauration et l'événementiel."
          eyebrow="Avis clients"
          title="Une expérience premium mais accessible"
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
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionTitle eyebrow="FAQ" title="Questions fréquentes" />
            <div className="mt-8">
              <FAQAccordion items={homeFaqs} />
            </div>
          </div>
          <div>
            <SectionTitle
              description={`${siteConfig.addressLine1}, ${siteConfig.addressLine2}. Golf Orléans, restaurant golf Orléans et séminaire golf Orléans sur un même domaine.`}
              eyebrow="Carte / accès"
              title="Un accès simple depuis Orléans"
            />
            <div className="mt-8">
              <MapEmbed src={siteConfig.mapEmbedUrl} title="Accès Golf de Marcilly" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionTitle
                description="Besoin d'un green fee, d'un cours, d'une table au restaurant ou d'un devis événementiel ?"
                eyebrow="Contact rapide"
                title="Parlons de votre projet à Marcilly"
              />
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
