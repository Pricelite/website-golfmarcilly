"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { CTAButton } from "@/components/ui/cta-button";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { blackFriday2026ClosesAt, upcomingOfferPosters, type SiteOffer } from "@/data/offers";
import { formatOfferCountdown, getBlackFriday2026Timing } from "@/lib/offer-campaign";

const CLOSE_ANIMATION_MS = 350;

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
  const [now, setNow] = useState(initialNow);
  const closeTimeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const totalOffers = offers.length;
  const offerCount = totalOffers || upcomingOfferPosters.length;
  const hasMultipleOffers = offerCount > 1;
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
    triggerRef.current?.focus();
  }, []);

  const closeModal = useCallback(() => {
    clearCloseTimeout();
    setIsVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      completeClose();
    }, CLOSE_ANIMATION_MS);
  }, [clearCloseTimeout, completeClose]);

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
    if (!showDialog) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
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
  }, [closeModal, showDialog]);

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
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
              {label ? `${label} · ` : ""}{offerCount} {hasMultipleOffers ? "offres" : "offre"} à découvrir
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
          className={`fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 ${
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onMouseDown={handleOverlayMouseDown}
        >
          <div
            onMouseDown={closeModal}
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
            className={`relative max-h-[96dvh] w-full ${hasMultipleOffers ? "max-w-[1440px]" : "max-w-3xl"} overflow-y-auto rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,244,238,0.94))] text-emerald-950 shadow-[0_28px_80px_rgba(6,24,20,0.28)] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "scale-100 opacity-100" : "scale-[0.9] opacity-0"
            }`}
            ref={dialogRef}
            role="dialog"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.18))]" />
            </div>

            <div className="relative z-10 p-4 sm:p-6">
              <div className="sticky top-0 z-20 -mx-4 -mt-4 flex items-start justify-between gap-4 border-b border-emerald-950/10 bg-[#faf8f4]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 md:items-center md:py-3">
                <div className="max-w-2xl flex-1 md:grid md:max-w-none md:grid-cols-[auto_1fr] md:items-center md:gap-x-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">{planLabel} du moment</p>
                    <h2 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl" id={titleId}>
                      {totalOffers ? (hasMultipleOffers ? "Nos offres du moment" : "Notre offre du moment") : "Black Friday 2026"}
                    </h2>
                  </div>
                  <div>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-950/75" id={descriptionId}>
                      {totalOffers ? (hasMultipleOffers ? "Découvrez nos offres exclusives disponibles pour une durée limitée." : "Découvrez notre offre exclusive disponible pour une durée limitée.") : "Découvrez les offres Black Friday de novembre 2026."}
                    </p>
                    {isBlackFridayPreview ? <p className="mt-1 text-sm font-semibold text-emerald-900">Jusqu’au <time dateTime={blackFriday2026ClosesAt}>lundi 30 novembre 2026 à 20 h</time>, heure de Paris.</p> : null}
                  </div>
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

              <div className={`mt-4 grid gap-4 sm:gap-6 ${hasMultipleOffers ? "md:grid-cols-2" : ""}`}>
                {totalOffers > 0 ? offers.map((offer) => (
                  <article key={offer.slug} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-950/15 bg-white">
                    <div className="relative aspect-[4/3] bg-[#f7f5ed]">
                      <Image src={offer.imageSrc} alt={offer.title} fill sizes="(min-width: 768px) 560px, calc(100vw - 64px)" className="object-contain p-4" />
                    </div>
                    <div className="flex flex-1 flex-col items-start p-5 sm:p-6">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{offer.badgeLabel}</span>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">{offer.eyebrow}</p>
                      <h3 className="mt-2 font-serif text-3xl">{offer.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-emerald-950/80">{offer.description}</p>
                      {offer.promoPrice ? <p className="mt-4 flex flex-wrap items-baseline gap-3"><span className="text-3xl font-semibold">{offer.promoPrice}</span>{offer.originalPrice ? <span className="text-emerald-950/65 line-through">{offer.originalPrice}</span> : null}</p> : null}
                      <div className="mt-auto pt-5" onClick={completeClose}><CTAButton href={offer.actionHref}>{offer.actionLabel}</CTAButton></div>
                    </div>
                  </article>
                )) : upcomingOfferPosters.map((poster) => (
                  <article key={poster.src} className="min-w-0 overflow-hidden rounded-2xl border border-emerald-950/15 bg-white">
                    <h3 className="border-b border-emerald-950/10 px-4 py-3 font-serif text-xl sm:text-2xl">{poster.title}</h3>
                    <div className="bg-[#f7f5ed] p-3">
                      <a aria-label={`Agrandir l’affiche ${poster.title} dans un nouvel onglet`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700" href={poster.src} rel="noopener noreferrer" target="_blank">
                        <Image src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} sizes="(min-width: 768px) 560px, calc(100vw - 80px)" className="mx-auto h-auto w-full object-contain shadow-lg md:h-[calc(96dvh-16rem)] md:min-h-64 md:w-auto md:max-w-full" />
                      </a>
                      <p className="mt-2 text-center text-xs text-emerald-950/75">Cliquez sur l’affiche pour l’agrandir.</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
