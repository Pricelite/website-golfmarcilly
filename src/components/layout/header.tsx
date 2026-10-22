"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";

import { CTAButton } from "@/components/ui/cta-button";
import { HeaderMarcillyClock } from "@/components/layout/header-marcilly-clock";
import { navigationItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

const headerNavigation = navigationItems.filter(item => item.href !== "/contact" && item.href !== "/je-debute-le-golf");

export function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header onKeyDown={event => {
      if (event.key !== "Escape") return;
      if (open) { setOpen(false); menuButton.current?.focus(); }
    }} className="sticky top-0 z-50 flex max-h-dvh flex-col border-b border-emerald-950/10 bg-[#f7f4e9]/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="shrink-0">
          <Link className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700" href="/" aria-label="Golf de Marcilly — Accueil">
            <Image src="/images/LogoNoir.png" alt="" width={653} height={728} sizes="56px" className="h-14 w-auto shrink-0 object-contain" />
            <span className="hidden min-[400px]:block">
            <span className="block font-serif text-xl text-emerald-950 sm:text-2xl">
              Golf de Marcilly
            </span>
            <span className="block text-xs uppercase tracking-[0.28em] text-emerald-700">
              Orléans | Loiret
            </span>
            </span>
          </Link>
          <span className="mt-1 block xl:hidden"><HeaderMarcillyClock /></span>
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden min-w-0 flex-1 xl:block"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-emerald-950">
            {headerNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  className="block whitespace-nowrap rounded-lg py-2 transition hover:text-emerald-700"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <div className="hidden flex-col items-end gap-1 2xl:flex">
            <a
              className="whitespace-nowrap text-sm font-medium text-emerald-950"
              href={`tel:${siteConfig.phoneHref}`}
            >
              {siteConfig.phoneDisplay}
            </a>
            <HeaderMarcillyClock />
          </div>
          <CTAButton href={siteConfig.bookingEngineUrl}>Réserver un départ</CTAButton>
        </div>

        <div className="ml-auto flex items-center gap-2 xl:hidden">
          <a
            aria-label="Appeler le Golf de Marcilly"
            className="site-button inline-flex rounded-full px-3 py-2 text-sm font-semibold lg:hidden"
            href={`tel:${siteConfig.phoneHref}`}
          >
            Appeler
          </a>
          <button
            ref={menuButton}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="site-button inline-flex rounded-full px-3 py-2 text-sm font-semibold"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "min-h-0 overflow-y-auto overscroll-contain border-t border-emerald-950/10 bg-[#f7f4e9] xl:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Navigation mobile" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <ul className="space-y-3">
            {headerNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  className="site-button block rounded-2xl px-4 py-3 text-sm font-medium"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <CTAButton
                className="w-full"
                href={siteConfig.bookingEngineUrl}
                variant="primary"
              >
                Réserver un départ
              </CTAButton>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
