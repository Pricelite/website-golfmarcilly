import Image from "next/image";
import Link from "next/link";
import type { HomeAd } from "@/data/home-ads";

export function HomeAdSlot({ ad, side }: { ad: HomeAd | null; side: "left" | "right" }) {
  return <aside aria-label={`Espace publicitaire ${side === "left" ? "gauche" : "droit"}`} className="flex min-h-28 flex-col overflow-hidden rounded-2xl border border-emerald-950/10 bg-white/75 p-3 text-emerald-950 2xl:min-h-[430px]">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-950/60">{ad ? "Publicité" : "Espace publicitaire"}</span>
    {ad ? <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Publicité ${ad.advertiser} (nouvel onglet)`} className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
      <span className="relative block min-h-20 w-full flex-1"><Image src={ad.image} alt={ad.imageAlt} fill sizes="160px" className="object-contain" /></span>
      <span className="text-center text-xs font-semibold">{ad.advertiser}</span>
    </a> : <div className="flex flex-1 flex-col items-center justify-center gap-3 py-3 text-center">
      <p className="font-serif text-lg leading-tight">Votre entreprise ici</p>
      <Link href="/contact#reservation" className="rounded-full border border-emerald-950/20 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Nous contacter</Link>
    </div>}
  </aside>;
}
