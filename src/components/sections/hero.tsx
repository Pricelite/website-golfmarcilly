import Image from "next/image";

import { HeroPhotoCarousel } from "@/components/hero-photo-carousel";
import { CTAButton } from "@/components/ui/cta-button";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  beginnerCta: { label: string; href: string };
  appCta?: { label: string; href: string };
};

export function Hero({ eyebrow, title, subtitle, beginnerCta, appCta }: HeroProps) {
  return (
    <section aria-label="Bienvenue au Golf de Marcilly" className="overflow-hidden bg-[#f7f4e9] text-emerald-950">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col justify-center px-5 py-6 sm:px-10 sm:py-10 lg:col-start-1 lg:row-start-1 lg:justify-end lg:px-12 lg:pb-0 lg:pt-20 xl:px-20">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-emerald-800/40" />{eyebrow}
          </p>
          <h1 className="mt-3 max-w-xl text-balance font-serif text-[2.25rem] leading-[1.08] tracking-[-0.035em] sm:text-5xl xl:text-6xl 2xl:text-7xl">{title}</h1>
          <p className="mt-3 max-w-lg text-base leading-7 text-emerald-950/75 sm:text-lg sm:leading-8">{subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <CTAButton href={beginnerCta.href}>{beginnerCta.label}</CTAButton>
            <CTAButton href="/restaurant" variant="secondary">La Bergerie</CTAButton>
          </div>
        </div>
        <div className="relative h-[220px] sm:h-[340px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-[520px]">
          <HeroPhotoCarousel />
        </div>
        {appCta ? <div aria-label="Application du golf" className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 sm:px-10 lg:col-start-1 lg:row-start-2 lg:px-12 lg:pb-16 lg:pt-6 xl:px-20">
          <a href={appCta.href} target="_blank" rel="noopener noreferrer" aria-label={appCta.label + " (nouvel onglet)"} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-emerald-950 underline decoration-emerald-950/30 underline-offset-4 hover:decoration-emerald-950">
            <Image src="/images/flashgolf-logo.png" alt="" width={256} height={308} className="h-10 w-auto object-contain" />
            FlashGolf <span aria-hidden="true">↗</span>
          </a>
        </div> : null}
      </div>
    </section>
  );
}
