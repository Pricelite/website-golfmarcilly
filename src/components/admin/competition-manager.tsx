"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { formatCalendarDate } from "@/lib/association-calendar";

const inputClass = "mt-1 block w-full rounded-xl border border-emerald-950/25 bg-white px-3 py-2 text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700";
const buttonClass = "rounded-full border border-emerald-950/25 px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2";

export function CompetitionManager({ initialEvents }: { initialEvents: AssociationEvent[] }) {
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
      setMessage(editing ? "Compétition modifiée. Le calendrier public est à jour." : "Compétition ajoutée. Le calendrier public est à jour.");
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
      setMessage("Compétition supprimée du calendrier public.");
    } catch (error) { setError(error instanceof Error ? error.message : "Suppression impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-8 space-y-8 text-emerald-950">
      <div aria-live="polite" role="status">{message ? <p className="rounded-xl bg-emerald-50 p-4">{message}</p> : null}</div>
      {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p> : null}
      <form key={formKey} ref={formRef} onSubmit={save} className="rounded-3xl border border-emerald-950/15 bg-white p-6">
        <h2 className="font-serif text-2xl">{editing ? "Modifier la compétition" : "Ajouter une compétition"}</h2>
        <fieldset disabled={busy || Boolean(deleting)} className="mt-5 grid gap-4 sm:grid-cols-2 disabled:opacity-60">
          <label className="text-sm sm:col-span-2">Nom de la compétition *<input autoComplete="off" className={inputClass} name="title" required maxLength={160} defaultValue={editing?.title ?? ""} /></label>
          <label className="text-sm">Date de début *<input className={inputClass} type="date" name="start" required min="1900-01-01" max="2199-12-31" defaultValue={editing?.start ?? ""} /></label>
          <label className="text-sm">Date de fin (si plusieurs jours)<input className={inputClass} type="date" name="end" min="1900-01-01" max="2199-12-31" defaultValue={editing?.end ?? ""} /></label>
          <label className="text-sm">Horaire (facultatif)<input className={inputClass} type="time" name="time" defaultValue={editing?.time ?? ""} /></label>
          <label className="text-sm">Statut<select className={inputClass} name="status" defaultValue={editing?.status ?? ""}><option value="">Au programme</option><option value="private">Épreuve privée</option><option value="provisional">En option</option></select></label>
          <label className="text-sm sm:col-span-2">Description / précisions<textarea className={inputClass} name="note" rows={3} maxLength={2000} defaultValue={editing?.note ?? ""} /></label>
          <p className="text-xs leading-6 text-emerald-950/70 sm:col-span-2">* Champs obligatoires. Les précisions et les épreuves privées sont visibles sur le calendrier public. Une compétition devient grise après son dernier jour.</p>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className={`${buttonClass} bg-emerald-900 text-white`}>{busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter au calendrier"}</button>
            {editing ? <button type="button" onClick={() => { resetForm(); setError(""); }} className={buttonClass}>Annuler la modification</button> : null}
          </div>
        </fieldset>
      </form>
      <section>
        <h2 className="font-serif text-2xl">Les compétitions ({events.length})</h2>
        <label className="mt-4 block max-w-md text-sm">Rechercher par nom<input type="search" className={inputClass} value={filter} onChange={event => setFilter(event.target.value)} /></label>
        {deleting ? <div ref={deleteRef} tabIndex={-1} role="alert" className="my-5 scroll-mt-28 rounded-2xl border border-red-200 bg-red-50 p-5 focus:outline-2 focus:outline-red-800">
          <p className="font-semibold">Supprimer « {deleting.title} » du {formatCalendarDate(deleting.start)} ?</p>
          <p className="mt-2 text-sm">Cette action retire définitivement la compétition du calendrier.</p>
          <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={remove} className={`${buttonClass} bg-red-800 text-white`}>{busy ? "Suppression…" : "Confirmer la suppression"}</button><button type="button" disabled={busy} onClick={() => setDeleting(null)} className={buttonClass}>Annuler</button></div>
        </div> : null}
        <ul className="mt-5 space-y-3">
          {visible.map(event => <li key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-950/15 bg-white p-4">
            <div className="min-w-0"><h3 className="break-words font-semibold">{event.title}</h3><p className="mt-1 text-sm">{formatCalendarDate(event.start)}{event.end ? ` au ${formatCalendarDate(event.end)}` : ""}{event.time ? ` · ${event.time}` : ""}</p><p className="mt-1 text-xs">{event.status === "private" ? "Épreuve privée" : event.status === "provisional" ? "En option" : "Au programme"}</p></div>
            <div className="flex gap-2"><button type="button" disabled={busy || Boolean(deleting)} aria-label={`Modifier ${event.title}`} className={buttonClass} onClick={() => { setEditing(event); setFormKey(key => key + 1); setError(""); setMessage(""); requestAnimationFrame(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({ preventScroll: true }); }); }}>Modifier</button><button type="button" disabled={busy || Boolean(deleting)} aria-label={`Supprimer ${event.title}`} className={`${buttonClass} text-red-800`} onClick={() => { setDeleting(event); setError(""); setMessage(""); }}>Supprimer</button></div>
          </li>)}
        </ul>
        {visible.length === 0 ? <p className="mt-5 text-sm">{events.length ? "Aucune compétition ne correspond à cette recherche." : "Aucune compétition. Ajoutez la première avec le formulaire."}</p> : null}
      </section>
    </div>
  );
}
