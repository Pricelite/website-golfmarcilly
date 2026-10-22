import Link from "next/link";
import { conditionItems, type SiteCondition } from "@/data/site-conditions";
import { siteConfig } from "@/data/site";
import { parisDateKey, visibleCondition } from "@/lib/site-conditions";
import { SiteConditionControl } from "./site-condition-control";

export function SiteConditions({ conditions, editable, unavailable = false, preview = false }: { conditions: SiteCondition[]; editable: boolean; unavailable?: boolean; preview?: boolean }) {
  const now = new Date();
  const today = parisDateKey(now);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(now);
  const byId = new Map(conditions.map(condition => [condition.id, unavailable ? condition : visibleCondition(condition)]));
  const displayed = conditionItems.map(item => byId.get(item.id) ?? { id: item.id, status: unavailable ? "unknown" as const : "open" as const, reason: null, updatedAt: null });
  const openCount = displayed.filter(condition => condition.status === "open").length;
  const adaptedCount = displayed.filter(condition => condition.status === "open" && condition.reason).length;
  const closedCount = displayed.filter(condition => condition.status === "closed").length;
  const unknownCount = displayed.length - openCount - closedCount;

  function row(item: (typeof conditionItems)[number]) {
    const condition = displayed.find(condition => condition.id === item.id)!;
    return <li key={item.id} className="border-b border-emerald-950/10 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <Link href={item.href} className="min-w-0 text-sm font-semibold leading-6 text-emerald-950 hover:underline focus-visible:underline">{item.label}</Link>
        <SiteConditionControl condition={condition} label={item.label} editable={editable && !unavailable} />
      </div>
      {condition.reason && condition.status !== "unknown" && !(condition.status === "open" && condition.reason === "Carotté") ? <p className="mt-2 text-sm leading-6 text-emerald-950/85">{condition.reason}</p> : null}
    </li>;
  }

  return <section aria-labelledby="conditions-title" className="border-y border-emerald-950/10 bg-[#efeadd]/50 py-6 sm:py-7">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[24px] border border-emerald-950/10 bg-white p-4 shadow-sm shadow-emerald-950/5 sm:px-6 sm:py-5">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <h2 id="conditions-title" className="font-serif text-2xl leading-tight text-emerald-950 sm:text-3xl">Conditions du jour</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm leading-6 text-emerald-950/80">
              <time dateTime={today} className="capitalize">{dateLabel}</time>
            </div>
          </div>
          <p className={`rounded-full border px-3 py-2 text-sm font-semibold ${closedCount || unknownCount ? "border-stone-200 bg-stone-50 text-emerald-950" : adaptedCount ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {openCount === displayed.length ? adaptedCount ? `Tous les espaces ouverts · ${adaptedCount} avec une information à consulter` : "✓ Tous les espaces sont ouverts" : `${openCount} ouverts${closedCount ? ` · ${closedCount} fermé${closedCount > 1 ? "s" : ""}` : ""}${unknownCount ? ` · ${unknownCount} à confirmer` : ""}`}
          </p>
        </header>
        <div className="mt-3 rounded-xl border border-emerald-950/10 bg-[#f7f5ed] px-3 py-2.5 sm:flex sm:items-center sm:gap-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800 sm:mb-0">Horaires du golf</p>
          <dl className="grid gap-x-6 gap-y-1 text-sm leading-6 sm:flex sm:flex-wrap">
            {siteConfig.golfOpeningSchedule.map(slot => <div key={slot.days} className="flex items-baseline justify-between gap-4">
              <dt className="text-emerald-950/80">{slot.days}</dt>
              <dd className="whitespace-nowrap font-semibold tabular-nums text-emerald-950">{slot.hours}</dd>
            </div>)}
          </dl>
        </div>
        {unavailable ? <p role="status" className="mt-3 text-sm text-stone-700">Informations momentanément indisponibles. Contactez l’accueil pour vérifier les conditions.</p> : null}
        <div className="mt-4 grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Parcours et practice</h3>
            <ul className="grid gap-x-5 sm:grid-cols-2">{conditionItems.filter(item => item.group === "courses").map(row)}</ul>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Services sur place</h3>
            <ul>{conditionItems.filter(item => item.group === "services").map(row)}</ul>
          </div>
        </div>
        <footer className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 text-xs leading-5 text-emerald-950/75">
          <p>{preview ? "États de démonstration, non synchronisés en temps réel. " : ""}Les états indiquent les conditions d’accès. Pour le restaurant, consultez les <Link href="/restaurant#horaires-restaurant" className="underline underline-offset-4">horaires de service</Link>.</p>

        </footer>
        {unknownCount ? <p className="mt-3 text-sm leading-6 text-emerald-950/80">Un renseignement ? Appelez le <a className="font-semibold underline underline-offset-2" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p> : null}
      </div>
    </div>
  </section>;
}
