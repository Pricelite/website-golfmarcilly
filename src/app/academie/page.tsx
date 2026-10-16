import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { academy } from "@/data/academy";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Académie du golf",
  description: "Découvrez l’académie du Golf de Marcilly, son accompagnement pour les jeunes et les portraits de Camille Da Violante et Sarah Gratté.",
  path: "/academie",
});

export default function AcademyPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Association sportive", path: "/association-sportive" },
        { name: "Académie du golf", path: "/academie" },
      ])} />

      <section className="bg-[#f7f4e9]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle as="h1" eyebrow="Grandir par le golf" title="L’académie du golf" description={academy.introduction} />
            <div className="mt-7 flex flex-wrap gap-3">
              <CTAButton href="/enseignement#ecole-de-golf">Découvrir l’école de golf</CTAButton>
              <CTAButton href={academy.acadomiaUrl} variant="secondary">Découvrir Acadomia</CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={academy.heroImage} alt="Visuel Acadomia associant accompagnement scolaire et golf" fill priority sizes="(max-width: 1024px) calc(100vw - 32px), 588px" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="L’académie" title="Nos jeunes" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {academy.youngGolfers.map((golfer) => (
            <article key={golfer.name} className="overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
              <div className="relative aspect-[4/3] bg-[#f7f4e9]">
                <Image src={golfer.image} alt={golfer.alt} fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1280px) 50vw, 588px" className="object-cover object-center" />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-2xl text-emerald-950">{golfer.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-emerald-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <SectionTitle tone="inverse" eyebrow="En savoir plus" title="Parlons de son parcours" description="L’accueil du golf vous renseigne sur l’académie et les cours pour les jeunes." />
          <CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary" className="self-start shrink-0">Appeler le golf</CTAButton>
        </div>
      </section>
    </>
  );
}
