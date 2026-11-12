"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import posthog from "posthog-js";
import { LogoutButton } from "@/components/backoffice/logout-button";

export type AdminNavigationGroup = { label: string; items: { href: string; label: string; detail: string }[] };
type AnalyticsIdentity = { id: string; email: string; name: string; role: string };

export function AdminShell({ children, groups, golfSession, contentSession, restaurantSession, analyticsIdentity }: {
  children: ReactNode; groups: AdminNavigationGroup[]; golfSession: boolean; contentSession: boolean; restaurantSession: boolean; analyticsIdentity?: AnalyticsIdentity;
}) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const identifiedId = useRef<string | null>(null);
  const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);

  useEffect(() => {
    if (!posthogEnabled) return;
    if (!analyticsIdentity) {
      if (identifiedId.current) {
        posthog.reset();
        identifiedId.current = null;
      }
      return;
    }
    if (identifiedId.current && identifiedId.current !== analyticsIdentity.id) posthog.reset();
    if (identifiedId.current !== analyticsIdentity.id) {
      posthog.identify(analyticsIdentity.id, {
        email: analyticsIdentity.email,
        name: analyticsIdentity.name,
        role: analyticsIdentity.role,
      });
      identifiedId.current = analyticsIdentity.id;
    }
  }, [analyticsIdentity, posthogEnabled]);

  const resetAnalytics = () => {
    if (posthogEnabled) posthog.reset();
  };
  const open = openPath === pathname;
  const connection = pathname === "/admin/contenu/connexion" || pathname === "/admin/contenu/activer" || pathname === "/admin/restaurant/connexion" || pathname === "/admin/restaurant/activer";
  if (connection || (!golfSession && !contentSession && !restaurantSession)) return <div className="min-h-dvh bg-[#f7f5ed]">
    <header className="border-b border-emerald-950/10 px-6 py-5"><Link href="/" className="font-serif text-xl">Golf de Marcilly <span className="ml-3 font-sans text-xs uppercase tracking-widest text-emerald-700">Administration</span></Link></header>
    {children}
  </div>;
  const active = groups.flatMap(group => group.items).filter(item => pathname === item.href || (item.href === "/admin/contenu" && pathname.startsWith("/admin/contenu/pages/")) || (item.href !== "/admin" && item.href !== "/admin/contenu" && pathname.startsWith(item.href + "/"))).at(-1);
  const contentArea = pathname.startsWith("/admin/contenu");
  return <div className="min-h-dvh bg-[#f5f5ef] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]" onKeyDown={event => {
    if (event.key === "Escape" && open) { setOpenPath(null); trigger.current?.focus(); }
  }}>
    <aside className="border-b border-emerald-950/10 bg-emerald-950 text-stone-50 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-4 px-5 py-5 lg:py-7">
        <Link href="/admin" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"><span className="block font-serif text-xl">Golf de Marcilly</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-200">Espace d’administration</span></Link>
        <button ref={trigger} type="button" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpenPath(open ? null : pathname)} className="min-h-11 rounded-full border border-white/30 px-4 text-sm lg:hidden">{open ? "Fermer" : "Rubriques"}</button>
      </div>
      <nav id="admin-navigation" aria-label="Rubriques de l’administration" className={`${open ? "block" : "hidden"} space-y-7 px-3 pb-6 lg:block lg:flex-1`}>
        {groups.map(group => <div key={group.label}><p className="px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-200/70">{group.label}</p><ul className="mt-3 space-y-1">{group.items.map(item => {
          const selected = active?.href === item.href;
          return <li key={item.href}><Link href={item.href} aria-current={selected ? "page" : undefined} onClick={() => setOpenPath(null)} className={`block rounded-xl border px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? "border-emerald-200/20 bg-white text-emerald-950" : "border-transparent hover:bg-white/10"}`}><span className="block text-sm font-semibold">{item.label}</span><span className={`mt-1 block text-xs ${selected ? "text-emerald-900/70" : "text-emerald-100/65"}`}>{item.detail}</span></Link></li>;
        })}</ul></div>)}
      </nav>
      <div className="hidden border-t border-white/15 p-5 lg:block"><Link href="/" target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Ouvrir le site ↗</Link></div>
    </aside>
    <div className="min-w-0">
      <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-emerald-950/10 bg-white px-4 py-4 sm:px-7">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-700">Administration</p><p className="mt-1 text-sm font-semibold">{active?.label ?? "Gestion du contenu"}</p></div>
        <div className="flex items-center gap-4"><Link href="/" target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 lg:hidden">Voir le site ↗</Link>
          {contentArea && contentSession ? <LogoutButton /> : golfSession ? <form action="/admin/logout" method="post" onSubmit={resetAnalytics}><button type="submit" className="min-h-11 rounded-full border border-emerald-950/20 px-4 text-sm">Déconnexion</button></form> : restaurantSession ? <form action="/api/restaurant-admin/logout" method="post" onSubmit={resetAnalytics}><button type="submit" className="min-h-11 rounded-full border border-emerald-950/20 px-4 text-sm">Déconnexion</button></form> : <LogoutButton />}
        </div>
      </header>
      <div className="px-4 py-7 sm:px-7 sm:py-9 2xl:px-10">{children}</div>
    </div>
  </div>;
}
