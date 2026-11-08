import Image from "next/image";

import { partners } from "@/data/partners";

const sponsorsWithLogos = partners.filter((partner) =>
  (partner.logo || partner.showInMarquee === true) && partner.showInMarquee !== false,
);

export function SponsorMarquee() {
  return (
    <section aria-label="Nos sponsors et partenaires" className="sponsor-marquee bg-transparent py-4">
      <div className="sponsor-marquee-viewport overflow-hidden" role="group" aria-label="Sponsors du Golf de Marcilly">
        <div className="sponsor-marquee-track flex w-max bg-[#f7f4e9]">
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className={`flex shrink-0 items-center gap-6 pr-6${duplicate ? " sponsor-marquee-copy" : ""}`}>
              {sponsorsWithLogos.map((partner) => {
                const content = partner.logo ? <>
                  <Image
                    src={partner.logo}
                    alt={duplicate || partner.showNameWithLogo ? "" : partner.name}
                    width={partner.showNameWithLogo ? 56 : 160}
                    height={56}
                    sizes={partner.showNameWithLogo ? "56px" : "160px"}
                    loading="eager"
                    className={`${partner.showNameWithLogo ? "h-14 w-14 shrink-0 rounded-md" : partner.name === "T’Libre Max" ? "h-16 w-44" : "h-14 w-40"} object-contain${partner.removeWhiteBackground === false ? "" : " mix-blend-multiply"}`}
                  />
                  {partner.showNameWithLogo ? <span className="text-left text-xs font-semibold leading-4 text-emerald-950">{partner.name}</span> : null}
                </> : <span className="text-center font-serif text-2xl font-semibold tracking-wide text-emerald-950">{partner.name}</span>;
                const contentClass = "flex h-full w-full items-center justify-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700";
                return (
                <li key={partner.name} className="flex h-16 w-44 shrink-0 items-center justify-center overflow-hidden">
                  {partner.website ? <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={duplicate ? -1 : undefined}
                    aria-label={duplicate ? undefined : `Visiter le site de ${partner.name} (nouvel onglet)`}
                    className={contentClass}
                  >
                    {content}
                  </a> : <span className={contentClass}>{content}</span>}
                </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
