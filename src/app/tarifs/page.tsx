import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { PricingTable } from "@/components/ui/pricing-table";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Tarifs",
  description:
    "Tarifs 2026 du Golf de Marcilly : découverte, practice, green fees, location et abonnements.",
  path: "/tarifs",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Tarifs", path: "/tarifs" },
        ])}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            description="Tarifs 2026 mis à jour à partir de la plaquette officielle publiée sur le site du Golf de Marcilly."
            eyebrow="Tarifs 2026"
            title="Des tarifs lisibles pour jouer, apprendre et recevoir"
          />
          <CTAButton href="/contact#reservation">Demander une offre</CTAButton>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {pricingSections.map((section) => (
            <PricingTable key={section.title} section={section} />
          ))}
        </div>
      </section>
    </>
  );
}
