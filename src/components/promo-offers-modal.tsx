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

import { blackFriday2026ClosesAt, upcomingOfferPosters, type SiteOffer } from "@/data/offers";
import { formatOfferCountdown, getBlackFriday2026Timing } from "@/lib/offer-campaign";

const AUTOPLAY_DELAY_MS = 5000;
const CLOSE_ANIMATION_MS = 350;
const SWIPE_THRESHOLD_PX = 48;

type PromoOffersModalProps = {
  initialNow: number;
  label?: string;
  offers: SiteOffer[];
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);
}

export function PromoOffersModal({ initialNow, label, offers }: PromoOffersModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [now, setNow] = useState(initialNow);
  const closeTimeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const totalOffers = offers.length;
  const slideCount = totalOffers || upcomingOfferPosters.length;
  const hasMultipleOffers = slideCount > 1;
  const planLabel = hasMultipleOffers ? "Bons plans" : "Bon plan";
  const offerActionLabel = hasMultipleOffers ? "Voir les offres" : "Voir l’offre";
  const isBlackFridayPreview = totalOffers === 0;
  const campaignTiming = getBlackFriday2026Timing(now);
  const isCampaignExpired = isBlackFridayPreview && campaignTiming.phase === "ended";
  const canOpen = !isBlackFridayPreview || campaignTiming.phase === "active";
  const showDialog = isMounted && !isCampaignExpired;

  useEffect(() => {
    if (!isBlackFridayPreview || isCampaignExpired) return;
    const updateNow = () => setNow(Date.now());
    updateNow();
    const interval = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(interval);
  }, [isBlackFridayPreview, isCampaignExpired]);

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

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openModal = () => {
    if (isBlackFridayPreview && getBlackFriday2026Timing(Date.now()).phase !== "active") return;
    clearCloseTimeout();
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const completeClose = useCallback(() => {
    setIsMounted(false);
    setIsVisible(false);
    setIsPaused(false);
    triggerRef.current?.focus();
  }, []);

  const closeModal = useCallback(() => {
    clearCloseTimeout();
    setIsVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      completeClose();
    }, CLOSE_ANIMATION_MS);
  }, [clearCloseTimeout, completeClose]);

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(() => {
        if (slideCount === 0) {
          return 0;
        }

        return (index + slideCount) % slideCount;
      });
    },
    [slideCount],
  );

  const goToNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (slideCount === 0) {
        return 0;
      }

      return (currentIndex + 1) % slideCount;
    });
  }, [slideCount]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (slideCount === 0) {
        return 0;
      }

      return (currentIndex - 1 + slideCount) % slideCount;
    });
  }, [slideCount]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  useEffect(() => {
    if (!showDialog) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showDialog]);

  useEffect(() => {
    if (!showDialog || isPaused || totalOffers <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [goToNext, showDialog, isPaused, totalOffers]);

  useEffect(() => {
    if (!showDialog) {
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
  }, [closeModal, goToNext, goToPrevious, showDialog, totalOffers]);

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

  if (isCampaignExpired) return null;

  return (
    <>
      <button
        aria-haspopup={canOpen ? "dialog" : undefined}
        aria-expanded={canOpen ? isMounted : undefined}
        aria-disabled={!canOpen}
        aria-label={!canOpen ? `Black Friday 2026 : ouverture le 1er novembre à 9 h, heure de Paris, dans ${formatOfferCountdown(campaignTiming.remainingMs)}` : undefined}
        className={`group relative block w-full overflow-hidden border-y border-amber-400/60 bg-[#f4d77b] text-left text-emerald-950 shadow-[0_4px_16px_rgba(120,80,10,0.08)] focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-emerald-800 ${canOpen ? "transition-colors hover:bg-[#f8df94]" : "cursor-default"}`}
        onClick={openModal}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.5),transparent_65%)]" />
        <span className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-2xl font-bold text-amber-100 sm:h-14 sm:w-14">
            %
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-bold leading-tight sm:text-2xl">
              {planLabel} {canOpen ? "du moment" : "à venir"}
            </span>
            <span className="text-sm leading-snug sm:text-base">
              {label ? `${label} · ` : ""}{slideCount} {hasMultipleOffers ? "offres" : "offre"} à découvrir
            </span>
            {isBlackFridayPreview ? <span className="mt-1 text-sm font-bold leading-snug text-emerald-950">
              {canOpen ? <>Plus que <span className="tabular-nums">{formatOfferCountdown(campaignTiming.remainingMs)}</span> pour profiter {hasMultipleOffers ? "des offres" : "de l’offre"}.</> : <>Ouverture dans <span className="tabular-nums">{formatOfferCountdown(campaignTiming.remainingMs)}</span></>}
            </span> : null}
          </span>
          <span className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-emerald-950 px-6 py-3 text-base font-bold text-white shadow-md transition-colors group-hover:bg-emerald-900 sm:w-auto">
            {canOpen ? offerActionLabel : "Prochainement"} <span aria-hidden="true">→</span>
          </span>
        </span>
      </button>

      {showDialog ? createPortal(
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
            className={`relative max-h-[90dvh] w-[95%] ${totalOffers ? "max-w-[900px]" : "max-w-[620px]"} overflow-y-auto rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,238,0.94))] text-emerald-950 shadow-[0_28px_80px_rgba(6,24,20,0.28)] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:w-[90%] ${
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
                    {planLabel} du moment
                  </p>
                  <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl" id={titleId}>
                    {totalOffers ? (hasMultipleOffers ? "Nos offres du moment" : "Notre offre du moment") : "Black Friday 2026"}
                  </h2>
                  <p
                    className="mt-3 max-w-xl text-sm leading-7 text-emerald-950/72 sm:text-base"
                    id={descriptionId}
                  >
                    {totalOffers ? (hasMultipleOffers ? "Découvrez nos offres exclusives disponibles pour une durée limitée." : "Découvrez notre offre exclusive disponible pour une durée limitée.") : "Découvrez les offres Black Friday de novembre 2026."}
                  </p>
                  {isBlackFridayPreview ? <p className="mt-3 text-sm font-semibold text-emerald-900">Jusqu’au <time dateTime={blackFriday2026ClosesAt}>lundi 30 novembre 2026 à 20 h</time>, heure de Paris.</p> : null}
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

              {totalOffers > 0 ? <div className="relative mt-8 overflow-hidden rounded-[22px] border border-emerald-950/8 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
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
                              className="group flex h-11 w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                              key={offer.slug}
                              onClick={() => goToSlide(index)}
                              role="tab"
                              type="button"
                            >
                              <span aria-hidden="true" className={`h-1.5 rounded-full transition-all duration-300 group-hover:bg-emerald-700 ${isActive ? "w-3 bg-emerald-950" : "w-1.5 bg-emerald-950/40"}`} />
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
              </div> : (
                <div className="mt-6 overflow-hidden rounded-[22px] border border-emerald-950/10 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-950/10 px-4 py-3 sm:px-6">
                    <p aria-live="polite" className="text-sm font-semibold text-emerald-950">
                      {upcomingOfferPosters[activeIndex].title} · {activeIndex + 1} sur {upcomingOfferPosters.length}
                    </p>
                    <div className="flex gap-2">
                      <button aria-label="Visuel précédent" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-950/15 text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={goToPrevious} type="button">‹</button>
                      <button aria-label="Visuel suivant" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-950/15 text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={goToNext} type="button">›</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-[#f7f5ed] px-4 py-4 sm:px-6">
                    <a
                      aria-label={`Agrandir l’affiche ${upcomingOfferPosters[activeIndex].title} dans un nouvel onglet`}
                      className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
                      href={upcomingOfferPosters[activeIndex].src}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Image
                        alt={upcomingOfferPosters[activeIndex].alt}
                        className="h-auto max-h-[min(60dvh,560px)] w-auto max-w-full object-contain shadow-lg"
                        height={upcomingOfferPosters[activeIndex].height}
                        sizes="(max-width: 640px) calc(95vw - 88px), 420px"
                        src={upcomingOfferPosters[activeIndex].src}
                        width={upcomingOfferPosters[activeIndex].width}
                      />
                    </a>
                    <p className="text-center text-xs text-emerald-950/70">Cliquez sur l’affiche pour l’agrandir.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
