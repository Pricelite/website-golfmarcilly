import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StatisticsDashboard } from "@/components/admin/statistics-dashboard";
import { canViewStatistics } from "@/lib/analytics/admin";

export const metadata: Metadata = { title: "Statistiques du site", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function StatisticsPage() {
  if (!await canViewStatistics()) redirect("/admin?next=/admin/statistiques");
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <nav aria-label="Administration" className="mb-6 text-sm"><Link href="/admin" className="font-semibold underline underline-offset-4">← Administration du golf</Link></nav>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Back-office</p>
    <h1 className="mt-2 font-serif text-4xl text-emerald-950">Statistiques</h1>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/75">Fréquentation du site public et connexions à l’administration, regroupées selon l’heure de Marcilly (Europe/Paris).</p>
    <StatisticsDashboard />
  </section>;
}
