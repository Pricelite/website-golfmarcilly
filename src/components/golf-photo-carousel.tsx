"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import type { GolfPhoto } from "@/data/golf-photos";

const SLIDE_DURATION = 8000;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function GolfPhotoCarousel({ items }: { items: readonly GolfPhoto[] }) {
  const [active, setActive] = useState(0);
  const [requested, setRequested] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [paused, setPaused] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const isPaused = paused ?? reducedMotion;
  const next = (active + 1) % Math.max(1, items.length);
  const ready = loaded.has(active) && loaded.has(next);

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2 || !inView || isPaused || hovered || !ready) return;
    const timer = window.setInterval(() => { if (!document.hidden) setActive(next); }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [items.length, inView, isPaused, hovered, ready, next]);

  useEffect(() => {
    const strip = thumbnails.current;
    const button = strip?.querySelectorAll("button")[active];
    if (!strip || !button) return;
    const bounds = strip.getBoundingClientRect(), selected = button.getBoundingClientRect();
    const distance = selected.left < bounds.left ? selected.left - bounds.left : selected.right > bounds.right ? selected.right - bounds.right : 0;
    if (distance) strip.scrollBy({ left: distance, behavior: reducedMotion ? "instant" : "smooth" });
  }, [active, reducedMotion]);

  function select(index: number) {
    if (!items.length) return;
    const target = (index + items.length) % items.length;
    setPaused(true);
    setPhotoError(false);
    if (loaded.has(target)) { setActive(target); setRequested(null); }
    else setRequested(target);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const current = requested ?? active;
    const target = event.key === "ArrowRight" ? current + 1 : event.key === "ArrowLeft" ? current - 1 : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
    if (target === null) return;
    event.preventDefault();
    select(target);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    touchStart.current = event.pointerType === "touch" && !(event.target as HTMLElement).closest("button, a") ? { x: event.clientX, y: event.clientY } : null;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.25) select((requested ?? active) + (dx < 0 ? 1 : -1));
  }

  const photo = items[active];
  if (!photo) return null;

  return <div ref={root} role="region" aria-roledescription="carrousel" aria-label="Photos des parcours et du practice" tabIndex={0} onKeyDown={handleKeyDown} onFocusCapture={(event) => { if (!(event.target as HTMLElement).closest("[data-carousel-playback]")) setPaused(true); }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="overflow-hidden rounded-[28px] border border-emerald-950/15 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
    <figure>
      <div className="relative aspect-[4/3] max-h-[600px] w-full touch-pan-y overflow-hidden bg-[#edf2e9]" aria-busy={requested !== null} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { touchStart.current = null; }}>
        {items.map((item, index) => <div key={item.src} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} sur ${items.length}`} aria-hidden={active !== index} className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${active === index ? "opacity-100" : "opacity-0"}`}>
          {index === active || index === requested || loaded.has(index) || (inView && !isPaused && !hovered && loaded.has(active) && index === next) ? <Image src={item.src} alt={item.alt} fill sizes="(max-width: 639px) calc(100vw - 32px), 800px" className="object-contain" onLoad={() => { setLoaded(current => new Set(current).add(index)); if (requested === index) { setActive(index); setRequested(null); } }} onError={() => { if (index === active || index === requested) { setPhotoError(true); setRequested(null); } }} /> : null}
        </div>)}
        {items.length > 1 ? <>
          <button type="button" aria-label="Photo précédente du golf" onClick={() => select((requested ?? active) - 1)} className="site-button absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:left-5"><span aria-hidden="true">‹</span></button>
          <button type="button" aria-label="Photo suivante du golf" onClick={() => select((requested ?? active) + 1)} className="site-button absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:right-5"><span aria-hidden="true">›</span></button>
        </> : null}
        {requested !== null ? <p role="status" className="absolute inset-x-16 bottom-4 rounded-full bg-white/95 px-3 py-2 text-center text-sm text-emerald-950">Chargement de la photo…</p> : null}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div aria-live={isPaused ? "polite" : "off"} aria-atomic="true"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-800">Photo {active + 1} sur {items.length}</p><h3 className="mt-1 font-serif text-xl sm:text-2xl">{photo.caption}</h3></div>
        <div className="flex flex-wrap items-center gap-3">
          {items.length > 1 ? <button type="button" data-carousel-playback onClick={() => setPaused(!isPaused)} aria-label={isPaused ? "Lancer le diaporama du golf" : "Mettre le diaporama du golf en pause"} className="min-h-11 rounded-full border border-emerald-950/20 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">{isPaused ? "Lecture" : "Pause"}</button> : null}
          <a href={photo.src} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir la photo « ${photo.caption} » (nouvel onglet)`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">Voir en grand <span aria-hidden="true" className="ml-1">↗</span></a>
        </div>
      </figcaption>
    </figure>
    {photoError ? <p role="status" className="px-5 pb-4 text-sm text-emerald-900">Cette photo ne peut pas être chargée. Essayez une autre image.</p> : null}
    {items.length > 1 ? <div ref={thumbnails} role="group" aria-label="Choisir une photo du golf" className="flex gap-2 overflow-x-auto border-t border-emerald-950/10 px-5 py-3 sm:px-6">
      {items.map((item, index) => <button key={item.src} type="button" aria-label={`Afficher la photo ${index + 1} : ${item.caption}`} aria-pressed={active === index} onClick={() => select(index)} className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 ${active === index ? "border-emerald-800" : "border-transparent opacity-65 hover:opacity-100"}`}><Image src={item.src} alt="" fill sizes="80px" className="object-cover" /></button>)}
    </div> : null}
  </div>;
}
