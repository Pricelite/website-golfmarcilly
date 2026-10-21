"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteCondition } from "@/data/site-conditions";

const labels = { open: "Ouvert", closed: "Fermé", unknown: "Non confirmé" } as const;
const tones = {
  open: "border-emerald-200 bg-emerald-50 text-emerald-800 before:bg-emerald-600",
  closed: "border-rose-200 bg-rose-50 text-rose-800 before:bg-rose-600",
  unknown: "border-stone-200 bg-stone-50 text-stone-600 before:bg-stone-400",
} as const;

export function SiteConditionControl({ condition, label, editable }: { condition: SiteCondition; label: string; editable: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(condition);
  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setCurrent(condition); }, [condition]);
  const statusClass = `inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full ${tones[current.status]}`;

  async function save(status: "open" | "closed", note: string) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/site-conditions", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, status, reason: note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setCurrent(data.condition as SiteCondition);
      setEditing(false); setClosing(false); setReason("");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  }

  function saveClosure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save("closed", reason);
  }

  return <div className="relative shrink-0">
    {editable ? <button type="button" aria-label={`Modifier l’état de ${label} : ${labels[current.status]}`} aria-expanded={editing}
      className={`${statusClass} transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700`}
      onClick={() => { setEditing(value => !value); setClosing(false); setError(""); }}>{labels[current.status]} <span aria-hidden="true" className="ml-1 text-[10px]">▾</span></button> :
      <span className={statusClass}>{labels[current.status]}</span>}
    {editable && editing ? <div role="group" aria-label={`Choisir l’état de ${label}`} onKeyDown={event => { if (event.key === "Escape") setEditing(false); }} className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-emerald-950/15 bg-white p-3 text-emerald-950 shadow-xl">
      <p className="text-xs font-semibold">{label}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={busy} onClick={() => void save("open", "")} className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900 disabled:opacity-50">Ouvert</button>
        <button type="button" disabled={busy} onClick={() => setClosing(true)} className="rounded-full bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-900 disabled:opacity-50">Fermé</button>
      </div>
      {closing ? <form onSubmit={saveClosure} className="mt-3">
        <label className="block text-xs font-medium">Pourquoi est-ce fermé ?
          <input autoFocus required maxLength={240} value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-950/20 px-2 py-2 text-sm" placeholder="Ex. terrain détrempé" />
        </label>
        <button type="submit" disabled={busy} className="mt-2 rounded-full bg-rose-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer la fermeture"}</button>
      </form> : null}
      {error ? <p role="alert" className="mt-3 text-xs text-rose-800">{error}</p> : null}
    </div> : null}
  </div>;
}
