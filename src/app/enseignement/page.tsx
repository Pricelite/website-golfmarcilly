import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";
import { FeatureCard } from "@/components/ui/feature-card";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { teachingPrograms, teachingPros } from "@/data/teaching";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Enseignement",
  description:
    "Cours de golf Orléans : débutants, adultes, enfants, coaching individuel, stages et compétition au Golf de Marcilly.",
  path: "/enseignement",
});

export default function TeachingPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Enseignement", path: "/enseignement" },
        ])}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            description="Une approche pédagogique claire, premium et rassurante pour débuter ou accélérer sa progression."
            eyebrow="Cours de golf Orléans"
            title="Une académie structurée pour tous les profils"
          />
          <CTAButton href="/contact#reservation">Réserver un cours</CTAButton>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teachingPrograms.map((program) => (
            <FeatureCard
              description={program.description}
              key={program.title}
              title={program.title}
            />
          ))}
        </div>

        <div className="mt-16">
          <SectionTitle
            description="Des pros identifiables et rassurants pour renforcer la crédibilité de l'offre."
            eyebrow="Pros enseignants"
            title="Des enseignants visibles, pédagogues et orientés progression"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {teachingPros.map((pro) => (
              <article
                className="overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5"
                key={pro.name}
              >
                <div className="relative aspect-[4/4.3]">
                  <Image
                    alt={pro.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={pro.image}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl text-emerald-950">{pro.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-emerald-950/75">
                    {pro.specialty}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
