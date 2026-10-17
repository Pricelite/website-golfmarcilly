import Link from "next/link";
import { conditionItems, type SiteCondition } from "@/data/site-conditions";
import { siteConfig } from "@/data/site";
import { parisDateKey, visibleCondition } from "@/lib/site-conditions";
import { SiteConditionControl } from "./site-condition-control";

const cardTones = {
  open: "border-emerald-200/70 bg-emerald-50/70",
  closed: "border-rose-200 bg-rose-50",
  unknown: "border-stone-200 bg-stone-50",
};

export function SiteConditions({ conditions, editable, unavailable = false }: { conditions: SiteCondition[]; editable: boolean; unavailable?: boolean }) {
  const now = new Date();
  const today = parisDateKey(now);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(now);
  const byId = new Map(conditions.map(condition => [condition.id, unavailable ? condition : visibleCondition(condition)]));
  const displayed = conditionItems.map(item => byId.get(item.id) ?? { id: item.id, status: unavailable ? "unknown" as const : "open" as const, reason: null, updatedAt: null });
  const openCount = displayed.filter(condition => condition.status === "open").length;
  const closedCount = displayed.filter(condition => condition.status === "closed").length;
  const unknownCount = displayed.length - openCount - closedCount;

  function row(item: (typeof conditionItems)[number]) {
    const condition = displayed.find(condition => condition.id === item.id)!;
    const validUpdate = condition.updatedAt && !Number.isNaN(Date.parse(condition.updatedAt));
    const updateLabel = validUpdate ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date(condition.updatedAt!)) : null;
    return <li key={item.id} className={`rounded-2xl border p-4 ${cardTones[condition.status]}`}>
      <div className="flex items-center justify-between gap-3">
        <Link href={item.href} className="min-w-0 text-sm font-semibold leading-6 text-emerald-950 hover:underline focus-visible:underline">{item.label}</Link>
        <SiteConditionControl condition={condition} label={item.label} editable={editable && !unavailable} />
      </div>
      {condition.reason && condition.status !== "unknown" ? <p className="mt-2 text-sm leading-6 text-emerald-950/85">{condition.reason}</p> : null}
      {updateLabel ? <p className="mt-2 text-xs text-emerald-950/70">Mis à jour le {updateLabel}</p> : null}
    </li>;
  }

  return <section aria-labelledby="conditions-title" className="border-y border-emerald-950/10 bg-[#efeadd]/50 py-8 sm:py-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-emerald-950/10 bg-white p-5 shadow-sm shadow-emerald-950/5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Préparer votre venue</p>
            <h2 id="conditions-title" className="mt-2 font-serif text-3xl text-emerald-950">Conditions du jour</h2>
            <time dateTime={today} className="mt-2 block text-sm capitalize text-emerald-950/75">{dateLabel}</time>
            <p className="mt-3 text-sm leading-6 text-emerald-950"><span className="font-semibold">Ouverture du golf :</span> {siteConfig.golfOpeningHours}.</p>
          </div>
          <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${closedCount || unknownCount ? "border-stone-200 bg-stone-50 text-emerald-950" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {openCount === displayed.length ? "✓ Tous les espaces sont ouverts" : `${openCount} ouverts${closedCount ? ` · ${closedCount} fermé${closedCount > 1 ? "s" : ""}` : ""}${unknownCount ? ` · ${unknownCount} à confirmer` : ""}`}
          </p>
        </div>
        {unavailable ? <p role="status" className="mt-4 text-sm text-stone-700">Informations momentanément indisponibles. Contactez l’accueil pour vérifier les conditions.</p> : null}
        <details open={editable || closedCount > 0 || unknownCount > 0} className="mt-4 border-t border-emerald-950/10 pt-2">
          <summary className="cursor-pointer rounded-lg py-3 text-sm font-semibold text-emerald-800">Détail des parcours et services</summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Parcours et practice</h3><ul className="grid gap-3 sm:grid-cols-2">{conditionItems.filter(item => item.group === "courses").map(row)}</ul></div>
          <div><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Services sur place</h3><ul className="grid gap-3">{conditionItems.filter(item => item.group === "services").map(row)}</ul></div>
        </div>
        <p className="mt-4 text-xs leading-6 text-emerald-950/75">Les états indiquent les conditions d’accès. Pour le restaurant, consultez également les <Link href="/restaurant#horaires-restaurant" className="underline underline-offset-4">horaires de service</Link>.</p>
        </details>
        {unknownCount ? <p className="mt-5 text-sm leading-6 text-emerald-950/80">Un renseignement ? Appelez le <a className="font-semibold underline underline-offset-2" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p> : null}
      </div>
    </div>
  </section>;
}
