import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { PricingTable } from "@/components/ui/pricing-table";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Tarifs golf près d’Orléans : green fees et initiations",
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
            as="h1"
            eyebrow="Tarifs 2026"
            title="Le golf à Marcilly, à votre rythme"
          />
          <CTAButton href="/contact#reservation" variant="secondary">Besoin d’un conseil ?</CTAButton>
        </div>
        <nav aria-label="Catégories de tarifs" className="mt-8">
          <p className="mb-3 text-sm font-medium text-emerald-950/75">Accès direct aux tarifs</p>
          <div className="flex flex-wrap gap-2">
            {[["decouverte", "Découverte"], ["green-fees", "Green fees"], ["practice", "Practice"], ["abonnements", "Abonnements"], ["location", "Location"]].map(([id, label]) => <a key={id} href={`#${id}`} className="site-button rounded-full px-4 py-3 text-sm font-semibold">{label}</a>)}
          </div>
        </nav>
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {pricingSections.map((section) => (
            <PricingTable key={section.id} section={section} />
          ))}
        </div>
      </section>
    </>
  );
}
