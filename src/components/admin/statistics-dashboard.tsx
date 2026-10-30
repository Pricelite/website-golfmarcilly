"use client";

import { useEffect, useMemo, useState } from "react";

import { addDays, parisDay, reportRange } from "@/lib/analytics/core";
import type { Report } from "@/lib/analytics/store";

type DashboardReport = Report & { range: { start: string; end: string; previousStart: string; previousEnd: string } };
type Preset = "today" | "seven" | "thirty" | "month" | "custom";
const metrics = [
  { key: "visitors", title: "Visiteurs uniques", description: "Navigateurs distincts ayant accepté la mesure." },
  { key: "visits", title: "Visites", description: "Séances de navigation ; une nouvelle visite commence après 30 min d’inactivité." },
  { key: "views", title: "Pages vues", description: "Pages publiques affichées, y compris lors d’une navigation interne." },
  { key: "logins", title: "Connexions réussies", description: "Ouvertures de session dans les deux espaces d’administration." },
  { key: "accounts", title: "Comptes distincts", description: "Comptes nominatifs connectés ; le mot de passe partagé ne permet pas d’identifier une personne." },
] as const;

function comparison(current: number, previous: number) {
  const difference = current - previous;
  const sign = difference > 0 ? "+" : "";
  return `${sign}${difference.toLocaleString("fr-FR")} ${previous > 0 ? `(${sign}${Math.round(difference / previous * 100)} %)` : "(pourcentage indisponible)"}`;
}

function FrequencyChart({ series }: { series: Report["series"] }) {
  const max = Math.max(1, ...series.map(point => point.views));
  const points = series.map((point, index) => `${series.length === 1 ? 400 : 20 + index * 760 / (series.length - 1)},${180 - point.views * 150 / max}`).join(" ");
  return <div className="overflow-hidden rounded-3xl border border-emerald-950/15 bg-white p-5 shadow-sm sm:p-7">
    <h2 className="font-serif text-2xl">Évolution des pages vues</h2>
    <p className="mt-2 text-sm text-emerald-950/70">Une valeur par jour de la période choisie.</p>
    <svg className="mt-5 h-52 w-full" viewBox="0 0 800 200" role="img" aria-label={`Graphique de ${series.length} jours, maximum ${max} pages vues par jour`} preserveAspectRatio="none">
      <line x1="20" y1="180" x2="780" y2="180" stroke="#9bb7a8" />
      {series.length > 1 ? <polyline points={points} fill="none" stroke="#0b6a50" strokeWidth="4" vectorEffect="non-scaling-stroke" /> : null}
      {series.length === 1 ? <circle cx="400" cy={180 - series[0].views * 150 / max} r="6" fill="#0b6a50" /> : null}
    </svg>
    <div className="flex justify-between text-xs text-emerald-950/65"><span>{series[0]?.day ?? ""}</span><span>{series.at(-1)?.day ?? ""}</span></div>
  </div>;
}

