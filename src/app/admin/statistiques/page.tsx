import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StatisticsDashboard } from "@/components/admin/statistics-dashboard";
import { canViewStatistics } from "@/lib/analytics/admin";

export const metadata: Metadata = { title: "Statistiques du site", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function StatisticsPage() {
  if (!await canViewStatistics()) redirect("/admin?next=/admin/statistiques");
  return <section className="w-full">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Back-office</p>
    <h1 className="mt-2 font-serif text-4xl text-emerald-950">Statistiques</h1>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/75">Fréquentation du site public et connexions à l’administration, regroupées selon l’heure de Marcilly (Europe/Paris).</p>
    <StatisticsDashboard />
  </section>;
}
