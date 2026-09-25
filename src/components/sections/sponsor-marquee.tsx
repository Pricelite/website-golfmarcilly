import Image from "next/image";

import { partners } from "@/data/partners";

const sponsorsWithLogos = partners.flatMap((partner) =>
  partner.logo && partner.website
    ? [{ name: partner.name, logo: partner.logo, website: partner.website }]
    : [],
);

export function SponsorMarquee() {
  return (
    <section aria-label="Nos sponsors et partenaires" className="sponsor-marquee bg-transparent py-4">
      <div className="sponsor-marquee-viewport overflow-hidden" role="group" aria-label="Sponsors du Golf de Marcilly">
        <div className="sponsor-marquee-track flex w-max">
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className={`flex shrink-0 items-center gap-6 pr-6${duplicate ? " sponsor-marquee-copy" : ""}`}>
              {sponsorsWithLogos.map((partner) => (
                <li key={partner.name} className="flex h-16 w-44 shrink-0 items-center justify-center overflow-hidden">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={duplicate ? -1 : undefined}
                    aria-label={duplicate ? undefined : `Visiter le site de ${partner.name} (nouvel onglet)`}
                    className="flex h-full w-full items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700"
                  >
                    <Image
                      src={partner.logo}
                      alt={duplicate ? "" : partner.name}
                      width={160}
                      height={56}
                      sizes="160px"
                      className="h-14 w-40 object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
