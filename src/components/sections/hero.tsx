import Image from "next/image";

import { HeroPhotoCarousel } from "@/components/hero-photo-carousel";
import { associationLinks } from "@/data/association";
import type { SiteOffer } from "@/data/offers";
import { PromoOffersModal } from "@/components/promo-offers-modal";
import { CTAButton } from "@/components/ui/cta-button";
import { siteConfig } from "@/data/site";

function SocialIcon({ label }: { label: "Facebook" | "Instagram" | "LinkedIn" }) {
  if (label === "Facebook") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V10H8.7v3h2.4v8h2.5Z" /></svg>;
  }

  if (label === "Instagram") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M5.2 8.5H2.5V21h2.7V8.5ZM3.9 3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM21.5 13.7c0-3.3-1.8-5.1-4.3-5.1-1.9 0-2.8 1-3.3 1.7V8.5h-2.7V21h2.7v-6.7c0-1.8.4-3 2.2-3 1.7 0 2.1 1.4 2.1 3.1V21h3.3v-7.3Z" /></svg>;
}

const socialButtonColors = {
  Facebook: "bg-[#1877f2] hover:bg-[#1669d5]",
  Instagram: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] hover:brightness-110",
  LinkedIn: "bg-[#0a66c2] hover:bg-[#004182]",
} as const;

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  beginnerCta: { label: string; href: string };
  competitionCta: { label: string; href: string };
  appCta?: { label: string; href: string };
  promoCta?: { label: string; offers: SiteOffer[] };
};

export function Hero({ eyebrow, title, subtitle, beginnerCta, competitionCta, appCta, promoCta }: HeroProps) {
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
            <CTAButton className="min-h-12 min-w-0 w-full max-w-40 self-center justify-self-center px-2 py-2 text-center leading-4" href={beginnerCta.href}>{beginnerCta.label}</CTAButton>
            {promoCta ? <PromoOffersModal label={promoCta.label} offers={promoCta.offers} /> : null}
            {appCta ? (
              <a
                href={appCta.href}
                target="_blank"
                rel="noreferrer"
                aria-label={appCta.label}
                className="flex min-h-24 items-center justify-center px-4 py-2 transition hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Image src="/images/flashgolf-logo.png" alt="" width={256} height={308} className="h-20 w-auto object-contain" />
              </a>
            ) : null}
          </div>
          <nav aria-label="Informations compétition" className="mt-9 border-t border-emerald-950/15 pt-5">
            <p className="text-sm font-semibold text-emerald-950">Vous jouez en compétition ?</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <CTAButton className="min-h-12 min-w-0 w-full max-w-40 justify-self-center px-2 py-2 text-center leading-4" href={competitionCta.href} variant="secondary">{competitionCta.label}</CTAButton>
              <CTAButton className="min-h-12 min-w-0 w-full max-w-40 justify-self-center px-2 py-2 text-center leading-4" href={associationLinks.starts} variant="secondary">Consulter les départs</CTAButton>
              <CTAButton className="min-h-12 min-w-0 w-full max-w-40 justify-self-center px-2 py-2 text-center leading-4" href={associationLinks.results} variant="secondary">Voir les résultats</CTAButton>
            </div>
          </nav>
          <nav aria-label="Réseaux sociaux du Golf de Marcilly" className="mt-6 flex items-center gap-3">
            {siteConfig.socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Golf de Marcilly sur ${social.label} (nouvel onglet)`} className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${socialButtonColors[social.label]}`}>
                <SocialIcon label={social.label} />
              </a>
            ))}
          </nav>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[640px]">
          <HeroPhotoCarousel />
        </div>
      </div>
    </section>
  );
}
