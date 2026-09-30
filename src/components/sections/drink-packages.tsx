import { SectionTitle } from "@/components/ui/section-title";
import { drinkPackages } from "@/data/drink-packages";

export function DrinkPackages() {
  return (
    <section id="forfaits-boissons" className="mt-12 scroll-mt-28">
      <SectionTitle eyebrow="Boissons & petits fours" title="Nos forfaits boissons" description="Trois formules pour votre réception. Les prix sont indiqués par personne." />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {drinkPackages.map(plan => (
          <article key={plan.name} className="overflow-hidden rounded-2xl border border-emerald-950/15 bg-[#faf8f0]">
            <div className="border-b border-emerald-950/15 bg-emerald-950 px-5 py-4 text-stone-50">
              <h3 className="font-serif text-xl">{plan.name}</h3>
              <p className="mt-2"><span className="font-serif text-3xl">{plan.price}</span><span className="ml-2 text-xs text-stone-100/85">/ personne</span></p>
            </div>
            <dl className="divide-y divide-emerald-950/10 px-5">
              {plan.items.map(item => (
                <div key={item.label} className="grid grid-cols-[5rem_1fr] items-start gap-3 py-2.5 text-sm leading-5">
                  <dt className="font-semibold text-emerald-950">{item.label}</dt>
                  <dd className="text-emerald-950/80">{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
