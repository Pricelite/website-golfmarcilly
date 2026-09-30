import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DailyMenuManager } from "@/components/admin/daily-menu-manager";
import { parisDateKey } from "@/data/daily-menu";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { getDailyMenu } from "@/lib/restaurant/daily-menu-store";

export const metadata: Metadata = { title: "Carte du jour — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminRestaurantPage() {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) redirect("/admin?next=/admin/restaurant");
  const today = parisDateKey();
  let menu = null;
  let unavailable = false;
  try { menu = await getDailyMenu(today); }
  catch { unavailable = true; }

  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-3xl text-emerald-950">Carte du jour de La Bergerie</h1>
      <form action="/admin/logout" method="post"><button className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm" type="submit">Déconnexion</button></form>
    </div>
    <nav className="mt-4 flex flex-wrap gap-5 text-sm text-emerald-900" aria-label="Administration">
      <Link className="underline underline-offset-4" href="/admin">Administration</Link>
      <Link className="underline underline-offset-4" href="/restaurant#carte-du-jour" target="_blank" rel="noreferrer">Voir la carte publique ↗</Link>
    </nav>
    <p className="mt-7 max-w-3xl text-sm leading-7 text-emerald-900/80">Choisissez une date, renseignez trois entrées, trois plats et trois desserts, puis publiez. Seule la carte de la date du jour, selon l’heure de Paris, apparaît comme carte confirmée sur le site.</p>
    <DailyMenuManager initialDate={today} initialMenu={menu} initialError={unavailable} />
  </div>;
}
