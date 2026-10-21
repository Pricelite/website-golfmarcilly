"use client";

import { useState, type FormEvent } from "react";
import { conditionItems, type ConditionId, type SiteCondition } from "@/data/site-conditions";
import { visibleCondition } from "@/lib/site-conditions";

const selectClass = "mt-2 w-full rounded-xl border border-emerald-950/20 bg-white px-3 py-2 text-sm text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700";

export function SiteConditionsManager({ initialConditions, localMode }: { initialConditions: SiteCondition[]; localMode: boolean }) {
  const [conditions, setConditions] = useState(() => initialConditions.map(condition => visibleCondition(condition)));
  const [busy, setBusy] = useState<ConditionId | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const byId = new Map(conditions.map(condition => [condition.id, condition]));

  async function save(event: FormEvent<HTMLFormElement>, id: ConditionId) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(id); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/site-conditions", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: fields.get("status"), reason: fields.get("reason") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible. Réessayez.");
      setConditions(current => current.map(condition => condition.id === id ? data.condition as SiteCondition : condition));
      setMessage(localMode ? "État enregistré dans la prévisualisation locale." : "État publié sur la page d’accueil.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible. Réessayez."); }
    finally { setBusy(null); }
  }

  return <div className="mt-8">
    {localMode ? <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Prévisualisation locale : les états sont enregistrés sur cet ordinateur et visibles sur l’accueil local. Aucune modification n’est envoyée à Supabase.</p> : null}
    {message ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p> : null}
    {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    <p className="mt-5 text-sm leading-6 text-emerald-950/75">Les équipements sont ouverts par défaut. Vos modifications restent appliquées jusqu’à votre prochaine intervention, même les jours suivants. Pour une fermeture, indiquez le motif visible sur l’accueil, puis repassez l’état à « Ouvert » lors de la réouverture.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {conditionItems.map(item => {
        const current = byId.get(item.id);
        return <form key={`${item.id}-${current?.updatedAt ?? "empty"}`} onSubmit={event => void save(event, item.id)} className="rounded-2xl border border-emerald-950/15 bg-white p-5">
          <h2 className="font-serif text-xl text-emerald-950">{item.label}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-emerald-950">État
              <select name="status" className={selectClass} defaultValue={current?.status ?? "open"} disabled={Boolean(busy)}>
                <option value="unknown">À confirmer</option><option value="open">Ouvert</option><option value="closed">Fermé</option>
              </select>
            </label>
            <label className="text-sm text-emerald-950 sm:col-span-2">Motif ou précision (visible sur l’accueil)
              <input name="reason" className={selectClass} defaultValue={current?.reason ?? ""} maxLength={240} disabled={Boolean(busy)} placeholder="Ex. terrain détrempé, entretien, compétition…" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="submit" disabled={Boolean(busy)} className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2">{busy === item.id ? "Enregistrement…" : "Enregistrer cet état"}</button>
            {current?.updatedAt ? <span className="text-xs text-emerald-950/60">Mis à jour le {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date(current.updatedAt))}</span> : null}
          </div>
        </form>;
      })}
    </div>
  </div>;
}
