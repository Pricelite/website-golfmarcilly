import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteConditionsManager } from "@/components/admin/site-conditions-manager";
import { emptyConditions } from "@/data/site-conditions";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { listSiteConditions } from "@/lib/site-conditions-store";
import { localContentStoreEnabled, sharedContentSyncEnabled } from "@/lib/supabase/content";

export const metadata: Metadata = { title: "État du golf — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSiteConditionsPage() {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) redirect("/admin?next=/admin/site-conditions");
  let conditions = emptyConditions();
  let unavailable = false;
  try { conditions = await listSiteConditions(); }
  catch { unavailable = true; }
  return <div className="w-full">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-3xl text-emerald-950">État du golf</h1>
    </div>
    <nav className="mt-4 flex flex-wrap gap-5 text-sm text-emerald-900" aria-label="Administration">
      <Link className="underline underline-offset-4" href="/" target="_blank" rel="noreferrer">Voir l’accueil ↗</Link>
    </nav>
    {sharedContentSyncEnabled() ? <p role="status" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Données partagées activées : les changements effectués ici sont publiés sur le site public.</p> : null}
    {unavailable ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-800">Les états sont indisponibles. Vérifiez la configuration et la migration avant de les modifier.</p> :
      <SiteConditionsManager initialConditions={conditions} localMode={localContentStoreEnabled()} />}
  </div>;
}
