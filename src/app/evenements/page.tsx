import { QuoteForm } from "@/components/forms/quote-form";
import { CTAButton } from "@/components/ui/cta-button";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { eventFormats } from "@/data/events";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Événements / Séminaires",
  description:
    "Séminaire golf Orléans, team building, réceptions privées, mariages et groupes au Golf de Marcilly.",
  path: "/evenements",
});

export default function EventsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Événements", path: "/evenements" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(162,204,154,0.22),transparent_28%),linear-gradient(140deg,rgba(6,24,20,0.96),rgba(10,43,35,0.9))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Séminaire golf Orléans
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Des événements qui valorisent votre image
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Séminaires, team buildings, réceptions privées, mariages et temps forts
              corporate dans un cadre naturel premium aux portes d&apos;Orléans.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="#devis" variant="secondary">
                Demander un devis
              </CTAButton>
              <CTAButton href="/contact" variant="secondary">
                Contacter l&apos;équipe
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Formats"
          title="Des formats adaptables à vos clients, équipes et invités"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {eventFormats.map((format) => (
            <FeatureCard
              description={format.description}
              key={format.title}
              title={format.title}
            />
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]" id="devis">
          <div>
            <SectionTitle eyebrow="Formulaire de devis" title="Recevoir un devis sur mesure" />
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
