import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";
import type { PricingSection } from "@/data/pricing";

type CourseCardProps = {
  title: string;
  description: string;
  level: string;
  distance: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  showMeta?: boolean;
  sizes?: string;
  pricing?: PricingSection;
};

export function CourseCard({
  title,
  description,
  level,
  distance,
  ctaLabel,
  ctaHref,
  image,
  showMeta = true,
  pricing,
  sizes = "(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 88px) / 2), 596px",
}: CourseCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <div className="relative aspect-[4/3]">
        <Image
          alt={title}
          className="object-cover"
          fill
          sizes={sizes}
          src={image}
        />
      </div>
      <div className="flex h-full flex-col space-y-4 p-6">
        {showMeta ? (
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <span>{level}</span>
            <span aria-hidden="true">•</span>
            <span>{distance}</span>
          </div>
        ) : null}
        <h3 className="font-serif text-2xl text-emerald-950">{title}</h3>
        <p className="flex-1 text-sm leading-7 text-emerald-950/76">
          {description}
        </p>
        {pricing ? (
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-3 sm:p-4">
            <table className="w-full table-fixed text-left text-xs text-emerald-950 sm:text-sm">
              <caption className="pb-3 text-left font-semibold text-emerald-900">Tarifs 2026 · {title}</caption>
              <thead>
                <tr className="border-b border-emerald-900/15">
                  <th scope="col" className="w-[44%] pb-2 pr-2 font-medium">Formule</th>
                  {pricing.columns.map(column => <th key={column} scope="col" className="pb-2 pl-1 text-right font-medium">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {pricing.rows.map(row => (
                  <tr key={row.label} className="border-b border-emerald-900/10 last:border-0">
                    <th scope="row" className="py-3 pr-2 align-top font-normal">
                      {row.label}
                      {row.note ? <span className="mt-1 block text-xs leading-5 text-emerald-950/70">{row.note}</span> : null}
                    </th>
                    {row.values.map((value, index) => <td key={index} className="py-3 pl-1 text-right align-top font-semibold">{value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {pricing.footnotes?.map(note => <p key={note} className="mt-2 text-xs leading-5 text-emerald-950/70">{note}</p>)}
          </div>
        ) : null}
        {ctaLabel && ctaHref ? (
          <CTAButton className="mt-auto" href={ctaHref}>
            {ctaLabel}
          </CTAButton>
        ) : null}
      </div>
    </article>
  );
}
