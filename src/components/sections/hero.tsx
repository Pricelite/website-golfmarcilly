import { HeroPhotoCarousel } from "@/components/hero-photo-carousel";
import { associationLinks } from "@/data/association";
import type { SiteOffer } from "@/data/offers";
import { PromoOffersModal } from "@/components/promo-offers-modal";
import { CTAButton } from "@/components/ui/cta-button";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  beginnerCta: { label: string; href: string };
  competitionCta: { label: string; href: string };
  promoCta?: { label: string; offers: SiteOffer[] };
};

export function Hero({ eyebrow, title, subtitle, beginnerCta, competitionCta, promoCta }: HeroProps) {
  return (
    <section aria-label="Bienvenue au Golf de Marcilly" className="overflow-hidden bg-[#f7f4e9] text-emerald-950">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-20">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-emerald-800/40" />{eyebrow}
          </p>
          <h1 className="mt-6 max-w-xl text-balance font-serif text-[2.75rem] leading-[1.08] tracking-[-0.035em] sm:text-6xl xl:text-7xl">{title}</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-emerald-950/75 sm:text-lg sm:leading-8">{subtitle}</p>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <CTAButton className="min-h-16 min-w-0 w-full px-2 py-2 text-center leading-4" href={beginnerCta.href}>{beginnerCta.label}</CTAButton>
            {promoCta ? <PromoOffersModal label={promoCta.label} offers={promoCta.offers} /> : null}
          </div>
          <nav aria-label="Informations compétition" className="mt-9 border-t border-emerald-950/15 pt-5">
            <p className="text-sm font-semibold text-emerald-950">Vous jouez en compétition ?</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <CTAButton className="min-h-16 min-w-0 w-full px-2 py-2 text-center leading-4" href={competitionCta.href} variant="secondary">{competitionCta.label}</CTAButton>
              <CTAButton className="min-h-16 min-w-0 w-full px-2 py-2 text-center leading-4" href={associationLinks.starts} variant="secondary">Consulter les départs</CTAButton>
              <CTAButton className="min-h-16 min-w-0 w-full px-2 py-2 text-center leading-4" href={associationLinks.results} variant="secondary">Voir les résultats</CTAButton>
            </div>
          </nav>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[640px]">
          <HeroPhotoCarousel />
        </div>
      </div>
    </section>
  );
}
