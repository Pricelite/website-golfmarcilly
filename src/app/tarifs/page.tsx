import { publicPageSeo } from "@/data/seo";
import Link from "next/link";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { PricingTable } from "@/components/ui/pricing-table";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata(publicPageSeo.pricing);

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
            title="Tarifs du golf : green-fees et abonnements"
          />
          <CTAButton href="/contact#reservation" variant="secondary">Besoin d’un conseil ?</CTAButton>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-emerald-950/75">Choisissez votre formule après avoir découvert nos <Link href="/golf" className="font-semibold underline underline-offset-4">parcours et notre practice</Link>. Pour un premier essai, les <Link href="/je-debute-le-golf#initiations" className="font-semibold underline underline-offset-4">initiations avec matériel fourni</Link> permettent de commencer sans expérience préalable.</p>
        <nav aria-label="Catégories de tarifs" className="mt-8">
          <p className="mb-3 text-sm font-medium text-emerald-950/75">Accès direct aux tarifs</p>
          <div className="flex flex-wrap gap-2">
            {[["decouverte", "Initiation"], ["green-fees", "Découverte et Kaleka"], ["grand-parcours", "Grand Parcours"], ["practice", "Practice"], ["abonnements", "Abonnements"], ["location", "Location"]].map(([id, label]) => <a key={id} href={`#${id}`} className="site-button rounded-full px-4 py-3 text-sm font-semibold">{label}</a>)}
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
