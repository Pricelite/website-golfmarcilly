"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toProtectedImageSrc } from "@/lib/protected-image";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

type ThemeMode = "light" | "dark";

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Pr\u00e9sentation", href: "/vie-du-club" },
  {
    label: "Restaurant",
    href: "/restaurant",
  },
  {
    label: "Enseignement",
    href: "/enseignement",
  },
  {
    label: "Association sportive",
    href: "/association-sportive",
    children: [
      { label: "Comp\u00e9titions", href: "/association-sportive/competitions" },
      { label: "Classements", href: "/association-sportive/classements" },
      { label: "Adh\u00e9sion", href: "/association-sportive/adhesion" },
    ],
  },
  { label: "Acad\u00e9mie", href: "/academie" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  useEffect(() => {
    applyTheme("light");
  }, []);

  function handleToggleTheme() {
    setIsDarkMode((current) => {
      const next = !current;
      const nextMode: ThemeMode = next ? "dark" : "light";
      applyTheme(nextMode);
      return next;
    });
  }


  return (
    <header
      ref={headerRef}
      className="site-header border-b border-emerald-900/10 bg-white/70 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr] items-center gap-4 px-6 py-5 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          className="inline-flex items-center"
          href="/"
          aria-label="Accueil"
        >
          <Image
            src={toProtectedImageSrc("/images/LogoNoir.png")}
            alt="Logo Golf de Marcilly"
            width={255}
            height={81}
            className="site-header__logo h-[81px] w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-semibold text-emerald-900/80 lg:col-start-2 lg:flex lg:justify-self-center">
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
                  <div className="site-header__dropdown pointer-events-none absolute left-0 top-full z-20 mt-2 w-52 translate-y-2 rounded-2xl border border-emerald-900/10 bg-white/95 p-2 text-sm text-emerald-900 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
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

        <div className="flex items-center justify-self-end gap-2 lg:col-start-3 lg:justify-self-end">
          <button
            className="theme-switch inline-flex items-center"
            type="button"
            onClick={handleToggleTheme}
            aria-pressed={isDarkMode}
            aria-label="Basculer entre le mode jour et le mode nuit"
            title="Basculer jour/nuit"
          >
            <span className="sr-only">Basculer entre le mode jour et le mode nuit</span>
            <span className="theme-switch__icon theme-switch__icon--sun" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="theme-switch__icon theme-switch__icon--moon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 1 0 10.5 10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="theme-switch__thumb" aria-hidden="true" />
          </button>

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
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } site-header__mobile-menu overflow-hidden border-t border-emerald-900/10 bg-white/95 px-6 pb-5 pt-3 text-emerald-900 transition-all duration-300`}
      >
        <div className="flex flex-col gap-3 text-sm font-semibold">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const isOpen = openMenu === item.label;

            return (
              <div
                key={item.label}
                className="site-header__mobile-card rounded-2xl border border-emerald-900/10 bg-white"
              >
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
                      {isOpen ? "-" : "+"}
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




