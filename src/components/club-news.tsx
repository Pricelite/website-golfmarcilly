import Image from "next/image";
import { associationNews } from "@/data/association-news";

export function ClubNews({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const ordered = [...associationNews].sort((a, b) => b.year.localeCompare(a.year));
  const news = ordered.filter(item => item.year === ordered[0]?.year);
  return <div className="mt-8 grid gap-6 md:grid-cols-2">{news.map(item => <article key={item.href} className="overflow-hidden rounded-[28px] border border-emerald-950/15 bg-white">
    <div className="relative aspect-[16/9]"><Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" /></div>
    <div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">{item.category} · {item.year}</p><Heading className="mt-3 font-serif text-2xl">{item.title}</Heading><p className="my-4 text-sm leading-7">{item.summary}</p><a href={item.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Lire sur {item.source} <span className="sr-only">(nouvel onglet)</span> ↗</a></div>
  </article>)}</div>;
}
