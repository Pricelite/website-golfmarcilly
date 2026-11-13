import { SectionTitle } from "@/components/ui/section-title";
import { cocktailDinner, cocktailPackages } from "@/data/drink-packages";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";

export function DrinkPackages() {
  return <section id="cocktails" className="mt-12 scroll-mt-28 border-t border-emerald-950/15 pt-9">
    <SectionTitle eyebrow="Pour vos réceptions" title="Cocktails et boissons" description="Des formules pour accueillir vos invités. Les tarifs sont indiqués par personne." />
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cocktailPackages.map(plan => <article key={plan.name} className="rounded-2xl border border-emerald-950/15 bg-[#faf8f0] p-5">
        <div className="flex items-start justify-between gap-3"><h3 className="font-serif text-xl">{plan.name}</h3><p className="shrink-0 font-semibold">{nonbreakingEuro(plan.price)}</p></div>
        <p className="mt-3 text-sm leading-6 text-emerald-950/80">{plan.drinks} · {plan.food}</p>
      </article>)}
    </div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/15 bg-[#faf8f0]">
      <div className="bg-emerald-950 px-6 py-5 text-stone-50"><h3 className="font-serif text-2xl">Cocktail dînatoire</h3><p className="mt-2 text-sm text-stone-100/85">{cocktailDinner.pieces}</p></div>
      <div className="grid gap-4 p-6 md:grid-cols-2">{cocktailDinner.options.map(option => <div key={option.name}><h4 className="font-semibold">{option.name}</h4><p className="mt-1 text-sm leading-6 text-emerald-950/80">{option.description}</p></div>)}</div>
      <div className="overflow-x-auto border-t border-emerald-950/15 px-6 py-5"><table className="w-full min-w-[24rem] text-left text-sm"><caption className="mb-3 text-left font-semibold">Tarifs TTC par personne, selon la taille du groupe</caption><thead><tr className="border-b border-emerald-950/15"><th scope="col" className="py-2">Personnes</th><th scope="col" className="py-2">Classique</th><th scope="col" className="py-2">Prestige</th></tr></thead><tbody>{cocktailDinner.prices.map(row => <tr key={row.guests} className="border-b border-emerald-950/10 last:border-0"><th scope="row" className="py-2 font-medium">{row.guests}</th><td className="py-2">{nonbreakingEuro(row.classique)}</td><td className="py-2">{nonbreakingEuro(row.prestige)}</td></tr>)}</tbody></table></div>
    </div>
  </section>;
}
