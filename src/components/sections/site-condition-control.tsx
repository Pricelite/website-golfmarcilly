"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { departureStates, type SiteCondition } from "@/data/site-conditions";

const labels = { open: "Ouvert", closed: "Fermé", unknown: "Non confirmé" } as const;
const tones = {
  open: "border-emerald-200 bg-emerald-50 text-emerald-800 before:bg-emerald-600",
  closed: "border-rose-200 bg-rose-50 text-rose-800 before:bg-rose-600",
  unknown: "border-stone-200 bg-stone-50 text-stone-600 before:bg-stone-400",
} as const;

function DepartureIcon({ season }: { season: "winter" | "summer" }) {
  return season === "winter"
    ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" /><path d="m9 5 3-3 3 3m-6 14 3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3" /></svg>
    : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>;
}

export function SiteConditionControl({ condition, label, editable }: { condition: SiteCondition; label: string; editable: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(condition);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setCurrent(condition); }, [condition]);
  const statusLabel = current.stateLabel || (current.status === "open" && current.reason === "Carotté" ? "Carotté" : labels[current.status]);
  const departureSeason = current.id === "departs" && current.stateLabel === departureStates[0].label ? "winter"
    : current.id === "departs" && current.stateLabel === departureStates[1].label ? "summer" : null;
  const statusClass = `inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold ${departureSeason === "winter" ? "border-sky-200 bg-sky-50 text-sky-900" : departureSeason === "summer" ? "border-amber-200 bg-amber-50 text-amber-900" : `before:mr-0.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full ${current.status === "open" && (current.reason || current.stateLabel) ? "border-amber-200 bg-amber-50 text-amber-900 before:bg-amber-500" : tones[current.status]}`}`;

  async function save(status: "open" | "closed" | "unknown", note: string, stateId?: string) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/site-conditions", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, status, stateId, reason: note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setCurrent(data.condition as SiteCondition);
      setEditing(false);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  }

  return <div className="relative shrink-0">
    {editable ? <button type="button" aria-label={`Modifier l’état de ${label} : ${statusLabel}`} aria-expanded={editing}
      className={`${statusClass} transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700`}
      onClick={() => { setEditing(value => !value); setError(""); }}>{departureSeason ? <DepartureIcon season={departureSeason} /> : null}{statusLabel} <span aria-hidden="true" className="ml-1 text-[10px]">▾</span></button> :
      <span className={statusClass}>{departureSeason ? <DepartureIcon season={departureSeason} /> : null}{statusLabel}</span>}
    {editable && editing ? <div role="group" aria-label={`Choisir l’état de ${label}`} onKeyDown={event => { if (event.key === "Escape") setEditing(false); }} className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-emerald-950/15 bg-white p-3 text-emerald-950 shadow-xl">
      <p className="text-xs font-semibold">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {current.id === "departs" ? <>
          <button type="button" disabled={busy} onClick={() => void save("open", "", departureStates[0].id)} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-900 disabled:opacity-50"><DepartureIcon season="winter" />Départ d’hiver</button>
          <button type="button" disabled={busy} onClick={() => void save("open", "", departureStates[1].id)} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50"><DepartureIcon season="summer" />Départ d’été</button>
          <button type="button" disabled={busy} onClick={() => void save("unknown", "")} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50">À confirmer</button>
        </> : <>
          <button type="button" disabled={busy} onClick={() => void save("open", "")} className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900 disabled:opacity-50">Ouvert</button>
          <button type="button" disabled={busy} onClick={() => void save("open", "Carotté")} className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50">Carotté</button>
        </>}
        <button type="button" disabled={busy} onClick={() => void save("closed", "")} className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-900 disabled:opacity-50">Fermé</button>
      </div>
      {error ? <p role="alert" className="mt-3 text-xs text-rose-800">{error}</p> : null}
    </div> : null}
  </div>;
}
