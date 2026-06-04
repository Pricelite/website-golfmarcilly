import type { PricingSection } from "@/data/pricing";

export function PricingTable({ section }: { section: PricingSection }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <div className="border-b border-emerald-950/8 bg-stone-50/80 px-6 py-5">
        <h3 className="font-serif text-2xl text-emerald-950">{section.title}</h3>
        <p className="mt-2 text-sm text-emerald-950/70">{section.description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-950 text-stone-50">
            <tr>
              <th className="px-6 py-4 font-medium">Offre</th>
              <th className="px-6 py-4 font-medium">{section.columns[0]}</th>
              <th className="px-6 py-4 font-medium">{section.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr
                className="border-b border-emerald-950/8 align-top last:border-b-0"
                key={row.label}
              >
                <td className="px-6 py-4 font-medium text-emerald-950">
                  <div>{row.label}</div>
                  {row.note ? (
                    <div className="mt-1 text-xs font-normal text-emerald-950/65">
                      {row.note}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-emerald-950/78">{row.values[0]}</td>
                <td className="px-6 py-4 text-emerald-950/78">{row.values[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
