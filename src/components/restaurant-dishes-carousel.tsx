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
};

export function RestaurantDishesCarousel({
  items,
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
              <Image
                alt={item.alt}
                className="object-contain"
                fill
                sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 104px) * 0.55), 647px"
                src={item.src}
              />
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
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-emerald-950/8 px-5 py-4">
          <button type="button" className="site-button h-11 rounded-full px-3 text-sm" onClick={() => setIsPaused(!isPaused)} aria-label={isPaused ? "Lancer le diaporama" : "Mettre le diaporama en pause"}>{isPaused ? "Lecture" : "Pause"}</button>
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-label={`Afficher ${item.title}`}
                className="site-button group flex h-11 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-emerald-800"
                key={item.src}
                onClick={() => { goToSlide(index); setIsPaused(true); }}
                aria-pressed={isActive}
                type="button"
              ><span aria-hidden="true" className={`h-2 rounded-full group-hover:bg-white ${isActive ? "w-4 bg-emerald-950" : "w-2 bg-emerald-950/45"}`} /></button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
