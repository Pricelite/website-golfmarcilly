import { unstable_cache } from "next/cache";

import { formatDailyMenuDate, parisDateKey, type DailyMenu } from "@/data/daily-menu";
import { getDailyMenu } from "@/lib/restaurant/daily-menu-store";

const categories = [
  { key: "starters", title: "Entrées" },
  { key: "mains", title: "Plats" },
  { key: "desserts", title: "Desserts" },
] as const;

const getPublishedMenu = unstable_cache(
  (date: string) => getDailyMenu(date, { timeoutMs: 4_000 }),
  ["restaurant-daily-menu"],
  { revalidate: 30 },
);

export async function DailyMenuSection() {
  const today = parisDateKey();
  let published: DailyMenu | null = null;
  try { published = await getPublishedMenu(today); }
  catch { /* Le restaurant reste accessible si la carte est indisponible. */ }
  const closedTuesday = !published && new Date(`${today}T12:00:00Z`).getUTCDay() === 2;

  return (
    <section id="carte-du-jour" className="scroll-mt-28 overflow-hidden rounded-[24px] border border-stone-50/25 bg-[#faf8f0] text-emerald-950 shadow-xl shadow-black/15">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-emerald-950/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">La Bergerie au quotidien</p>
          <h2 className="mt-1 font-serif text-3xl">Carte du jour</h2>
        </div>
        <p className="text-xs text-emerald-900/75">{formatDailyMenuDate(today)}</p>
      </div>
      {closedTuesday ? <p className="px-5 py-5 text-sm leading-6 sm:px-6">Le restaurant est fermé le mardi. Le bar reste ouvert.</p> : null}
      {!published && !closedTuesday ? <p className="px-5 py-5 text-sm leading-6 sm:px-6">La carte du jour n’est pas disponible pour le moment. Contactez le restaurant pour connaître les propositions du jour.</p> : null}
      {published ? <div className="divide-y divide-emerald-950/10">
        {categories.map(({ key, title }) => (
          <div key={key} className="px-5 py-3 sm:px-6">
            <h3 className="font-serif text-lg text-emerald-950">{title}</h3>
            <ul className="mt-1 space-y-0.5 text-xs leading-5 text-emerald-950/85 sm:text-sm">
              {published[key].map((choice) => <li key={choice.name} className="flex items-baseline justify-between gap-3 pl-2 before:mr-1 before:text-emerald-700 before:content-['•']"><span className="min-w-0 flex-1">{choice.name}</span><span className="shrink-0 font-semibold tabular-nums">{choice.price}</span></li>)}
            </ul>
          </div>
        ))}
      </div> : null}
    </section>
  );
}
