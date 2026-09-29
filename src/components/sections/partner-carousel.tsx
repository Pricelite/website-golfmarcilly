import Image from "next/image";

import { partners } from "@/data/partners";

export function PartnerCarousel() {
  return (
    <div className="partner-carousel mt-10 overflow-hidden" role="group" aria-label="Carrousel des sponsors et partenaires">
      <div className="partner-carousel-track flex w-max">
        {[false, true].map((duplicate) => (
          <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className={`flex shrink-0 gap-4 pr-4${duplicate ? " partner-carousel-copy" : ""}`}>
            {partners.map((partner) => (
              <li key={partner.name} className="flex h-40 w-64 shrink-0 items-center justify-center rounded-[24px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" tabIndex={duplicate ? -1 : undefined} aria-label={duplicate ? undefined : `Visiter le site de ${partner.name} (nouvel onglet)`} className="flex h-full w-full items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                    {partner.logo ? <Image src={partner.logo} alt={duplicate ? "" : partner.name} width={208} height={80} sizes="208px" className="max-h-20 w-auto max-w-full object-contain" /> : <span className="font-serif text-2xl text-emerald-950">{partner.name}</span>}
                  </a>
                ) : partner.logo ? (
                  <Image src={partner.logo} alt={duplicate ? "" : partner.name} width={208} height={80} sizes="208px" className="max-h-20 w-auto max-w-full object-contain" />
                ) : (
                  <span className="font-serif text-2xl text-emerald-950">{partner.name}</span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
