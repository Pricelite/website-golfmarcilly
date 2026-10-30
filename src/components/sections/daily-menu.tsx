import { unstable_cache } from "next/cache";

import { dailyMenuExample, dailyMenuExampleDate, formatDailyMenuDate, parisDateKey, sortDailyMenuChoices, type DailyMenu } from "@/data/daily-menu";
import { getLatestDailyMenu } from "@/lib/restaurant/daily-menu-store";
import { DailyMenuVisibility } from "@/components/sections/daily-menu-visibility";
import { WeekdaySpecialVisibility } from "@/components/sections/weekday-special-visibility";
import { siteConfig } from "@/data/site";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";
import { scopedContentSyncEnabled, sharedContentSyncEnabled } from "@/lib/supabase/content-config";

const categories = [
  { key: "starters", title: "Entrées" },
  { key: "mains", title: "Plats" },
  { key: "desserts", title: "Desserts" },
] as const;

const menuSource = scopedContentSyncEnabled()
  ? siteConfig.url
  : sharedContentSyncEnabled()
  ? process.env.CONTENT_SUPABASE_URL?.trim()
  : process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const getPublishedMenu = unstable_cache(
  (date: string) => getLatestDailyMenu(date, { timeoutMs: 4_000 }),
  ["restaurant-daily-menu", menuSource ?? "unconfigured"],
  { revalidate: 30 },
);

export async function DailyMenuSection() {
  const today = parisDateKey();
  let published: DailyMenu | null = null;
  let unavailable = false;
  try { published = process.env.PREVIEW_MODE === "true" ? { date: dailyMenuExampleDate, ...dailyMenuExample } : await getPublishedMenu(today); }
  catch { unavailable = true; }
  const special = published?.mains.find((choice) => choice.dailySpecial);
  return (
    <section id="carte-du-jour" className="scroll-mt-28 overflow-hidden rounded-[24px] border border-stone-50/25 bg-[#faf8f0] text-emerald-950 shadow-xl shadow-black/15">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-emerald-950/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">La Bergerie au quotidien</p>
          <h2 className="mt-1 font-serif text-3xl">Carte du jour</h2>
        </div>
        {published && <time dateTime={published.date} className="text-xs text-emerald-900/85">Carte publiée le {formatDailyMenuDate(published.date)}</time>}
      </div>
      {published && special ? <WeekdaySpecialVisibility menuDate={published.date}>
        <div className="mx-5 mt-4 rounded-xl border-2 border-white/35 bg-[#173a2e] p-4 text-center text-stone-50 shadow-inner sm:mx-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#dbe9b4]">L’ardoise · Plat du jour</p>
          <p className="mt-2 font-serif text-xl leading-snug">{special.name}</p>
          <p className="mt-2 text-lg font-semibold tabular-nums">{nonbreakingEuro(special.price)}</p>
        </div>
      </WeekdaySpecialVisibility> : null}
      {unavailable || !published ? <div role="status" className="px-5 py-4 text-sm leading-6 sm:px-6">
        <p>{unavailable ? "La carte est momentanément indisponible." : "Aucune carte n’est publiée pour le moment."} Appelez La Bergerie pour connaître les plats proposés.</p>
        <a href={`tel:${siteConfig.phoneHref}`} className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{siteConfig.phoneDisplay}</a>
      </div> : <>
      <p className="px-5 pt-4 text-sm leading-6 sm:px-6">Notre carte reste valable jusqu’à sa prochaine mise à jour. Les plats sont proposés selon disponibilité.</p>
      <DailyMenuVisibility>
        <div className="divide-y divide-emerald-950/10">
          {categories.map(({ key, title }) => (
            <div key={key} className="px-5 py-3 sm:px-6">
              <h3 className="font-serif text-lg text-emerald-950">{title}</h3>
              <ul className="mt-1 space-y-0.5 text-xs leading-5 text-emerald-950/85 sm:text-sm">
                {sortDailyMenuChoices(published[key]).map((choice) => <li key={choice.name} className="flex items-baseline justify-between gap-3 pl-2 before:mr-1 before:text-emerald-700 before:content-['•']"><span className="min-w-0 flex-1 break-words">{choice.name}</span><span className="shrink-0 font-semibold tabular-nums">{nonbreakingEuro(choice.price)}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </DailyMenuVisibility>
      </>}
    </section>
  );
}
