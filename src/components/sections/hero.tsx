import Link from "next/link";
import { HeroPhotoCarousel } from "@/components/hero-photo-carousel";
import type { SiteOffer } from "@/data/offers";
import { PromoOffersModal } from "@/components/promo-offers-modal";
import { CTAButton } from "@/components/ui/cta-button";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  tertiaryCta?: { label: string; href: string };
  promoCta?: { label: string; offers: SiteOffer[] };
};

export function Hero({ eyebrow, title, subtitle, primaryCta, tertiaryCta, promoCta }: HeroProps) {
  return (
    <section aria-label="Bienvenue au Golf de Marcilly" className="overflow-hidden bg-[#f7f4e9] text-emerald-950">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-20">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-emerald-800/40" />{eyebrow}
          </p>
          <h1 className="mt-6 max-w-xl text-balance font-serif text-[2.75rem] leading-[1.08] tracking-[-0.035em] sm:text-6xl xl:text-7xl">{title}</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-emerald-950/75 sm:text-lg sm:leading-8">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:flex-wrap">
            <CTAButton className="min-h-12" href={primaryCta.href}>{primaryCta.label}</CTAButton>
            {tertiaryCta ? <CTAButton className="min-h-12 border-emerald-900/30 bg-transparent" href={tertiaryCta.href} variant="secondary">{tertiaryCta.label}</CTAButton> : null}
          </div>
          <nav aria-label="Explorer le golf" className="mt-9 border-t border-emerald-950/15 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/65">À découvrir aussi</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
              {[
                { href: "/golf", label: "Les parcours" },
                { href: "/restaurant", label: "Le restaurant" },
                { href: "/evenements", label: "Vos événements" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex min-h-10 items-center gap-2 underline decoration-emerald-900/25 underline-offset-4 hover:decoration-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                  {link.label}<span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[640px]">
          <HeroPhotoCarousel />
          {promoCta ? <PromoOffersModal label={promoCta.label} offers={promoCta.offers} /> : null}
        </div>
      </div>
    </section>
  );
}
