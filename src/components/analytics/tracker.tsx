"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { needsNewVisit, publicPath, validUuid } from "@/lib/analytics/core";

const CONSENT_KEY = "marcilly_analytics_consent";
const VISITOR_KEY = "marcilly_analytics_visitor";
const VISIT_KEY = "marcilly_analytics_visit";
const VISIT_AT_KEY = "marcilly_analytics_visit_at";
let lastTracked = "";
let lastTrackedAt = 0;

function getConsent(): "yes" | "no" | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "yes" || value === "no" ? value : null;
  } catch { return null; }
}

function subscribeConsent(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === CONSENT_KEY) onChange(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener("analytics-consent-changed", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("analytics-consent-changed", onChange);
  };
}

function serverConsent(): "loading" { return "loading"; }

function track(path: string) {
  try {
    const now = Date.now();
    if (lastTracked === path && now - lastTrackedAt < 1500) return;
    lastTracked = path;
    lastTrackedAt = now;
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!validUuid(visitorId)) { visitorId = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, visitorId); }
    let visitId = localStorage.getItem(VISIT_KEY);
    const previousAt = Number(localStorage.getItem(VISIT_AT_KEY) || 0);
    if (!validUuid(visitId) || needsNewVisit(visitId, previousAt, now)) {
      visitId = crypto.randomUUID();
      localStorage.setItem(VISIT_KEY, visitId);
    }
    localStorage.setItem(VISIT_AT_KEY, String(now));
    void fetch("/api/analytics/page-view", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ eventId: crypto.randomUUID(), visitorId, visitId, path }),
    }).catch(() => {});
  } catch { /* Aucun identifiant si le stockage local est indisponible. */ }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const consent = useSyncExternalStore<"yes" | "no" | "loading" | null>(subscribeConsent, getConsent, serverConsent);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const path = publicPath(pathname);
    if (consent === "yes" && path) track(path);
  }, [consent, pathname]);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("analytics-preferences", show);
    return () => { window.removeEventListener("analytics-preferences", show); };
  }, []);

  function choose(value: "yes" | "no") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      if (value === "no") {
        lastTracked = "";
        localStorage.removeItem(VISITOR_KEY);
        localStorage.removeItem(VISIT_KEY);
        localStorage.removeItem(VISIT_AT_KEY);
      }
    } catch { return; }
    window.dispatchEvent(new Event("analytics-consent-changed"));
    setOpen(false);
  }

  if (consent === "loading" || !publicPath(pathname) || (!open && consent !== null)) return null;
  return <aside aria-label="Choix de mesure d’audience" className="fixed inset-x-4 bottom-24 z-[90] mx-auto max-w-xl rounded-2xl border border-emerald-950/20 bg-white p-5 text-emerald-950 shadow-2xl lg:bottom-5">
    <h2 className="font-serif text-xl">Mesure d’audience</h2>
    <p className="mt-2 text-sm leading-6">Avec votre accord, nous comptons les visites et les pages consultées pour améliorer le site. Un identifiant aléatoire est conservé dans ce navigateur ; aucune adresse IP ni adresse complète avec paramètres n’est enregistrée. Vous pouvez changer ce choix dans le pied de page. <a href="/politique-de-confidentialite" className="underline underline-offset-4">En savoir plus</a>.</p>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => choose("no")} className="rounded-full border border-emerald-950/25 px-4 py-2 text-sm font-semibold">Refuser</button><button type="button" onClick={() => choose("yes")} className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">Accepter</button></div>
  </aside>;
}
