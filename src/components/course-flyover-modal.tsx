"use client";

import { useEffect, useRef, useState } from "react";

import { marcillyFlyoverHoles } from "@/data/flyovergreen";

export function CourseFlyoverModal() {
  const [open, setOpen] = useState(false);
  const [selectedHole, setSelectedHole] = useState(1);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hole = marcillyFlyoverHoles[selectedHole - 1];

  function close() {
    setOpen(false);
    setVideoEnabled(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function chooseHole(number: number) {
    setSelectedHole(number);
    setVideoEnabled(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Voir les 18 trous en vidéo
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-emerald-950/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="flyover-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-[#f7f4e9] text-emerald-950 shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex items-start justify-between gap-5 border-b border-emerald-950/10 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Parcours compétitions</p>
                <h2 id="flyover-title" className="mt-1 font-serif text-2xl sm:text-3xl">Les 18 trous vus du ciel</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label="Fermer les vidéos du parcours" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-950/20 text-2xl leading-none hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2">×</button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <div>
                  <div className="aspect-video overflow-hidden rounded-2xl bg-emerald-950 text-white">
                    {videoEnabled ? (
                      <iframe
                        key={hole.embedUrl}
                        src={hole.embedUrl}
                        title={`Survol vidéo du trou ${hole.number} du Golf de Marcilly`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <p className="font-serif text-3xl">Trou {hole.number}</p>
                        <p className="mt-2 text-sm text-stone-200">PAR {hole.par} · HCP {hole.hcp}</p>
                        <p className="mt-5 max-w-md text-xs leading-5 text-stone-300">La vidéo est hébergée par FlyOverGreen. Son affichage établira une connexion avec ce service tiers.</p>
                        <button type="button" onClick={() => setVideoEnabled(true)} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Afficher la vidéo du trou {hole.number}</button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-emerald-950/65">Vidéos fournies par FlyOverGreen.</p>
                </div>

                <div>
                  <p className="text-sm font-semibold">Choisir un trou</p>
                  <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-3" role="list" aria-label="Trous du parcours">
                    {marcillyFlyoverHoles.map((item) => (
                      <button
                        key={item.number}
                        type="button"
                        onClick={() => chooseHole(item.number)}
                        aria-pressed={item.number === selectedHole}
                        className={`min-h-11 rounded-xl border text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${item.number === selectedHole ? "border-emerald-900 bg-emerald-900 text-white" : "border-emerald-950/15 bg-white hover:border-emerald-700"}`}
                      >
                        {item.number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

