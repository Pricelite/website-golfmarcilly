import Image from "next/image";
import { CTAButton } from "@/components/ui/cta-button";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { siteConfig } from "@/data/site";
import { initiationExperience } from "@/data/initiation-experience";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";

const beginnerFaqs = [
  { question: "Je n’ai jamais joué : je peux venir ?", answer: "Oui. L’initiation est faite pour découvrir les premiers gestes avec un enseignant, sans expérience préalable." },
  { question: "Faut-il apporter du matériel ?", answer: "Non, le matériel est fourni pour l’initiation. Prévoyez simplement une tenue confortable et des chaussures plates et stables." },
  { question: "Combien de temps dure l’initiation ?", answer: `Prévoyez ${initiationExperience.withoutMealDuration} sans repas : ${initiationExperience.lesson}, puis ${initiationExperience.course}. Avec le repas à La Bergerie, comptez ${initiationExperience.withMealDuration}.` },
  { question: "Comment se passe la réservation ?", answer: "Choisissez un créneau et envoyez votre demande. L’équipe confirme la disponibilité par e-mail. Le paiement se fait sur place." },
] as const;

export const metadata = buildMetadata({
  title: "Je débute le golf",
  description: "Découvrez le golf à Marcilly près d’Orléans : pratique libre au practice ou initiation encadrée à 25 € ou 48 € avec repas.",
  path: "/je-debute-le-golf",
});

export default function BeginnerGolfPage() {
  const discovery = pricingSections.find(section => section.title === "Découverte")!;
  const practice = pricingSections.find(section => section.title === "Practice")!;
  const buckets = practice.rows[0];

  return (
    <>
      <JsonLd data={buildFaqSchema(beginnerFaqs)} />
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }, { name: "Je débute le golf", path: "/je-debute-le-golf" }])} />
      <section className="bg-[#f7f4e9]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Golf de Marcilly · Premiers pas</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-emerald-950 sm:text-6xl">Le golf, ça s’essaie.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-950/75">Envie de découvrir ? Choisissez une initiation avec un pro ou essayez quelques balles au practice. Aucun niveau n’est requis.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CTAButton href="/initiation/reservation">Demander un créneau</CTAButton>
              <CTAButton href="#practice" variant="secondary">Découvrir le practice</CTAButton>
            </div>
            <p className="mt-5 text-sm text-emerald-950/65">Pour l’initiation : matériel fourni · confirmation par e-mail · paiement sur place.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src="/images/initiation-groupe-professeur.webp" alt="Un professeur accompagne un groupe lors d’une initiation au golf" fill priority sizes="(max-width: 1024px) 100vw, 580px" className="object-cover" />
          </div>
        </div>
      </section>

      <section id="practice" className="bg-emerald-950">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <SectionTitle tone="inverse" eyebrow="Sans réservation" title="Essayer le practice" description="Envoyez quelques balles à votre rythme depuis un poste d’entraînement. Cette formule ne comprend pas de cours." />
            <p className="mt-5 text-sm text-stone-100/80">Le prêt d’un club est prévu par seau et par personne. Demandez conseil à l’accueil pour votre premier essai.</p>
          </div>
          <div className="rounded-[28px] bg-[#f7f4e9] p-6 sm:p-8">
            <p className="text-sm font-semibold text-emerald-800">{buckets.label} · tarif extérieur</p>
            <p className="mt-3 font-serif text-5xl text-emerald-950">{nonbreakingEuro(buckets.values[0])}</p>
            <div className="mt-6"><CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary">Appeler l’accueil</CTAButton></div>
          </div>
        </div>
      </section>

      <section id="initiations" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Avec un enseignant" title="Choisissez votre initiation" description="Une heure avec un pro, puis 1 h 30 sur le parcours découverte de 9 trous. Le matériel est fourni." />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {discovery.rows.map((formula, index) => (
            <article key={formula.label} className="flex flex-col rounded-[28px] border border-emerald-950/15 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-3xl text-emerald-950">{formula.label}</h2>
              <p className="mt-2 text-sm text-emerald-950/70">{index === 0 ? initiationExperience.withoutMealDuration : initiationExperience.withMealDuration}{index === 1 ? " · repas à La Bergerie" : ""}</p>
              <p className="my-5 font-serif text-5xl text-emerald-950">{nonbreakingEuro(formula.values[1])} <span className="font-sans text-sm">/ personne</span></p>
              <p className="mb-6 flex-1 text-sm leading-7 text-emerald-950/75">{formula.values[0]}</p>
              <CTAButton href={`/initiation/reservation?formule=${index === 0 ? "sans-repas" : "avec-repas"}`} className="self-start">Choisir un créneau</CTAButton>
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm leading-7 text-emerald-950/70">La demande sera confirmée par l’équipe selon les disponibilités. Une question ? Appelez le <a className="font-semibold underline underline-offset-4" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Avant de venir" title="Vos questions, nos réponses" />
        <div className="mt-7 max-w-3xl"><FAQAccordion items={beginnerFaqs} /></div>
      </section>
    </>
  );
}

