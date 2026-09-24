import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";
import { SectionTitle } from "@/components/ui/section-title";
import { partners } from "@/data/partners";

export function Partners() {
  return (
    <section id="partenaires" aria-label="Nos partenaires" className="border-t border-emerald-950/10 bg-[#f7f4e9] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="À nos côtés"
          title="Merci à nos partenaires"
          description="Le golf et l’association sportive remercient celles et ceux qui les accompagnent."
          align="center"
        />
        <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3">
          {partners.slice(0, 6).map((partner) => (
            <li key={partner.name} className="flex min-h-28 items-center justify-center rounded-2xl border border-emerald-950/10 bg-white px-4 py-5 text-center font-serif text-xl text-emerald-950">
              {partner.logo ? (
                <div className="relative h-16 w-full">
                  <Image src={partner.logo} alt={partner.name} fill sizes="(max-width: 640px) 160px, 280px" className="object-contain" />
                </div>
              ) : partner.name}
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <CTAButton href="/partenaires" variant="secondary">Découvrir tous nos partenaires</CTAButton>
        </div>
      </div>
    </section>
  );
}
