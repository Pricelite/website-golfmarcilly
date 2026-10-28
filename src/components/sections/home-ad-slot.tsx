"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomeAd } from "@/data/home-ads";

const ROTATION_MS = 8_000;

export function HomeAdSlot({ ads, side }: { ads: HomeAd[]; side: "left" | "right" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const ad = ads.length ? ads[index % ads.length] : null;
  const isExample = ad?.kind === "example";
  const isPoster = ad?.kind === "event" || ad?.kind === "house";
  const label = ad?.kind === "event" ? "Événement" : ad?.kind === "house" ? "Actualité du golf" : isExample ? "Exemple d’annonce" : ad ? "Publicité" : "Espace publicitaire";

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (ads.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % ads.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [ads.length, paused, reducedMotion]);

  const creative = ad ? <>
    <span className={`relative block h-72 w-full 2xl:h-auto 2xl:min-h-0 2xl:flex-1 ${isPoster ? "bg-emerald-950/5" : ""}`}>
      <Image src={ad.image} alt={ad.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1535px) 50vw, 192px" className={isExample ? "object-cover" : "object-contain"} />
    </span>
    <span className="p-2.5 text-center text-sm font-semibold leading-tight">{ad.advertiser}{ad.url ? <span aria-hidden="true"> {ad.kind === "event" || !ad.kind ? "↗" : "→"}</span> : null}{ad.caption ? <span className="mt-1 block text-xs font-normal">{ad.caption}</span> : null}</span>
  </> : null;

  return <aside aria-label={`Espace publicitaire ${side === "left" ? "gauche" : "droit"}`} className="flex min-h-28 flex-col overflow-hidden rounded-2xl border border-emerald-950/10 bg-white/75 p-3 text-emerald-950 2xl:min-h-[430px]">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-950/60">{label}</span>
    {ad ? <>
      {ad.url ? <Link href={ad.url} target={ad.kind === "event" || !ad.kind ? "_blank" : undefined} rel={ad.kind === "event" ? "noopener noreferrer" : !ad.kind ? "noopener noreferrer sponsored" : undefined} aria-label={`${ad.advertiser}${ad.kind === "event" || !ad.kind ? " (nouvel onglet)" : ""}`} className="mt-2 flex flex-1 flex-col overflow-hidden rounded-xl border border-emerald-950/10 bg-[#f7f5ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{creative}</Link>
        : <div className="mt-2 flex flex-1 flex-col overflow-hidden rounded-xl border border-emerald-950/10 bg-[#f7f5ed]">{creative}</div>}
      {ads.length > 1 ? <div className="mt-2 flex items-center justify-center gap-1" role="group" aria-label={`Annonces ${side === "left" ? "à gauche" : "à droite"}`}>
        {ads.map((item, position) => <button key={item.image} type="button" onClick={() => setIndex(position)} aria-label={`Afficher l’annonce ${position + 1} ${side === "left" ? "à gauche" : "à droite"}`} aria-current={position === index % ads.length ? "true" : undefined} className={`min-h-9 min-w-9 rounded-full text-xs focus-visible:outline-2 focus-visible:outline-emerald-700 ${position === index % ads.length ? "bg-emerald-950 text-white" : "bg-emerald-950/5 hover:bg-emerald-950/10"}`}>{position + 1}</button>)}
        <button type="button" onClick={() => { if (reducedMotion) { setReducedMotion(false); setPaused(false); } else { setPaused(value => !value); } }} aria-label={paused || reducedMotion ? "Relancer les annonces" : "Mettre les annonces en pause"} className="min-h-9 rounded-full px-2 text-xs font-semibold hover:bg-emerald-950/10 focus-visible:outline-2 focus-visible:outline-emerald-700">{paused || reducedMotion ? "Lecture" : "Pause"}</button>
      </div> : null}
      {ad.kind ? <Link href="/contact#reservation" className="mt-2 text-center text-xs font-semibold underline underline-offset-2 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Votre annonce ici ?</Link> : null}
    </> : <div className="flex flex-1 flex-col items-center justify-center gap-3 py-3 text-center">
      <p className="font-serif text-lg leading-tight">Votre entreprise ici</p>
      <Link href="/contact#reservation" className="rounded-full border border-emerald-950/20 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Nous contacter</Link>
    </div>}
  </aside>;
}
