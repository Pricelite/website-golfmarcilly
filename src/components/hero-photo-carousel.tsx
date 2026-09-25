"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { heroPhotos } from "@/data/hero-photos";

const SLIDE_DURATION = 8000;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroPhotoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const isPaused = paused ?? reducedMotion;
  const next = (active + 1) % heroPhotos.length;
  const ready = loaded.has(active) && loaded.has(next);

  useEffect(() => {
    if (isPaused || !ready) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(next);
    }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [isPaused, ready, next]);

  return (
    <div role="region" aria-roledescription="carrousel" aria-label="Photos du Golf de Marcilly" className="absolute inset-0 overflow-hidden bg-emerald-950">
      {heroPhotos.map((photo, index) => (
        <div key={photo.src} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} sur ${heroPhotos.length}`} aria-hidden={active !== index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${active === index ? "opacity-100" : "opacity-0"}`}>
          <Image src={photo.src} alt={photo.alt} fill priority={index === 0} sizes="(max-width: 1023px) 100vw, (max-width: 1600px) 50vw, 800px" className="object-cover object-center" onLoad={() => setLoaded(current => new Set(current).add(index))} />
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-emerald-950/90 px-2 text-white shadow-lg">
        <button type="button" aria-label={isPaused ? "Lancer le diaporama" : "Mettre le diaporama en pause"} className="site-button flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setPaused(!isPaused)}>
          <span aria-hidden="true">{isPaused ? "▶" : "Ⅱ"}</span>
        </button>
        {heroPhotos.map((photo, index) => (
          <button key={photo.src} type="button" aria-label={`Afficher la photo ${index + 1} : ${photo.alt}`} aria-pressed={active === index} className="flex h-11 w-9 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => { setActive(index); setPaused(true); }}>
            <span aria-hidden="true" className={`h-2 rounded-full transition-all motion-reduce:transition-none ${active === index ? "w-5 bg-white" : "w-2 bg-white/50"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
