"use client";

import Link from "next/link";
import { useState } from "react";

import { CTAButton } from "@/components/ui/cta-button";
import { navigationItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-stone-50/88 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="shrink-0" href="/">
          <span className="block font-serif text-2xl text-emerald-950">
            Golf de Marcilly
          </span>
          <span className="block text-xs uppercase tracking-[0.28em] text-emerald-700">
            Orléans | Loiret
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-w-0 flex-1 xl:block"
        >
          <ul className="flex items-center justify-center gap-5 text-sm text-emerald-950">
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
          <a
            className="whitespace-nowrap text-sm font-medium text-emerald-950"
            href={`tel:${siteConfig.phoneHref}`}
          >
            {siteConfig.phoneDisplay}
          </a>
          <CTAButton href={siteConfig.reservationUrl}>Réserver un départ</CTAButton>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <a
            aria-label="Appeler le Golf de Marcilly"
            className="inline-flex rounded-full border border-emerald-950/12 px-3 py-2 text-sm font-semibold text-emerald-950 lg:hidden"
            href={`tel:${siteConfig.phoneHref}`}
          >
            Appeler
          </a>
          <button
            aria-expanded={open}
            aria-label="Ouvrir le menu"
            className="inline-flex rounded-full border border-emerald-950/12 px-3 py-2 text-sm font-semibold text-emerald-950"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-emerald-950/10 bg-stone-50 xl:hidden",
          open ? "max-h-[420px]" : "max-h-0",
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <ul className="space-y-3">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded-2xl border border-emerald-950/8 bg-white/70 px-4 py-3 text-sm font-medium text-emerald-950"
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
