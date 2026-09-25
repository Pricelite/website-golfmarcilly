"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { CTAButton } from "@/components/ui/cta-button";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";

import type { SiteOffer } from "@/data/offers";

const AUTOPLAY_DELAY_MS = 5000;
const CLOSE_ANIMATION_MS = 350;
const SWIPE_THRESHOLD_PX = 48;

type PromoOffersModalProps = {
  label: string;
  offers: SiteOffer[];
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);
}

export function PromoOffersModal({ label, offers }: PromoOffersModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const totalOffers = offers.length;

  const particles = useMemo(
    () =>
      [
        "left-[12%] top-[18%] h-24 w-24 animate-[pulse_8s_ease-in-out_infinite]",
        "right-[16%] top-[22%] h-20 w-20 animate-[pulse_9s_ease-in-out_infinite]",
        "bottom-[18%] left-[22%] h-28 w-28 animate-[pulse_10s_ease-in-out_infinite]",
        "bottom-[14%] right-[18%] h-16 w-16 animate-[pulse_7s_ease-in-out_infinite]",
      ] as const,
    [],
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openModal = () => {
    clearCloseTimeout();
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const completeClose = () => {
    setIsMounted(false);
    setIsVisible(false);
    setIsPaused(false);
    triggerRef.current?.focus();
  };

  const closeModal = useCallback(() => {
    clearCloseTimeout();
    setIsVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      completeClose();
    }, CLOSE_ANIMATION_MS);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(() => {
        if (totalOffers === 0) {
          return 0;
        }

        return (index + totalOffers) % totalOffers;
      });
    },
    [totalOffers],
  );

  const goToNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (totalOffers === 0) {
        return 0;
      }

      return (currentIndex + 1) % totalOffers;
    });
  }, [totalOffers]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (totalOffers === 0) {
        return 0;
      }

      return (currentIndex - 1 + totalOffers) % totalOffers;
    });
  }, [totalOffers]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || isPaused || totalOffers <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [goToNext, isMounted, isPaused, totalOffers]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, goToNext, goToPrevious, isMounted, totalOffers]);

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    setTouchStartX(point.clientX);
    setTouchCurrentX(point.clientX);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    setTouchCurrentX(point.clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) {
      setTouchStartX(null);
      setTouchCurrentX(null);
      return;
    }

    const deltaX = touchCurrentX - touchStartX;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-expanded={isMounted}
        className="promo-gold-button relative inline-flex min-h-16 min-w-0 w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-amber-50/70 bg-[linear-gradient(135deg,rgba(255,251,232,0.98),rgba(246,221,142,0.97)_52%,rgba(216,168,66,0.98))] px-2 py-2 text-left text-emerald-950 shadow-lg shadow-emerald-950/15 ring-1 ring-white/35 transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
        onClick={openModal}
        ref={triggerRef}
        type="button"
      >
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.28)_38%,transparent_62%)] opacity-70" />
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-sm font-bold text-amber-100 shadow-md shadow-emerald-950/25">
          %
        </span>
        <span className="relative flex flex-col">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-emerald-950/70">
            Bon plan
          </span>
          <span className="text-xs font-semibold leading-tight">{label}</span>
        </span>
      </button>

      {isMounted ? createPortal(
        <div
          aria-hidden={!isVisible}
          className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 ${
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onMouseDown={handleOverlayMouseDown}
        >
          <div
            className={`absolute inset-0 bg-black/55 backdrop-blur-[10px] transition-opacity duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(221,181,79,0.22),rgba(221,181,79,0.02)_58%,transparent_72%)] blur-3xl" />
          </div>

          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className={`relative max-h-[90dvh] w-[95%] max-w-[900px] overflow-y-auto rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,238,0.94))] text-emerald-950 shadow-[0_28px_80px_rgba(6,24,20,0.28)] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:w-[90%] ${
              isVisible ? "scale-100 opacity-100" : "scale-[0.9] opacity-0"
            }`}
            onMouseEnter={() => setIsPaused(true)}
            onFocusCapture={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            ref={dialogRef}
            role="dialog"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.18))]" />
              {particles.map((particleClassName) => (
                <span
                  className={`absolute rounded-full bg-amber-200/35 blur-3xl ${particleClassName}`}
                  key={particleClassName}
                />
              ))}
            </div>

            <div className="relative z-10 p-5 sm:p-7 lg:p-9">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700/90">
                    Collection exclusive
                  </p>
                  <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl" id={titleId}>
                    ✨ Nos Offres du Moment
                  </h2>
                  <p
                    className="mt-3 max-w-xl text-sm leading-7 text-emerald-950/72 sm:text-base"
                    id={descriptionId}
                  >
                    Découvrez nos offres exclusives disponibles pour une durée limitée.
                  </p>
                </div>

                <button
                  aria-label="Fermer la fenêtre des offres du moment"
                  className="site-button inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl shadow-sm shadow-emerald-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
                  onClick={() => closeModal()}
                  ref={closeButtonRef}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="relative mt-8 overflow-hidden rounded-[22px] border border-emerald-950/8 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                <div className="grid min-h-[31rem] lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[18rem] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(210,177,90,0.22),transparent_44%),linear-gradient(180deg,rgba(17,59,49,0.06),rgba(17,59,49,0.14))]">
                    {offers.map((offer, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <div
                          aria-hidden={!isActive}
                          className={`absolute inset-0 transition-all duration-[650ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                            isActive
                              ? "pointer-events-auto translate-x-0 opacity-100"
                              : index < activeIndex
                                ? "pointer-events-none -translate-x-8 opacity-0"
                                : "pointer-events-none translate-x-8 opacity-0"
                          }`}
                          key={offer.slug}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
                          <div
                            className={`relative h-full w-full transition-transform duration-[1200ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                              isActive ? "scale-100" : "scale-110"
                            }`}
                          >
                            <Image
                              alt={offer.title}
                              className="object-contain object-center p-4 sm:p-6"
                              fill
                              sizes="(max-width: 640px) calc(95vw - 96px), (max-width: 1024px) calc(90vw - 104px), 400px"
                              src={offer.imageSrc}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative flex flex-col justify-between p-5 sm:p-7">
                    <div className="grid min-h-[18rem]">
                      {offers.map((offer, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <div
                            aria-hidden={!isActive}
                            className={`[grid-area:1/1] flex flex-col transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                              isActive
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none translate-y-3 opacity-0"
                            }`}
                            key={offer.slug}
                          >
                            <span className="inline-flex w-fit animate-[pulse_3.8s_ease-in-out_infinite] items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-800">
                              {offer.badgeLabel}
                            </span>
                            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900/52">
                              {offer.eyebrow}
                            </p>
                            <h3 className="mt-3 font-serif text-3xl leading-tight sm:text-[2.35rem]">
                              {offer.title}
                            </h3>
                            <p className="mt-4 max-w-md text-sm leading-7 text-emerald-950/72 sm:text-base">
                              {offer.description}
                            </p>

                            {offer.promoPrice ? (
                              <div className="mt-6 flex flex-wrap items-end gap-3">
                                <span className="text-3xl font-semibold tracking-[-0.03em] text-emerald-950 sm:text-4xl">
                                  {offer.promoPrice}
                                </span>
                                {offer.originalPrice ? (
                                  <span className="pb-1 text-base text-emerald-950/45 line-through">
                                    {offer.originalPrice}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6" onClick={completeClose}>
                      <CTAButton href={offers[activeIndex].actionHref}>
                        {offers[activeIndex].actionLabel}
                      </CTAButton>
                    </div>

                    <div className="mt-8 flex flex-col gap-5 border-t border-emerald-950/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2" role="tablist" aria-label="Sélection des offres">
                        {offers.map((offer, index) => {
                          const isActive = index === activeIndex;

                          return (
                            <button
                              aria-label={`Afficher ${offer.title}`}
                              aria-selected={isActive}
                              className="site-button group flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                              key={offer.slug}
                              onClick={() => goToSlide(index)}
                              role="tab"
                              type="button"
                            >
                              <span aria-hidden="true" className={`h-2.5 rounded-full transition-all duration-300 group-hover:bg-white ${isActive ? "w-6 bg-emerald-950" : "w-2.5 bg-emerald-950/45"}`} />
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          aria-label="Offre précédente"
                          className="site-button inline-flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
                          onClick={() => goToPrevious()}
                          type="button"
                        >
                          <span aria-hidden="true">‹</span>
                        </button>
                        <button
                          aria-label="Offre suivante"
                          className="site-button inline-flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
                          onClick={() => goToNext()}
                          type="button"
                        >
                          <span aria-hidden="true">›</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
