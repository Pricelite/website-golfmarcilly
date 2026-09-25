import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { partners } from "@/data/partners";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Nos partenaires",
  description: "Le Golf de Marcilly et son association sportive remercient les partenaires qui les accompagnent.",
  path: "/partenaires",
  image: "/images/club-house-marcilly.png",
});

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Partenaires", path: "/partenaires" },
      ])} />

      <section className="relative isolate overflow-hidden bg-emerald-950 text-stone-50">
        <Image
          src="/images/club-house-marcilly.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,32,25,0.94)_0%,rgba(4,32,25,0.78)_55%,rgba(4,32,25,0.34)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#dbe9b4]">Golf de Marcilly · Association sportive</p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Merci à celles et ceux qui font vivre <span className="italic text-[#dbe9b4]">Marcilly.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-stone-100/90 sm:text-lg">
              Le Golf de Marcilly et l’association sportive remercient chaleureusement leurs sponsors et partenaires pour leur confiance et leur soutien.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4e9] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Avec toute notre reconnaissance"
            title="Nos sponsors et partenaires"
            description="Chacun de ces noms compte dans la vie du golf et de son association sportive. Merci d’être à nos côtés."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {partners.map((partner, index) => (
              <li key={partner.name} className="flex min-h-40 flex-col rounded-[24px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5">
                <span className="text-xs font-semibold tracking-[0.2em] text-emerald-700">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex flex-1 items-center justify-center py-4 text-center">
                  {partner.logo ? (
                    partner.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visiter le site de ${partner.name} (nouvel onglet)`}
                        className="relative block h-20 w-full rounded-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
                      >
                        <Image src={partner.logo} alt={partner.name} fill sizes="240px" className="object-contain" />
                      </a>
                    ) : (
                      <div className="relative h-20 w-full">
                        <Image src={partner.logo} alt={partner.name} fill sizes="240px" className="object-contain" />
                      </div>
                    )
                  ) : (
                    <h3 className="font-serif text-2xl text-emerald-950">{partner.name}</h3>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[28px] bg-emerald-950 p-7 text-stone-50 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dbe9b4]">À vos côtés</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Envie d’échanger avec nous ?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-100/80">Parlons des possibilités de partenariat avec le golf et l’association sportive.</p>
          </div>
          <CTAButton href="/contact" variant="secondary" className="shrink-0 self-start">Nous contacter</CTAButton>
        </div>
      </section>
    </>
  );
}