export function StatisticsDashboard() {
  const today = parisDay(new Date());
  const [preset, setPreset] = useState<Preset>("seven");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [data, setData] = useState<DashboardReport | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const range = useMemo(() => {
    const start = preset === "today" ? today : preset === "seven" ? addDays(today, -6) : preset === "thirty" ? addDays(today, -29) : preset === "month" ? `${today.slice(0, 7)}-01` : customStart;
    return reportRange(start, preset === "custom" ? customEnd : today, today);
  }, [preset, today, customStart, customEnd]);

  useEffect(() => {
    if (!range) { setError("Choisissez une période valide de 366 jours maximum, sans date future."); setBusy(false); return; }
    const controller = new AbortController();
    setBusy(true); setError("");
    fetch(`/api/admin/statistiques?start=${range.start}&end=${range.end}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Chargement impossible."); return result as DashboardReport; })
      .then(result => { setData(result); setBusy(false); })
      .catch(cause => { if (controller.signal.aborted) return; setError(cause instanceof Error ? cause.message : "Chargement impossible."); setBusy(false); });
    return () => controller.abort();
  }, [range?.start, range?.end]);

  return <div className="mt-8 space-y-8">
    <div className="rounded-3xl border border-emerald-950/15 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-serif text-xl">Période</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choisir la période">
        {([ ["today", "Aujourd’hui"], ["seven", "7 derniers jours"], ["thirty", "30 derniers jours"], ["month", "Ce mois-ci"], ["custom", "Personnalisée"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={preset === value} onClick={() => setPreset(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${preset === value ? "border-emerald-950 bg-emerald-950 text-white" : "border-emerald-950/20 bg-white text-emerald-950"}`}>{label}</button>)}
      </div>
      {preset === "custom" ? <div className="mt-4 flex flex-wrap gap-4"><label className="text-sm">Du<input type="date" value={customStart} max={today} onChange={event => setCustomStart(event.target.value)} className="mt-1 block rounded-lg border border-emerald-950/25 p-2" /></label><label className="text-sm">Au<input type="date" value={customEnd} max={today} onChange={event => setCustomEnd(event.target.value)} className="mt-1 block rounded-lg border border-emerald-950/25 p-2" /></label></div> : null}
      {range ? <p className="mt-4 text-sm text-emerald-950/70">Du {range.start} au {range.end} · comparaison avec le {range.previousStart} au {range.previousEnd}</p> : null}
    </div>

    {busy ? <p role="status" className="rounded-2xl bg-emerald-50 p-5">Chargement des statistiques…</p> : null}
    {error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</p> : null}
    {!busy && !error && data ? <>
      {data.current.views === 0 && data.current.logins === 0 ? <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">Aucune donnée pour cette période. Les visites apparaîtront après le consentement des visiteurs et l’application de la migration.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(metric => <article key={metric.key} className="rounded-2xl border border-emerald-950/15 bg-[#e8f4ed] p-5 shadow-sm"><h2 className="text-sm font-semibold text-emerald-950">{metric.title}</h2><p className="mt-3 font-serif text-4xl text-emerald-950">{data.current[metric.key].toLocaleString("fr-FR")}</p><p className="mt-2 text-xs font-semibold text-emerald-800">{comparison(data.current[metric.key], data.previous[metric.key])}</p><p className="mt-3 text-xs leading-5 text-emerald-950/70">{metric.description}</p></article>)}</div>
      <FrequencyChart series={data.series} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-3xl border border-emerald-950/15 bg-white shadow-sm"><div className="p-5 sm:p-7"><h2 className="font-serif text-2xl">Pages les plus consultées</h2><p className="mt-2 text-sm text-emerald-950/70">Classement par pages vues.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-emerald-950 text-white"><tr><th scope="col" className="px-5 py-3">Page</th><th scope="col" className="px-5 py-3 text-right">Vues</th><th scope="col" className="px-5 py-3 text-right">Visiteurs</th></tr></thead><tbody className="divide-y divide-emerald-950/10">{data.pages.map(page => <tr key={page.path}><th scope="row" className="break-all px-5 py-3 font-medium">{page.path}</th><td className="px-5 py-3 text-right">{page.views.toLocaleString("fr-FR")}</td><td className="px-5 py-3 text-right">{page.visitors.toLocaleString("fr-FR")}</td></tr>)}</tbody></table>{data.pages.length === 0 ? <p className="p-5 text-sm">Aucune page consultée dans cette période.</p> : null}</div></section>
        <section className="overflow-hidden rounded-3xl border border-emerald-950/15 bg-white shadow-sm"><div className="p-5 sm:p-7"><h2 className="font-serif text-2xl">Rubriques les plus consultées</h2><p className="mt-2 text-sm text-emerald-950/70">Premier segment du chemin, avec les visiteurs distincts de chaque rubrique.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-emerald-950 text-white"><tr><th scope="col" className="px-5 py-3">Rubrique</th><th scope="col" className="px-5 py-3 text-right">Vues</th><th scope="col" className="px-5 py-3 text-right">Visiteurs</th></tr></thead><tbody className="divide-y divide-emerald-950/10">{data.sections.map(section => <tr key={section.section}><th scope="row" className="break-all px-5 py-3 font-medium">{section.section}</th><td className="px-5 py-3 text-right">{section.views.toLocaleString("fr-FR")}</td><td className="px-5 py-3 text-right">{section.visitors.toLocaleString("fr-FR")}</td></tr>)}</tbody></table>{data.sections.length === 0 ? <p className="p-5 text-sm">Aucune rubrique consultée dans cette période.</p> : null}</div></section>
      </div>
      <p className="text-xs leading-6 text-emerald-950/65">Statistiques disponibles depuis {data.since ? new Date(`${data.since}T12:00:00Z`).toLocaleDateString("fr-FR") : "la première visite consentie à venir"}. Le comptage concerne les visiteurs ayant accepté la mesure ; il peut être réduit par le refus, les bloqueurs ou l’effacement des données du navigateur. Un visiteur désigne un navigateur, pas une personne certaine. Les visites de l’administration et les robots identifiables sont exclus.</p>
    </> : null}
  </div>;
}
