"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomeAd } from "@/data/home-ads";
import styles from "./home-ad-slot.module.css";

const ROTATION_MS = 6_000;

export function HomeAdSlot({ ads, side }: { ads: HomeAd[]; side: "left" | "right" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slideCount = ads.length + 1;
  const activeIndex = index % slideCount;
  const ad = ads[activeIndex] ?? null;
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
    if (ads.length === 0 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % slideCount), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [ads.length, paused, reducedMotion, slideCount]);

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
      {ad.kind ? <Link href="/contact#reservation" className="mt-2 text-center text-xs font-semibold underline underline-offset-2 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Votre annonce ici ?</Link> : null}
    </> : <Link href="/contact#reservation" className={`${styles.invitation} mt-2 flex h-72 flex-col items-center justify-center overflow-hidden rounded-xl border border-emerald-950/10 p-4 text-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 2xl:h-auto 2xl:min-h-0 2xl:flex-1`}>
      <span aria-hidden="true" className={styles.ball} />
      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-100">Votre marque au golf</span>
      <strong className="relative z-10 mt-3 font-serif text-2xl leading-tight">Votre publicité ici</strong>
      <span className="relative z-10 mt-3 text-xs leading-5 text-emerald-50">Touchez les visiteurs du Golf de Marcilly</span>
      <span className="relative z-10 mt-5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-emerald-950">Parlons-en →</span>
    </Link>}
    {ads.length > 0 ? <div className="mt-2 flex items-center justify-center gap-1" role="group" aria-label={`Annonces ${side === "left" ? "à gauche" : "à droite"}`}>
      {ads.map((item, position) => <button key={item.image} type="button" onClick={() => setIndex(position)} aria-label={`Afficher l’annonce ${position + 1} ${side === "left" ? "à gauche" : "à droite"}`} aria-current={position === activeIndex ? "true" : undefined} className={`min-h-9 min-w-9 rounded-full text-xs focus-visible:outline-2 focus-visible:outline-emerald-700 ${position === activeIndex ? "bg-emerald-950 text-white" : "bg-emerald-950/5 hover:bg-emerald-950/10"}`}>{position + 1}</button>)}
      <button type="button" onClick={() => setIndex(ads.length)} aria-label={`Afficher l’invitation publicitaire ${side === "left" ? "à gauche" : "à droite"}`} aria-current={activeIndex === ads.length ? "true" : undefined} className={`min-h-9 rounded-full px-2 text-xs focus-visible:outline-2 focus-visible:outline-emerald-700 ${activeIndex === ads.length ? "bg-emerald-950 text-white" : "bg-emerald-950/5 hover:bg-emerald-950/10"}`}>Pub</button>
      <button type="button" onClick={() => { if (reducedMotion) { setReducedMotion(false); setPaused(false); } else { setPaused(value => !value); } }} aria-label={paused || reducedMotion ? "Relancer les annonces" : "Mettre les annonces en pause"} className="min-h-9 rounded-full px-2 text-xs font-semibold hover:bg-emerald-950/10 focus-visible:outline-2 focus-visible:outline-emerald-700">{paused || reducedMotion ? "Lecture" : "Pause"}</button>
    </div> : null}
  </aside>;
}
