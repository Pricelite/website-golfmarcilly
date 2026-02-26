"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { toProtectedImageSrc } from "@/lib/protected-image";

export type HomeNewsAsset = {
  title: string;
  src: string;
  icon: "youth" | "initiation" | "rugby";
  iconLabel: string;
};

type HomeNewsGalleryProps = {
  assets: readonly HomeNewsAsset[];
};

type ModalPhase = "opening" | "open" | "closing";

function IconGlyph({ icon }: { icon: HomeNewsAsset["icon"] }) {
  if (icon === "youth") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-16 w-16">
        <path
          d="M12 3.2l2.3 4.6 5.1.7-3.7 3.6.9 5.1L12 14.8l-4.6 2.4.9-5.1L4.6 8.5l5.1-.7L12 3.2z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (icon === "initiation") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-16 w-16">
        <path
          d="M3 7.8L12 4l9 3.8-9 3.8L3 7.8zm3.2 3.6l5.8 2.4 5.8-2.4V16L12 19l-5.8-3v-4.6z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-16 w-16">
      <ellipse cx="12" cy="12" rx="8.5" ry="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 9.3l2.4 2.7-2.4 2.7M17 9.3l-2.4 2.7 2.4 2.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.3 9h3.4m-3.4 6h3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function waitForAnimation(animation: Animation | undefined): Promise<void> {
  if (!animation) {
    return Promise.resolve();
  }

  return animation.finished.then(
    () => undefined,
    () => undefined
  );
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1
  );
}

export default function HomeNewsGallery({ assets }: HomeNewsGalleryProps) {
  const [selectedAsset, setSelectedAsset] = useState<HomeNewsAsset | null>(null);
  const [phase, setPhase] = useState<ModalPhase>("opening");
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [modalRatio, setModalRatio] = useState<number>(3 / 4);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedAsset]);

  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        return;
      }

      const firstFocusable = closeButtonRef.current ?? getFocusableElements(dialogElement)[0];
      firstFocusable?.focus();
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setPhase("closing");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        return;
      }

      const focusables = getFocusableElements(dialogElement);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;
      const isInsideDialog = activeElement
        ? dialogElement.contains(activeElement)
        : false;

      if (event.shiftKey) {
        if (!isInsideDialog || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!isInsideDialog || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedAsset]);

  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    let cancelled = false;
    const preview = new window.Image();
    preview.decoding = "async";
    preview.src = toProtectedImageSrc(selectedAsset.src);
    preview.onload = () => {
      if (cancelled || preview.naturalWidth <= 0 || preview.naturalHeight <= 0) {
        return;
      }
      setModalRatio(preview.naturalWidth / preview.naturalHeight);
    };

    return () => {
      cancelled = true;
    };
  }, [selectedAsset]);

  useLayoutEffect(() => {
    if (!selectedAsset || !originRect) {
      return;
    }

    const dialogElement = dialogRef.current;
    const overlayElement = overlayRef.current;
    if (!dialogElement || !overlayElement) {
      return;
    }

    const finalRect = dialogElement.getBoundingClientRect();
    const deltaX = originRect.left - finalRect.left;
    const deltaY = originRect.top - finalRect.top;
    const scaleX = originRect.width / finalRect.width;
    const scaleY = originRect.height / finalRect.height;

    const timing: KeyframeAnimationOptions = {
      duration: 360,
      easing: "cubic-bezier(0.22, 0.9, 0.32, 1)",
      fill: "forwards",
    };

    if (phase === "opening") {
      const modalAnimation = dialogElement.animate(
        [
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
            borderRadius: "14px",
          },
          { transform: "translate(0px, 0px) scale(1, 1)", borderRadius: "28px" },
        ],
        timing
      );

      const overlayAnimation = overlayElement.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: 260,
          easing: "ease",
          fill: "forwards",
        }
      );

      Promise.all([waitForAnimation(modalAnimation), waitForAnimation(overlayAnimation)]).then(
        () => {
          setPhase("open");
        }
      );
      return;
    }

    if (phase === "closing") {
      const modalAnimation = dialogElement.animate(
        [
          { transform: "translate(0px, 0px) scale(1, 1)", borderRadius: "28px" },
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
            borderRadius: "14px",
          },
        ],
        timing
      );

      const overlayAnimation = overlayElement.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: 220,
          easing: "ease",
          fill: "forwards",
        }
      );

      Promise.all([waitForAnimation(modalAnimation), waitForAnimation(overlayAnimation)]).then(
        () => {
          setSelectedAsset(null);
          setOriginRect(null);
          setModalRatio(3 / 4);
          setPhase("opening");
          lastFocusedRef.current?.focus();
        }
      );
    }
  }, [originRect, phase, selectedAsset]);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>, asset: HomeNewsAsset) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const previewImage = event.currentTarget.parentElement?.querySelector("img");

      if (
        previewImage instanceof HTMLImageElement &&
        previewImage.naturalWidth > 0 &&
        previewImage.naturalHeight > 0
      ) {
        setModalRatio(previewImage.naturalWidth / previewImage.naturalHeight);
      } else {
        setModalRatio(3 / 4);
      }

      lastFocusedRef.current = event.currentTarget;
      setOriginRect(rect);
      setSelectedAsset(asset);
      setPhase("opening");
    },
    []
  );

  const handleClose = useCallback(() => {
    if (!selectedAsset) {
      return;
    }
    setPhase("closing");
  }, [selectedAsset]);

  const safeModalRatio = Number.isFinite(modalRatio) && modalRatio > 0 ? modalRatio : 3 / 4;

  return (
    <>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {assets.map((asset, index) => (
          <article
            key={`${asset.src}-${index}`}
            className="group relative overflow-hidden rounded-xl border border-zinc-900/10 bg-zinc-100/50"
          >
            <p className="px-3 pt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">
              {asset.title}
            </p>
            <div className="relative mt-3 aspect-[3/4] w-full overflow-hidden bg-zinc-50">
              <Image
                src={toProtectedImageSrc(asset.src)}
                alt={asset.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain blur-[2px]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-zinc-600/36 backdrop-blur-[6px]"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={(event) => handleOpen(event, asset)}
                className="absolute left-1/2 top-1/2 z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent text-zinc-100 transition duration-300 hover:scale-110 hover:text-zinc-300 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
                aria-label={`Ouvrir l'affiche ${asset.title}`}
              >
                <IconGlyph icon={asset.icon} />
                <span className="sr-only">{asset.iconLabel}</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedAsset
        ? createPortal(
            <div className="fixed inset-0 z-[120]">
              <button
                type="button"
                aria-label="Fermer l'affiche"
                onClick={handleClose}
                className="absolute inset-0 bg-zinc-950/76"
              />

              <div ref={overlayRef} className="absolute inset-0 opacity-0" />

              <div className="relative z-10 flex min-h-dvh items-center justify-center p-4 sm:p-6">
                <div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Affiche ${selectedAsset.title}`}
                  className="relative overflow-hidden rounded-[28px] border border-zinc-300/80 bg-white shadow-2xl"
                  style={{
                    width: `min(92vw, calc(86dvh * ${safeModalRatio}))`,
                    height: `min(86dvh, calc(92vw / ${safeModalRatio}))`,
                  }}
                >
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={handleClose}
                    className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/95 text-xl font-semibold text-zinc-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                    aria-label="Fermer la modale"
                  >
                    &times;
                  </button>

                  <div className="relative h-full w-full bg-white">
                    <Image
                      src={toProtectedImageSrc(selectedAsset.src)}
                      alt={selectedAsset.title}
                      fill
                      sizes="92vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
