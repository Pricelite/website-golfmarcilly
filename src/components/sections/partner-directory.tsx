import Image from "next/image";

import { partners } from "@/data/partners";

export function PartnerDirectory() {
  return (
    <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Sponsors et partenaires">
      {partners.map((partner) => (
        <li key={partner.name} className="flex min-h-40 items-center justify-center rounded-[24px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5">
          {partner.website ? (
            <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`Visiter le site de ${partner.name} (nouvel onglet)`} className="flex h-full w-full items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              {partner.logo ? <Image src={partner.logo} alt={partner.name} width={208} height={80} sizes="208px" className="max-h-20 w-auto max-w-full object-contain" /> : <span className="font-serif text-2xl text-emerald-950">{partner.name}</span>}
            </a>
          ) : partner.logo ? (
            <Image src={partner.logo} alt={partner.name} width={208} height={80} sizes="208px" className="max-h-20 w-auto max-w-full object-contain" />
          ) : (
            <span className="font-serif text-2xl text-emerald-950">{partner.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
