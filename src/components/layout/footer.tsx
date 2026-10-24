import Link from "next/link";

import { footerNavigation, siteConfig } from "@/data/site";

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

export function Footer() {
  return (
    <footer className="border-t border-emerald-950/10 bg-emerald-950 text-stone-100">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="font-serif text-3xl">Golf de Marcilly</p>
          <div className="mt-6 space-y-2 text-sm text-stone-100/80">
            <p>{siteConfig.addressLine1}</p>
            <p>{siteConfig.addressLine2}</p>
            <p>
              <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
            </p>
            <p>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
          </div>
          <nav aria-label="Réseaux sociaux du Golf de Marcilly" className="mt-6 flex items-center justify-start gap-3">
            {siteConfig.socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Golf de Marcilly sur ${social.label} (nouvel onglet)`} className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${socialButtonColors[social.label]}`}>
                <SocialIcon label={social.label} />
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-100/70">
            Navigation
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {footerNavigation.visiter.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-stone-100/75" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            {footerNavigation.infos.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-stone-100/75" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-100/70">
            Accès rapide
          </h2>
          <div className="mt-4 space-y-3 text-sm text-stone-100/80">
            <p>
              <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
            </p>
            <p>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
            <p>
              <Link className="hover:text-stone-100/75" href={siteConfig.bookingEngineUrl}>
                Réserver un départ
              </Link>
            </p>
            <p>
              <Link className="hover:text-stone-100/75" href={siteConfig.alternateReservationUrl}>
                Autre plateforme de réservation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
