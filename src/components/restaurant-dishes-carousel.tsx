"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const AUTOPLAY_DELAY_MS = 8000;

type RestaurantSlide = {
  src: string;
  alt: string;
  title: string;
  description: string;
};

type RestaurantDishesCarouselProps = {
  items: readonly RestaurantSlide[];
  compact?: boolean;
};

export function RestaurantDishesCarousel({
  items,
  compact = false,
}: RestaurantDishesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (items.length === 0) {
        return;
      }

      setActiveIndex((index + items.length) % items.length);
    },
    [items.length],
  );

  const goToNext = useCallback(() => {
    if (items.length === 0) {
      return;
    }

    setActiveIndex((currentIndex) => (currentIndex + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    if (items.length === 0) {
      return;
    }

    setActiveIndex((currentIndex) => (currentIndex - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || isPaused || isHovered || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [goToNext, isPaused, isHovered, items.length]);

  if (items.length === 0) {
    return null;
  }

  if (compact) {
    const activeItem = items[activeIndex];

    return (
      <div
        aria-label="Aperçu des photos de La Bergerie"
        className="overflow-hidden rounded-2xl border border-white/20 bg-emerald-950/75"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
      >
        <div className="relative h-32 bg-emerald-950 sm:h-36">
          <Image
            alt={activeItem.alt}
            className="object-contain"
            fill
            sizes="(max-width: 640px) calc(100vw - 80px), 380px"
            src={activeItem.src}
          />
          {items.length > 1 ? (
            <>
              <button aria-label="Photo précédente" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-emerald-950/75 text-xl text-white transition hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={goToPrevious} type="button">‹</button>
              <button aria-label="Photo suivante" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-emerald-950/75 text-xl text-white transition hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={goToNext} type="button">›</button>
            </>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-stone-100/90">
          <span className="truncate">{activeItem.title}</span>
          <span className="shrink-0 tabular-nums">{activeIndex + 1} / {items.length}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white/92 shadow-xl shadow-emerald-950/8"
      role="region"
      aria-label="Photos du restaurant La Bergerie"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-all duration-700 motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? "pointer-events-auto translate-x-0 opacity-100"
                  : index < activeIndex
                    ? "pointer-events-none -translate-x-10 opacity-0"
                    : "pointer-events-none translate-x-10 opacity-0"
              }`}
              key={item.src}
            >
              {isActive ? (
                <Image
                  alt={item.alt}
                  className="object-contain"
                  fill
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 104px) * 0.55), 647px"
                  src={item.src}
                />
              ) : null}
            </div>
          );
        })}

        {items.length > 1 ? (
          <>
            <button
              aria-label="Image précédente"
              className="site-button absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-xl shadow-lg shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              onClick={goToPrevious}
              type="button"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              aria-label="Image suivante"
              className="site-button absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-xl shadow-lg shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              onClick={goToNext}
              type="button"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        ) : null}
      </div>


      <div className="px-5 pt-5 sm:px-7">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">La Bergerie en images · {activeIndex + 1} / {items.length}</p>
        <h3 className="mt-2 font-serif text-2xl text-emerald-950">{items[activeIndex].title}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-emerald-950/70">{items[activeIndex].description}</p>
      </div>
      {items.length > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-emerald-950/8 px-5 py-2">
          <button type="button" className="h-11 rounded-full px-2 text-[11px] font-medium text-emerald-950/80 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" onClick={() => setIsPaused(!isPaused)} aria-label={isPaused ? "Lancer le diaporama" : "Mettre le diaporama en pause"}>{isPaused ? "Lecture" : "Pause"}</button>
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-label={`Afficher ${item.title}`}
                className="group flex h-11 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                key={item.src}
                onClick={() => { goToSlide(index); setIsPaused(true); }}
                aria-pressed={isActive}
                type="button"
              ><span aria-hidden="true" className={`h-1.5 rounded-full group-hover:bg-emerald-700 ${isActive ? "w-3 bg-emerald-950" : "w-1.5 bg-emerald-950/40"}`} /></button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
