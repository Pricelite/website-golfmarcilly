"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { formatCalendarDate } from "@/lib/association-calendar";

const inputClass = "mt-1 block w-full rounded-xl border border-emerald-950/25 bg-white px-3 py-2 text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700";
const buttonClass = "rounded-full border border-emerald-950/25 px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2";

export function CompetitionManager({ initialEvents, localMode = false }: { initialEvents: AssociationEvent[]; localMode?: boolean }) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<AssociationEvent | null>(null);
  const [deleting, setDeleting] = useState<AssociationEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (deleting) deleteRef.current?.focus();
  }, [deleting]);
  const visible = events.filter(event => event.title.toLocaleLowerCase("fr").includes(filter.toLocaleLowerCase("fr")))
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));

  async function request(method: string, payload: unknown) {
    const result = await fetch("/api/admin/competitions", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || "L’opération a échoué. Réessayez.");
    return data;
  }

  function resetForm() {
    setEditing(null);
    setFormKey(key => key + 1);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await request(editing ? "PATCH" : "POST", { ...fields, ...(editing ? { id: editing.id } : {}) });
      const saved = data.event as AssociationEvent;
      setEvents(current => [...current.filter(item => item.id !== saved.id), saved]);
      setMessage(localMode
        ? editing ? "Date modifiée dans la prévisualisation locale." : "Date ajoutée à la prévisualisation locale."
        : editing ? "Date modifiée. Le calendrier public est à jour." : "Date ajoutée. Le calendrier public est à jour.");
      resetForm();
    } catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await request("DELETE", { id: deleting.id });
      setEvents(current => current.filter(item => item.id !== deleting.id));
      if (editing?.id === deleting.id) resetForm();
      setDeleting(null);
      setMessage(localMode ? "Date supprimée de la prévisualisation locale." : "Date supprimée du calendrier public.");
    } catch (error) { setError(error instanceof Error ? error.message : "Suppression impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-8 space-y-8 text-emerald-950">
      {localMode ? <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Prévisualisation locale : vos modifications sont enregistrées uniquement sur cet ordinateur. Elles sont visibles sur le calendrier public local et ne sont pas envoyées à Supabase.</p> : null}
      <div aria-live="polite" role="status">{message ? <p className="rounded-xl bg-emerald-50 p-4">{message}</p> : null}</div>
      {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p> : null}
      <form key={formKey} ref={formRef} onSubmit={save} className="rounded-3xl border border-emerald-950/15 bg-white p-6">
        <h2 className="font-serif text-2xl">{editing ? "Modifier la date du programme" : "Ajouter une date au programme"}</h2>
        <fieldset disabled={busy || Boolean(deleting)} className="mt-5 grid gap-4 sm:grid-cols-2 disabled:opacity-60">
          <label className="text-sm sm:col-span-2">Nom de l’événement *<input autoComplete="off" className={inputClass} name="title" required maxLength={160} defaultValue={editing?.title ?? ""} /></label>
          <label className="text-sm">Date de début *<input className={inputClass} type="date" name="start" required min="2027-01-01" max="2199-12-31" defaultValue={editing?.start ?? ""} /></label>
          <label className="text-sm">Date de fin (si plusieurs jours)<input className={inputClass} type="date" name="end" min="2027-01-01" max="2199-12-31" defaultValue={editing?.end ?? ""} /></label>
          <label className="text-sm">Horaire (facultatif)<input className={inputClass} type="time" name="time" defaultValue={editing?.time ?? ""} /></label>
          <label className="text-sm">Statut de l’épreuve<select className={inputClass} name="status" defaultValue={editing?.status ?? ""}><option value="">Au programme</option><option value="confirmed">Confirmée</option><option value="unconfirmed">À confirmer</option><option value="provisional">En option</option><option value="private">Épreuve privée</option></select></label>
          <label className="text-sm">Catégorie<select className={inputClass} name="category" defaultValue={editing?.category ?? (editing?.title === "Créneau à définir" ? "open_slot" : "competition")}><option value="competition">Compétition</option><option value="open_slot">Créneau libre</option><option value="holiday">Jour férié</option><option value="vacation">Vacances scolaires</option><option value="celebration">Fête ou autre repère</option></select></label>
          <label className="text-sm">Zone scolaire<select className={inputClass} name="zone" defaultValue={editing?.zone ?? "all"}><option value="all">Toutes les zones</option><option value="A">Zone A</option><option value="B">Zone B</option><option value="C">Zone C</option></select></label>
          <label className="text-sm sm:col-span-2">Description / précisions<textarea className={inputClass} name="note" rows={3} maxLength={2000} defaultValue={editing?.note ?? ""} /></label>
          {localMode ? <label className="text-sm sm:col-span-2">Note de préparation (visible seulement ici)<textarea className={inputClass} name="internalNote" rows={3} maxLength={2000} defaultValue={editing?.internalNote ?? ""} /></label> : null}
          <p className="text-xs leading-6 text-emerald-950/70 sm:col-span-2">* Champs obligatoires. Les précisions sont visibles sur le calendrier public. Une date devient grise après son dernier jour.</p>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className={`${buttonClass} bg-emerald-900 text-white`}>{busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter au calendrier"}</button>
            {editing ? <button type="button" onClick={() => { resetForm(); setError(""); }} className={buttonClass}>Annuler la modification</button> : null}
          </div>
        </fieldset>
      </form>
      <section>
        <h2 className="font-serif text-2xl">Les dates du programme ({events.length})</h2>
        <label className="mt-4 block max-w-md text-sm">Rechercher par nom<input type="search" className={inputClass} value={filter} onChange={event => setFilter(event.target.value)} /></label>
        {deleting ? <div ref={deleteRef} tabIndex={-1} role="alert" className="my-5 scroll-mt-28 rounded-2xl border border-red-200 bg-red-50 p-5 focus:outline-2 focus:outline-red-800">
          <p className="font-semibold">Supprimer « {deleting.title} » du {formatCalendarDate(deleting.start)} ?</p>
          <p className="mt-2 text-sm">Cette action retire définitivement cette date du calendrier.</p>
          <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={remove} className={`${buttonClass} bg-red-800 text-white`}>{busy ? "Suppression…" : "Confirmer la suppression"}</button><button type="button" disabled={busy} onClick={() => setDeleting(null)} className={buttonClass}>Annuler</button></div>
        </div> : null}
        <ul className="mt-5 space-y-3">
          {visible.map(event => <li key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-950/15 bg-white p-4">
            <div className="min-w-0"><h3 className="break-words font-semibold">{event.title}</h3><p className="mt-1 text-sm">{formatCalendarDate(event.start)}{event.end ? ` au ${formatCalendarDate(event.end)}` : ""}{event.time ? ` · ${event.time}` : ""}</p><p className="mt-1 text-xs">{event.category === "holiday" ? "Jour férié" : event.category === "vacation" ? "Vacances scolaires" : event.category === "celebration" ? "Fête / repère" : event.category === "open_slot" ? "Créneau libre" : event.status === "private" ? "Épreuve privée" : event.status === "provisional" ? "En option" : event.status === "unconfirmed" ? "À confirmer" : event.status === "confirmed" ? "Confirmée" : "Au programme"}{event.zone && event.zone !== "all" ? ` · Zone ${event.zone}` : ""}</p>{localMode && event.internalNote ? <p className="mt-2 text-xs text-slate-600">Note interne : {event.internalNote}</p> : null}</div>
            <div className="flex gap-2"><button type="button" disabled={busy || Boolean(deleting)} aria-label={`Modifier ${event.title}`} className={buttonClass} onClick={() => { setEditing(event); setFormKey(key => key + 1); setError(""); setMessage(""); requestAnimationFrame(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({ preventScroll: true }); }); }}>Modifier</button><button type="button" disabled={busy || Boolean(deleting)} aria-label={`Supprimer ${event.title}`} className={`${buttonClass} text-red-800`} onClick={() => { setDeleting(event); setError(""); setMessage(""); }}>Supprimer</button></div>
          </li>)}
        </ul>
        {visible.length === 0 ? <p className="mt-5 text-sm">{events.length ? "Aucune date ne correspond à cette recherche." : "Aucune date. Ajoutez la première avec le formulaire."}</p> : null}
      </section>
    </div>
  );
}
