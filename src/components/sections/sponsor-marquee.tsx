import Image from "next/image";

import { partners } from "@/data/partners";

const hiddenMarqueePartners = new Set(["Rotary", "WAGC"]);

const sponsorsWithLogos = partners.flatMap((partner) =>
  partner.logo && !hiddenMarqueePartners.has(partner.name)
    ? [{ name: partner.name, logo: partner.logo }]
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
                  <Image
                    src={partner.logo}
                    alt={duplicate ? "" : partner.name}
                    width={160}
                    height={56}
                    sizes="160px"
                    className="h-14 w-40 object-contain"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
