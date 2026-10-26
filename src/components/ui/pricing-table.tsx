import type { PricingSection } from "@/data/pricing";
import { CTAButton } from "@/components/ui/cta-button";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";

export function PricingTable({ section, id }: { section: PricingSection; id?: string }) {
  return (
    <section id={id ?? section.id} className="scroll-mt-28 overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <div className="border-b border-emerald-950/8 bg-stone-50/80 px-6 py-5">
        <h2 className="font-serif text-2xl text-emerald-950">{section.title}</h2>
        <p className="mt-2 text-sm text-emerald-950/70">{section.description}</p>
      </div>
      {section.title === "Découverte" ? <div className="divide-y divide-emerald-950/15 px-5 sm:hidden">{section.rows.map(row => <article key={row.label} className="py-5"><h3 className="font-serif text-xl">{row.label}</h3><p className="mt-2 text-xl font-semibold">{nonbreakingEuro(row.values[1])} <span className="text-sm font-normal">/ personne</span></p>{row.note ? <p className="mt-2 text-sm font-semibold text-emerald-800">{nonbreakingEuro(row.note)}</p> : null}<p className="my-3 text-sm leading-6">{nonbreakingEuro(row.values[0])}</p><CTAButton href="/initiation/reservation">Choisir une initiation</CTAButton></article>)}</div> : null}
      <div className={section.title === "Découverte" ? "hidden overflow-x-auto sm:block" : "overflow-x-auto"}>
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">{section.title} — tarifs 2026</caption>
          <thead className="bg-emerald-950 text-stone-50">
            <tr>
              <th scope="col" className="px-3 py-4 font-medium sm:px-6">Offre</th>
              <th scope="col" className="px-3 py-4 font-medium sm:px-6">{section.columns[0]}</th>
              <th scope="col" className="px-3 py-4 font-medium sm:px-6">{section.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr
                className="border-b border-emerald-950/8 align-top last:border-b-0"
                key={row.label}
              >
                <th scope="row" className="px-3 py-4 font-medium text-emerald-950 sm:px-6">
                  <div>{row.label}</div>
                  {row.note ? (
                    <div className="mt-1 text-xs font-normal text-emerald-950/65">
                      {nonbreakingEuro(row.note)}
                    </div>
                  ) : null}
                </th>
                <td className="px-3 py-4 text-emerald-950/85 sm:px-6">{nonbreakingEuro(row.values[0])}</td>
                <td className="px-3 py-4 text-emerald-950/85 sm:px-6">{nonbreakingEuro(row.values[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.cta ? <div className="border-t border-emerald-950/10 px-5 py-5"><CTAButton href={section.cta.href}>{section.cta.label}</CTAButton></div> : null}
      {section.footnotes?.length ? (
        <div className="border-t border-emerald-950/8 bg-stone-50/70 px-6 py-4">
          <ul className="space-y-1 text-xs text-emerald-950/68">
            {section.footnotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
