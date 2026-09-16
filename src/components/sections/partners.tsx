import Image from "next/image";

import { SectionTitle } from "@/components/ui/section-title";
import { partners } from "@/data/partners";

export function Partners() {
  if (partners.length === 0) return null;

  return (
    <section id="partenaires" aria-label="Nos partenaires" className="border-t border-emerald-950/10 bg-[#f7f4e9] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="Nos partenaires" align="center" />
        <ul className={partners.length === 1 ? "mx-auto mt-8 grid max-w-48 grid-cols-1" : "mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"}>
          {partners.map((partner) => {
            const logo = (
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 184px"
                className="object-contain p-4"
              />
            );

            return (
              <li key={partner.name} className="min-w-0">
                {partner.website ? (
                  <a href={partner.website} className="relative block h-28 rounded-lg transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                    {logo}
                  </a>
                ) : (
                  <div className="relative h-28">{logo}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
