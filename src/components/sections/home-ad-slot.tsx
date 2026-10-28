import Image from "next/image";
import Link from "next/link";
import type { HomeAd } from "@/data/home-ads";

export function HomeAdSlot({ ad, side }: { ad: HomeAd | null; side: "left" | "right" }) {
  const isExample = ad?.kind === "example";
  return <aside aria-label={`Espace publicitaire ${side === "left" ? "gauche" : "droit"}`} className="flex min-h-28 flex-col overflow-hidden rounded-2xl border border-emerald-950/10 bg-white/75 p-3 text-emerald-950 2xl:min-h-[430px]">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-950/60">{isExample ? "Exemple d’annonce" : ad ? "Publicité" : "Espace publicitaire"}</span>
    {ad ? <>
      <Link href={ad.url} target={isExample ? undefined : "_blank"} rel={isExample ? undefined : "noopener noreferrer sponsored"} aria-label={`${isExample ? "Découvrir" : "Publicité"} ${ad.advertiser}${isExample ? "" : " (nouvel onglet)"}`} className="mt-2 flex flex-1 flex-col overflow-hidden rounded-xl border border-emerald-950/10 bg-[#f7f5ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
        <span className="relative block h-28 w-full 2xl:h-auto 2xl:min-h-0 2xl:flex-1"><Image src={ad.image} alt={ad.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1535px) 50vw, 160px" className={isExample ? "object-cover" : "object-contain"} /></span>
        <span className="p-2.5 text-center text-sm font-semibold leading-tight">{ad.advertiser} <span aria-hidden="true">{isExample ? "→" : "↗"}</span></span>
      </Link>
      {isExample ? <Link href="/contact#reservation" className="mt-2 text-center text-xs font-semibold underline underline-offset-2 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Votre annonce ici ?</Link> : null}
    </> : <div className="flex flex-1 flex-col items-center justify-center gap-3 py-3 text-center">
      <p className="font-serif text-lg leading-tight">Votre entreprise ici</p>
      <Link href="/contact#reservation" className="rounded-full border border-emerald-950/20 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Nous contacter</Link>
    </div>}
  </aside>;
}
