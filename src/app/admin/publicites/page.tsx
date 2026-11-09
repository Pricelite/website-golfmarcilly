import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { listManagedHomeAds } from "@/lib/home-ads-store";
import { localContentStoreEnabled } from "@/lib/supabase/content";
import { parisDateKey } from "@/data/daily-menu";
import { HomeAdsManager } from "@/components/admin/home-ads-manager";

export const metadata: Metadata = { title: "Publicités — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function AdminHomeAdsPage() {
  if (!process.env.ADMIN_PASSWORD?.trim() || !await isAdminAuthenticated(await cookies())) redirect("/admin?next=/admin/publicites");
  let ads;
  try { ads = await listManagedHomeAds(); } catch { /* Render a useful error, never an empty editable catalogue. */ }
  return <section>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-serif text-3xl sm:text-4xl">Publicités de l’accueil</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70">Gérez les visuels affichés de chaque côté des conditions du jour. Choisissez leur emplacement, leur ordre et leur période de diffusion.</p></div><Link href="/" target="_blank" rel="noreferrer" className="text-sm font-semibold underline underline-offset-4">Voir l’accueil ↗</Link></div>
    {ads ? <HomeAdsManager initialAds={ads} today={parisDateKey()} localMode={localContentStoreEnabled()} /> : <p role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Les publicités sont momentanément indisponibles. Rechargez la page pour réessayer. Aucune modification n’a été effectuée.</p>}
  </section>;
}
