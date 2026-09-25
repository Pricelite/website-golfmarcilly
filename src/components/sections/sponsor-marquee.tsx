import Image from "next/image";

import { partners } from "@/data/partners";

const sponsorsWithLogos = partners.flatMap((partner) =>
  partner.logo ? [{ name: partner.name, logo: partner.logo }] : [],
);

export function SponsorMarquee() {
  return (
    <section aria-label="Nos sponsors et partenaires" className="sponsor-marquee border-b border-emerald-950/10 bg-white py-5">
      <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-950/45 underline underline-offset-4">Ils nous accompagnent</p>
      <div className="sponsor-marquee-viewport overflow-hidden" role="group" aria-label="Sponsors du Golf de Marcilly">
        <div className="sponsor-marquee-track flex w-max">
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className={`flex shrink-0 items-center gap-8 pr-8${duplicate ? " sponsor-marquee-copy" : ""}`}>
              {sponsorsWithLogos.map((partner) => (
                <li key={partner.name} className="relative h-16 w-48 shrink-0 overflow-hidden">
                  <Image
                    src={partner.logo}
                    alt={duplicate ? "" : partner.name}
                    fill
                    sizes="192px"
                    className={partner.name === "Eden Park" ? "object-contain scale-[2.2]" : "object-contain"}
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
