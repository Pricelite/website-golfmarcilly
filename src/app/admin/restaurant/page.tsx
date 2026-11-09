import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DailyMenuManager } from "@/components/admin/daily-menu-manager";
import { parisDateKey } from "@/data/daily-menu";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { getDailyMenu } from "@/lib/restaurant/daily-menu-store";
import { sharedContentSyncEnabled } from "@/lib/supabase/content";

export const metadata: Metadata = { title: "Carte du jour — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminRestaurantPage() {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) redirect("/admin?next=/admin/restaurant");
  const today = parisDateKey();
  let menu = null;
  let unavailable = false;
  try { menu = await getDailyMenu(today); }
  catch { unavailable = true; }

  return <div className="w-full">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-3xl text-emerald-950">Carte du jour de La Bergerie</h1>
    </div>
    <nav className="mt-4 flex flex-wrap gap-5 text-sm text-emerald-900" aria-label="Administration">
      <Link className="underline underline-offset-4" href="/restaurant#carte-du-jour" target="_blank" rel="noreferrer">Voir la carte publique ↗</Link>
    </nav>
    {sharedContentSyncEnabled() ? <p role="status" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Données partagées activées : la carte enregistrée ici est publiée sur le site public.</p> : null}
    <p className="mt-7 max-w-3xl text-sm leading-7 text-emerald-900/80">Publiez une carte uniquement lorsque les plats ou les prix changent. La dernière carte publiée reste automatiquement visible à toute heure jusqu’à la prochaine mise à jour. Le plat choisi pour l’ardoise n’apparaît que le jour de publication, du lundi au vendredi.</p>
    <DailyMenuManager initialDate={today} initialMenu={menu} initialError={unavailable} />
  </div>;
}
