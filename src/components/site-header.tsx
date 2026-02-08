"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Vie du club",
    href: "/vie-du-club",
    children: [
      { label: "Actualités", href: "/vie-du-club/actualites" },
      { label: "Événements", href: "/vie-du-club/evenements" },
      { label: "Galerie", href: "/vie-du-club/galerie" },
    ],
  },
  {
    label: "Restaurant",
    href: "/restaurant",
    children: [
      { label: "Carte & menus", href: "/restaurant/carte-menus" },
      { label: "Horaires", href: "/restaurant/horaires" },
      { label: "Réservation", href: "/restaurant/reservation" },
    ],
  },
  {
    label: "Enseignement",
    href: "/enseignement",
    children: [
      { label: "Cours individuels", href: "/enseignement/cours-individuels" },
      { label: "Stages", href: "/enseignement/stages" },
      { label: "École de golf", href: "/enseignement/ecole-de-golf" },
    ],
  },
  {
    label: "Association sportive",
    href: "/association-sportive",
    children: [
      { label: "Compétitions", href: "/association-sportive/competitions" },
      { label: "Classements", href: "/association-sportive/classements" },
      { label: "Adhésion", href: "/association-sportive/adhesion" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/70 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link className="flex flex-col" href="/">
          <span className="font-[var(--font-display)] text-lg text-emerald-950">
            Golf de Marcilly-Orléans
          </span>
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-semibold text-emerald-900/80 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <div key={item.label} className="relative group">
                <Link
                  className={`rounded-full px-3 py-1 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                    active
                      ? "bg-emerald-100/70 text-emerald-950 shadow-sm"
                      : ""
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-52 translate-y-2 rounded-2xl border border-emerald-900/10 bg-white/95 p-2 text-sm text-emerald-900 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        className="block rounded-xl px-3 py-2 transition hover:bg-emerald-50"
                        href={child.href}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <button
          className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white/80 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-white lg:hidden"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() =>
            setMobileOpen((value) => {
              const next = !value;

              if (!next) {
                setOpenMenu(null);
              }

              return next;
            })
          }
        >
          {mobileOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden border-t border-emerald-900/10 bg-white/95 px-6 pb-5 pt-3 text-emerald-900 transition-all duration-300`}
      >
        <div className="flex flex-col gap-3 text-sm font-semibold">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const isOpen = openMenu === item.label;

            return (
              <div key={item.label} className="rounded-2xl border border-emerald-900/10 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <Link
                    className={`text-sm font-semibold ${
                      active ? "text-emerald-900" : "text-emerald-800/80"
                    }`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children?.length ? (
                    <button
                      className="rounded-full border border-emerald-900/10 px-2 py-1 text-xs text-emerald-900"
                      type="button"
                      onClick={() =>
                        setOpenMenu((current) =>
                          current === item.label ? null : item.label
                        )
                      }
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "\u2212" : "+"}
                    </button>
                  ) : null}
                </div>
                {item.children?.length ? (
                  <div
                    className={`${
                      isOpen ? "grid" : "hidden"
                    } gap-2 border-t border-emerald-900/10 px-4 py-3 text-sm`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        className="rounded-lg px-2 py-1 transition hover:bg-emerald-50"
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}




