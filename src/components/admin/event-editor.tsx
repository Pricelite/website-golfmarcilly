"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { associationCalendarStartsOn, type AssociationEvent } from "@/data/association-events";
import { AdminDialog } from "./dialog";

const inputClass = "mt-1 block min-h-12 w-full rounded-xl border border-emerald-950/25 bg-stone-50 px-3 py-2 text-base text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700";
const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-950/20 px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2";

export function EventEditor({ event: editing, day, localMode, busy, error, onSave, onDelete, onClose }: {
  event: AssociationEvent | null; day: string; localMode: boolean; busy: boolean; error: string;
  onSave: (event: FormEvent<HTMLFormElement>) => Promise<void>; onDelete: () => Promise<void>; onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [gameFormat, setGameFormat] = useState(editing?.gameFormat ?? "");
  const dirty = useRef(false);
  useEffect(() => {
    function preventLoss(event: BeforeUnloadEvent) { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, []);
  function close() { if (!busy) { if (dirty.current) setDiscarding(true); else onClose(); } }
  return <AdminDialog label={editing ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"} onClose={close}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-emerald-700">Calendrier du golf</p><h2 className="mt-2 font-serif text-2xl">{editing ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"}</h2></div><button type="button" disabled={busy} onClick={close} className={buttonClass}>Fermer</button></div>
    {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    {discarding ? <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="text-sm">Fermer sans enregistrer vos modifications ?</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={onClose}>Abandonner les modifications</button><button type="button" className={buttonClass} onClick={() => setDiscarding(false)}>Continuer la saisie</button></div></div> : null}
    <form onSubmit={onSave} onChange={() => { dirty.current = true; }} className="mt-5">
      <fieldset disabled={busy || deleting || discarding} className="grid gap-4 sm:grid-cols-2 disabled:opacity-60">
        <label className="text-sm font-medium sm:col-span-2">Nom de l’événement *<input autoFocus autoComplete="off" className={inputClass} name="title" required maxLength={160} defaultValue={editing?.title ?? ""} /></label>
        <label className="text-sm font-medium">Date de début *<input className={inputClass} type="date" name="start" required min={associationCalendarStartsOn} max="2199-12-31" defaultValue={editing?.start ?? day} /></label>
        <label className="text-sm font-medium">Date de fin (si plusieurs jours)<input className={inputClass} type="date" name="end" min={associationCalendarStartsOn} max="2199-12-31" defaultValue={editing?.end ?? ""} /></label>
        <label className="text-sm font-medium">Horaire (facultatif)<input className={inputClass} type="time" name="time" defaultValue={editing?.time ?? ""} /></label>
        <label className="text-sm font-medium">Statut de l’épreuve<select className={inputClass} name="status" defaultValue={editing?.status ?? ""}><option value="">Au programme</option><option value="confirmed">Confirmée</option><option value="unconfirmed">À confirmer</option><option value="provisional">En option</option><option value="private">Épreuve privée</option></select></label>
        <label className="text-sm font-medium">Catégorie<select className={inputClass} name="category" defaultValue={editing?.category ?? (editing?.title === "Créneau à définir" ? "open_slot" : "competition")}><option value="competition">Compétition</option><option value="open_slot">Créneau libre</option><option value="holiday">Jour férié</option><option value="vacation">Vacances scolaires</option><option value="celebration">Fête ou autre repère</option></select></label>
        <label className="text-sm font-medium">Formule de jeu<select className={inputClass} name="gameFormat" value={gameFormat} onChange={event => setGameFormat(event.target.value)}><option value="">Non précisée</option><option value="score_max">Score max</option><option value="scramble_2">Scramble à 2</option><option value="scramble_4">Scramble à 4</option><option value="other">Autres</option></select></label>
        {gameFormat === "other" ? <label className="text-sm font-medium">Préciser la formule *<input className={inputClass} name="gameFormatDetail" required maxLength={160} defaultValue={editing?.gameFormatDetail ?? ""} /></label> : null}
        <label className="text-sm font-medium">Zone scolaire<select className={inputClass} name="zone" defaultValue={editing?.zone ?? "all"}><option value="all">Toutes les zones</option><option value="A">Zone A</option><option value="B">Zone B</option><option value="C">Zone C</option></select></label>
        <label className="text-sm font-medium sm:col-span-2">Description / précisions<textarea className={inputClass} name="note" rows={3} maxLength={2000} defaultValue={editing?.note ?? ""} /></label>
        {localMode ? <label className="text-sm font-medium sm:col-span-2">Note de préparation (visible seulement ici)<textarea className={inputClass} name="internalNote" rows={3} maxLength={2000} defaultValue={editing?.internalNote ?? ""} /></label> : null}
        <p className="text-xs leading-6 text-emerald-950/65 sm:col-span-2">* Champs obligatoires. Les précisions sont visibles sur le calendrier public. Modifier une animation ne modifie que ce rendez-vous.</p>
        <div className="flex flex-wrap gap-3 border-t border-emerald-950/10 pt-5 sm:col-span-2"><button type="submit" className={`${buttonClass} bg-emerald-900 text-white`}>{busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter au calendrier"}</button><button type="button" onClick={close} className={buttonClass}>Annuler</button></div>
      </fieldset>
    </form>
    {editing ? <div className="mt-6 border-t border-emerald-950/10 pt-4">{deleting ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-semibold">Supprimer définitivement « {editing.title} » ?</p><p className="mt-2 text-sm">Cette action retire ce rendez-vous du calendrier.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={onDelete} className={`${buttonClass} bg-red-800 text-white`}>{busy ? "Suppression…" : "Confirmer la suppression"}</button><button type="button" disabled={busy} onClick={() => setDeleting(false)} className={buttonClass}>Conserver le rendez-vous</button></div></div> : <button type="button" disabled={busy || discarding} className="min-h-11 text-sm font-semibold text-red-800 underline underline-offset-4" onClick={() => setDeleting(true)}>Supprimer ce rendez-vous</button>}</div> : null}
  </AdminDialog>;
}
