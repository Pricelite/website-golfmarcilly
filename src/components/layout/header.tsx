"use client";

import Link from "next/link";
import { useState } from "react";

import { CTAButton } from "@/components/ui/cta-button";
import { HeaderMarcillyClock } from "@/components/layout/header-marcilly-clock";
import { navigationItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex max-h-dvh flex-col border-b border-emerald-950/10 bg-[#f7f4e9]/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="shrink-0">
          <Link className="block" href="/">
            <span className="block font-serif text-xl text-emerald-950 sm:text-2xl">
              Golf de Marcilly
            </span>
            <span className="block text-xs uppercase tracking-[0.28em] text-emerald-700">
              Orléans | Loiret
            </span>
          </Link>
          <span className="mt-1 block xl:hidden"><HeaderMarcillyClock /></span>
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden min-w-0 flex-1 xl:block"
        >
          <ul className="flex items-center justify-center gap-3 text-sm text-emerald-950">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="whitespace-nowrap transition hover:text-emerald-700"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <div className="flex flex-col items-end gap-1">
            <a
              className="whitespace-nowrap text-sm font-medium text-emerald-950"
              href={`tel:${siteConfig.phoneHref}`}
            >
              {siteConfig.phoneDisplay}
            </a>
            <HeaderMarcillyClock />
          </div>
          <CTAButton href={siteConfig.reservationUrl}>Réserver un départ</CTAButton>
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
            {navigationItems.map((item) => (
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
                href={siteConfig.reservationUrl}
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
