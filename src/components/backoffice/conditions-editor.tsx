"use client";

import { useState, type FormEvent } from "react";
import type { ConditionState, SiteCondition } from "@/data/site-conditions";

const field = "mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2 text-sm";

export function ConditionsEditor({ initialConditions, initialStates, localMode }: { initialConditions: SiteCondition[]; initialStates: ConditionState[]; localMode: boolean }) {
  const [conditions, setConditions] = useState(initialConditions);
  const [states, setStates] = useState(initialStates);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(payload: unknown, method: "PUT" | "POST") {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/backoffice/site-conditions", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      if (data.condition) setConditions(current => {
        const index = current.findIndex(item => item.id === data.condition.id);
        return index < 0 ? [...current, data.condition] : current.map(item => item.id === data.condition.id ? data.condition : item);
      });
      if (data.state) setStates(current => [...current, data.state]);
      setMessage(localMode ? "Enregistré pour ce worktree local." : "Modification publiée sur l’accueil.");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
      return false;
    } finally { setBusy(false); }
  }

  async function saveCondition(event: FormEvent<HTMLFormElement>, condition: SiteCondition) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const state = states.find(item => item.id === data.get("stateId"));
    if (!state) { setError("Choisissez un état."); return; }
    const reason = data.get("reason");
    await submit({ id: condition.id, stateId: state.id, status: state.status, reason: state.id !== "carotte" && reason === "Carotté" ? "" : reason }, "PUT");
  }

  async function editItem(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    await submit({ ...data, id, kind: "item-update" }, "POST");
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (await submit({ ...data, kind: "item-create" }, "POST")) form.reset();
  }

  async function addState(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (await submit({ ...data, kind: "state" }, "POST")) form.reset();
  }

  return <div className="mt-8 space-y-8">
    {localMode ? <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">Mode local : les modifications sont enregistrées dans ce worktree uniquement. Elles ne changent pas les données du site publié.</p> : null}
    {message ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p> : null}
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    <p className="text-sm leading-6 text-emerald-950/75">Choisissez un état pour chaque espace. Les changements restent visibles jusqu’à la prochaine mise à jour. Une fermeture nécessite une précision affichée sur l’accueil.</p>
    <section aria-labelledby="items-title">
      <h2 id="items-title" className="font-serif text-2xl">Parcours et services</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {conditions.map(condition => {
          const selected = states.find(state => state.label === condition.stateLabel && state.status === condition.status)?.id ??
            (condition.status === "open" && condition.reason === "Carotté" ? "carotte" : condition.status);
          return <div key={`${condition.id}-${condition.updatedAt ?? "empty"}`} className="rounded-2xl border border-emerald-950/15 bg-white p-5">
            <form onSubmit={event => void saveCondition(event, condition)}>
            <h3 className="font-serif text-xl">{condition.label}</h3>
            <p className="mt-1 text-xs text-emerald-900/60">{condition.group === "courses" ? "Parcours et practice" : "Service"} · <a className="underline" href={condition.href} target="_blank" rel="noreferrer">{condition.href}</a></p>
            <label className="mt-4 block text-sm">État
              <select name="stateId" defaultValue={selected} className={field} disabled={busy}>
                {states.map(state => <option key={state.id} value={state.id}>{state.label}</option>)}
              </select>
            </label>
            <label className="mt-3 block text-sm">Motif ou précision visible sur l’accueil
              <input name="reason" defaultValue={condition.reason ?? ""} maxLength={240} className={field} disabled={busy} placeholder="Ex. terrain détrempé, entretien…" />
            </label>
            <button className="site-button mt-4" disabled={busy}>Enregistrer l’état</button>
            </form>
            <form onSubmit={event => void editItem(event, condition.id)} className="mt-5 border-t border-emerald-950/10 pt-4">
              <h4 className="text-sm font-semibold">Fiche et lien</h4>
              <label className="mt-2 block text-sm">Nom affiché<input name="label" required maxLength={100} defaultValue={condition.label} className={field} /></label>
              <label className="mt-2 block text-sm">Rubrique<select name="group" defaultValue={condition.group} className={field}><option value="courses">Parcours et practice</option><option value="services">Services sur place</option></select></label>
              <label className="mt-2 block text-sm">Lien interne<input name="href" required maxLength={200} defaultValue={condition.href} className={field} /></label>
              <button className="mt-3 rounded-full border px-4 py-2 text-sm" disabled={busy}>Enregistrer la fiche</button>
            </form>
          </div>;
        })}
      </div>
    </section>
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={event => void addItem(event)} className="rounded-2xl border bg-white p-5">
        <h2 className="font-serif text-2xl">Ajouter un parcours ou service</h2>
        <p className="mt-2 text-sm text-emerald-900/70">L’identifiant est permanent. Le lien pointe vers une page du site.</p>
        <label className="mt-4 block text-sm">Identifiant<input name="id" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nouveau-parcours" className={field} /></label>
        <label className="mt-3 block text-sm">Nom affiché<input name="label" required maxLength={100} className={field} /></label>
        <label className="mt-3 block text-sm">Rubrique<select name="group" className={field}><option value="courses">Parcours et practice</option><option value="services">Services sur place</option></select></label>
        <label className="mt-3 block text-sm">Lien interne<input name="href" required maxLength={200} defaultValue="/golf" className={field} /></label>
        <button className="site-button mt-4" disabled={busy}>Ajouter</button>
      </form>
      <form onSubmit={event => void addState(event)} className="rounded-2xl border bg-white p-5">
        <h2 className="font-serif text-2xl">Ajouter un état</h2>
        <p className="mt-2 text-sm text-emerald-900/70">Exemple : « Carotté » est un état ouvert avec une information à consulter.</p>
        <label className="mt-4 block text-sm">Identifiant<input name="id" required maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="entretien" className={field} /></label>
        <label className="mt-3 block text-sm">Nom affiché<input name="label" required maxLength={60} className={field} /></label>
        <label className="mt-3 block text-sm">Type<select name="status" className={field}><option value="open">Ouvert avec information</option><option value="closed">Fermé</option><option value="unknown">À confirmer</option></select></label>
        <button className="site-button mt-4" disabled={busy}>Ajouter</button>
      </form>
    </div>
  </div>;
}
