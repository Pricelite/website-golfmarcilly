import Link from "next/link";
import { conditionItems, type SiteCondition } from "@/data/site-conditions";
import { siteConfig } from "@/data/site";
import { parisDateKey, visibleCondition } from "@/lib/site-conditions";
import { SiteConditionControl } from "./site-condition-control";

export function SiteConditions({ conditions, editable, unavailable = false }: { conditions: SiteCondition[]; editable: boolean; unavailable?: boolean }) {
  const now = new Date();
  const today = parisDateKey(now);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris",
  }).format(now);
  const byId = new Map(conditions.map(condition => [condition.id, unavailable ? condition : visibleCondition(condition, now)]));
  const hasUnknownCondition = [...byId.values()].some(condition => condition.status === "unknown");
  const updated = conditions.filter(condition => condition.updatedAt && parisDateKey(new Date(condition.updatedAt)) === today)
    .map(condition => condition.updatedAt!).sort().at(-1);
  const updateLabel = updated ? new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  }).format(new Date(updated)) : null;

  function row(item: (typeof conditionItems)[number]) {
    const condition = byId.get(item.id);
    const status = condition?.status ?? (unavailable ? "unknown" : "open");
    return <li key={item.id} className="border-b border-emerald-950/10 py-1.5">
      <div className="flex items-center justify-between gap-3">
        <Link href={item.href} className="text-sm font-medium leading-5 text-emerald-950 hover:underline focus-visible:underline">{item.label}</Link>
        <SiteConditionControl condition={condition ?? { id: item.id, status, reason: null, updatedAt: null }} label={item.label} editable={editable && !unavailable} />
      </div>
      {condition?.reason && status !== "unknown" ? <p className="mt-1 text-xs leading-5 text-emerald-950/65">{condition.reason}</p> : null}
    </li>;
  }

  return <section aria-labelledby="conditions-title" className="border-y border-emerald-950/10 bg-[#f7f4e9] py-4 sm:py-5">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id="conditions-title" className="font-serif text-2xl text-emerald-950 sm:text-3xl">Conditions du jour</h2>
          <time dateTime={today} className="text-sm capitalize text-emerald-900/65">{dateLabel}</time>
        </div>
        <p className="text-xs text-emerald-900/55">{unavailable ? "Informations momentanément indisponibles" : updateLabel ? `Actualisé à ${updateLabel}` : "Ouvert par défaut aujourd’hui"}</p>
      </div>
      <div className="mt-2.5 grid gap-x-8 gap-y-3 lg:grid-cols-[2fr_1fr]">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Parcours et practice</h3>
          <ul className="mt-0.5 lg:grid lg:grid-cols-2 lg:gap-x-6">{conditionItems.filter(item => item.group === "courses").map(row)}</ul>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Services sur place</h3>
          <ul className="mt-0.5">{conditionItems.filter(item => item.group === "services").map(row)}</ul>
          {hasUnknownCondition ? <p className="mt-3 text-xs leading-5 text-emerald-950/60">État non renseigné ? Vérifiez avant de venir au <a className="font-semibold underline underline-offset-2" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p> : null}
        </div>
      </div>
    </div>
  </section>;
}
