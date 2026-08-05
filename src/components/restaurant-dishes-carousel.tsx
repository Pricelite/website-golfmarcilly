"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const AUTOPLAY_DELAY_MS = 5000;

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
    if (items.length <= 1 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [goToNext, isPaused, items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white/92 shadow-xl shadow-emerald-950/8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
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
                className={`object-cover transition-transform duration-[1400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "scale-100" : "scale-110"
                }`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                src={item.src}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,24,20,0.04),rgba(6,24,20,0.58))]" />
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                aria-hidden={!isActive}
                className={`transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                  isActive
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none absolute inset-x-5 bottom-5 translate-y-4 opacity-0 sm:inset-x-7 sm:bottom-7"
                }`}
                key={item.title}
              >
                <div className="max-w-xl rounded-[24px] border border-white/20 bg-emerald-950/62 p-5 text-stone-50 backdrop-blur-md sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-100/70">
                    Suggestions du moment
                  </p>
                  <h3 className="mt-3 font-serif text-2xl sm:text-3xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-100/78 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 1 ? (
          <>
            <button
              aria-label="Image précédente"
              className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/85 text-xl text-emerald-950 shadow-lg shadow-black/10 transition hover:-translate-y-[calc(50%+2px)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              onClick={goToPrevious}
              type="button"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              aria-label="Image suivante"
              className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/85 text-xl text-emerald-950 shadow-lg shadow-black/10 transition hover:-translate-y-[calc(50%+2px)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              onClick={goToNext}
              type="button"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-emerald-950/8 px-5 py-4">
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-label={`Afficher ${item.title}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive ? "w-10 bg-emerald-950" : "w-2.5 bg-emerald-950/20 hover:bg-emerald-950/35"
                }`}
                key={item.src}
                onClick={() => goToSlide(index)}
                aria-pressed={isActive}
                type="button"
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
