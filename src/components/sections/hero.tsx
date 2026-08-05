import Image from "next/image";

import type { SiteOffer } from "@/data/offers";
import { PromoOffersModal } from "@/components/promo-offers-modal";
import { CTAButton } from "@/components/ui/cta-button";
import { Reveal } from "@/components/ui/reveal";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tertiaryCta?: { label: string; href: string };
  quaternaryCta?: { label: string; href: string };
  quinaryCta?: { label: string; href: string };
  promoCta?: { label: string; offers: SiteOffer[] };
  image: string;
};

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  quaternaryCta,
  quinaryCta,
  promoCta,
  image,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-emerald-950 text-stone-50">
      <div className="absolute inset-0">
        <Image
          alt="Golf de Marcilly"
          className="object-cover opacity-55"
          fill
          priority
          sizes="100vw"
          src={image}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(6,24,20,0.92),rgba(6,24,20,0.38))]" />
      </div>

      <div className="relative mx-auto flex min-h-[76vh] max-w-7xl items-end px-4 py-20 sm:px-6 lg:px-8">
        {promoCta ? (
          <Reveal delay={0.05}>
            <PromoOffersModal label={promoCta.label} offers={promoCta.offers} />
          </Reveal>
        ) : null}
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-200/80">
              {eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/82 sm:text-lg">
              {subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href={primaryCta.href}>{primaryCta.label}</CTAButton>
              {secondaryCta ? <CTAButton href={secondaryCta.href}>{secondaryCta.label}</CTAButton> : null}
              {tertiaryCta ? (
                <CTAButton href={tertiaryCta.href} variant="secondary">
                  {tertiaryCta.label}
                </CTAButton>
              ) : null}
              {quaternaryCta ? (
                <CTAButton href={quaternaryCta.href} variant="secondary">
                  {quaternaryCta.label}
                </CTAButton>
              ) : null}
              {quinaryCta ? (
                <CTAButton href={quinaryCta.href} variant="secondary">
                  {quinaryCta.label}
                </CTAButton>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
