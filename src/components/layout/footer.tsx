import Link from "next/link";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import { footerNavigation, siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-emerald-950/10 bg-emerald-950 text-stone-100">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="font-serif text-3xl">Golf de Marcilly</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-100/75">
            45 trous d&apos;exception, restaurant La Bergerie, enseignement et
            événements dans un domaine naturel unique aux portes d&apos;Orléans.
          </p>
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
            Newsletter
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-100/75">
            Recevez les actualités du club, les nouveautés du restaurant et les
            temps forts de la saison.
          </p>
          <div className="mt-5">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </footer>
  );
}
