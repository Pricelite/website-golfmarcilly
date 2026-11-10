"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { associationCalendarStartsOn, type AssociationEvent } from "@/data/association-events";
import { eventsInMonth, eventsOnDay, formatCalendarDate, monthDays } from "@/lib/association-calendar";
import { EventEditor } from "./event-editor";
import { AdminDialog } from "./dialog";

export const calendarButton = "inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-950/20 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, month, 1))));
const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
function subscribeMobile(change: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
function mobileSnapshot() { return window.matchMedia("(max-width: 767px)").matches; }
function desktopSnapshot() { return false; }
export function eventLabel(event: AssociationEvent) {
  if (event.category === "holiday") return "Jour férié";
  if (event.category === "vacation") return "Vacances scolaires";
  if (event.category === "celebration") return "Fête / repère";
  if (event.category === "open_slot" || event.title === "Créneau à définir") return "Créneau libre";
  return event.status === "private" ? "Épreuve privée" : event.status === "provisional" ? "En option" : event.status === "unconfirmed" ? "À confirmer" : event.status === "confirmed" ? "Confirmée" : "Au programme";
}
function eventColor(event: AssociationEvent) {
  if (["holiday", "vacation", "celebration"].includes(event.category ?? "")) return "border-stone-300 bg-stone-100 text-stone-700";
  if (event.status === "confirmed") return "border-emerald-300 bg-emerald-100 text-emerald-950";
  if (event.status === "provisional") return "border-amber-300 bg-amber-100 text-amber-950";
  return "border-sky-200 bg-sky-50 text-sky-950";
}

export function CompetitionManager({ initialEvents, initialDate, localMode = false }: { initialEvents: AssociationEvent[]; initialDate: string; localMode?: boolean }) {
  const [events, setEvents] = useState(initialEvents);
  const [month, setMonth] = useState(initialDate.slice(0, 7));
  const [view, setView] = useState<"calendar" | "list" | null>(null);
  const mobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, desktopSnapshot);
  const listView = view === "list" || (view === null && mobile);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [editor, setEditor] = useState<{ event: AssociationEvent | null; day: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const [year, monthNumber] = month.split("-").map(Number);
  const monthlyEvents = eventsInMonth(events, year, monthNumber - 1);
  const visible = monthlyEvents.filter(event => event.title.toLocaleLowerCase("fr").includes(filter.trim().toLocaleLowerCase("fr")));
  const days = monthDays(year, monthNumber - 1);
  const monthTitle = `${months[monthNumber - 1]} ${year}`;
  function openEditor(event: AssociationEvent | null, day: string) {
    setError(""); setMessage(""); setEditor({ event, day });
  }
  function moveMonth(offset: number) {
    setMonth(new Date(Date.UTC(year, monthNumber - 1 + offset, 1)).toISOString().slice(0, 7));
  }
  async function request(method: string, payload: unknown) {
    const result = await fetch("/api/admin/competitions", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await result.json().catch(() => null);
    if (!result.ok || !data) throw new Error(data?.error || "L’opération a échoué. Réessayez. Votre saisie est conservée.");
    return data;
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !editor) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    submitting.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const data = await request(editor.event ? "PATCH" : "POST", { ...fields, ...(editor.event ? { id: editor.event.id } : {}) });
      if (!data.event?.id) throw new Error("Enregistrement non confirmé. Rechargez le calendrier avant de réessayer.");
      const saved = data.event as AssociationEvent;
      setEvents(current => [...current.filter(item => item.id !== saved.id), saved]);
      setMonth(saved.start.slice(0, 7)); setFilter(""); setEditor(null);
      setMessage(localMode ? "Date enregistrée dans la prévisualisation locale." : "Date enregistrée. Le calendrier public est à jour.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible. Réessayez. Votre saisie est conservée."); }
    finally { submitting.current = false; setBusy(false); }
  }
  async function remove() {
    if (!editor?.event || submitting.current) return;
    submitting.current = true; setBusy(true); setError(""); setMessage("");
    try {
      await request("DELETE", { id: editor.event.id });
      setEvents(current => current.filter(item => item.id !== editor.event!.id)); setEditor(null);
      setMessage(localMode ? "Date supprimée de la prévisualisation locale." : "Date supprimée du calendrier public.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible. Réessayez."); }
    finally { submitting.current = false; setBusy(false); }
  }
  function calendar(fullscreen: boolean) {
    return <section aria-label="Calendrier mensuel administrable" className="min-w-0 overflow-hidden rounded-3xl border border-emerald-950/15 bg-white">
      <div className={`space-y-3 border-b border-emerald-950/10 p-4 ${fullscreen ? "" : "sm:p-6"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-serif text-3xl capitalize">{monthTitle}</h2><p className="mt-1 text-sm text-emerald-950/65">{monthlyEvents.length} rendez-vous ce mois-ci{filter.trim() ? ` · ${visible.length} résultat${visible.length > 1 ? "s" : ""}` : ""}</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={calendarButton} onClick={() => setExpanded(!fullscreen)}>{fullscreen ? "Réduire le calendrier" : "Agrandir le calendrier"}</button><button type="button" className={`${calendarButton} !bg-emerald-900 text-white`} onClick={() => openEditor(null, month === initialDate.slice(0, 7) ? initialDate : `${month}-01`)}>+ Ajouter une date</button></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Mois précédent" disabled={month <= associationCalendarStartsOn.slice(0, 7)} className={`${calendarButton} !px-3`} onClick={() => moveMonth(-1)}>←</button>
            <button type="button" className={calendarButton} onClick={() => setMonth(initialDate.slice(0, 7))}>Ce mois-ci</button>
            <button type="button" aria-label="Mois suivant" disabled={month >= "2199-12"} className={`${calendarButton} !px-3`} onClick={() => moveMonth(1)}>→</button>
            <label className="text-xs">Mois affiché<input aria-label="Mois affiché" type="month" min="2026-11" max="2199-12" value={month} className="ml-2 min-h-11 max-w-full rounded-xl border border-emerald-950/20 px-3 text-sm" onChange={event => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value) && event.target.value >= "2026-11" && event.target.value <= "2199-12") setMonth(event.target.value); }} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-2">{fullscreen ? <label className="text-xs"><span className="sr-only">Rechercher dans ce mois</span><input type="search" aria-label="Rechercher dans ce mois" placeholder="Rechercher un rendez-vous" className="min-h-11 w-52 rounded-xl border border-emerald-950/20 px-3 text-sm" value={filter} onChange={event => setFilter(event.target.value)} /></label> : null}<div role="group" aria-label="Affichage du calendrier" className="flex gap-2"><button type="button" aria-pressed={!listView} className={`${calendarButton} ${!listView ? "!bg-emerald-50" : ""}`} onClick={() => setView("calendar")}>Vue calendrier</button><button type="button" aria-pressed={listView} className={`${calendarButton} ${listView ? "!bg-emerald-50" : ""}`} onClick={() => setView("list")}>Vue liste</button></div></div>
        </div>
        {!fullscreen ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-xl text-sm leading-6 text-emerald-950/70">Cliquez sur un événement pour le modifier, ou sur le + d’un jour pour ajouter une date. Tous les rendez-vous du mois sont affichés.</p><label className="block w-full text-xs sm:w-60">Rechercher dans ce mois<input type="search" className="mt-1 min-h-11 w-full rounded-xl border border-emerald-950/20 px-3 text-base" value={filter} onChange={event => setFilter(event.target.value)} /></label></div> : null}
        <p className="text-xs leading-6 text-emerald-950/65">Vert : confirmé · Jaune : en option · Bleu : au programme ou à confirmer · Gris : jours fériés, vacances et repères.</p>
        <div role="status" aria-live="polite" className={message ? undefined : "sr-only"}>{message ? <p className="rounded-xl bg-emerald-50 p-3 text-sm">{message}</p> : null}</div>
      </div>
      {listView ? <div className="p-4 sm:p-6"><ul className="space-y-3">{visible.map(event => <li key={event.id}><button type="button" aria-label={`Modifier ${event.title}, ${formatCalendarDate(event.start)}`} onClick={() => openEditor(event, event.start)} className={`w-full rounded-2xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-emerald-700 ${eventColor(event)}`}><span className="block break-words font-semibold">{event.title}</span><span className="mt-1 block text-sm">{formatCalendarDate(event.start)}{event.end ? ` au ${formatCalendarDate(event.end)}` : ""}{event.time ? ` · ${event.time}` : ""}</span><span className="mt-1 block text-xs">{eventLabel(event)}{event.zone && event.zone !== "all" ? ` · Zone ${event.zone}` : ""}</span><span className="mt-3 block text-xs font-semibold underline underline-offset-4">Modifier le rendez-vous →</span></button></li>)}</ul>{!visible.length ? <p className="py-8 text-center text-sm">{filter.trim() ? "Aucun rendez-vous ne correspond à cette recherche dans ce mois." : "Aucun rendez-vous pour ce mois. Vous pouvez ajouter une date."}</p> : null}</div> : <div className="overflow-x-auto" tabIndex={0} aria-label="Grille du mois, défilement horizontal sur petit écran">
        <div role="table" aria-label={monthTitle} className="min-w-[42rem]">
          <div role="row" className="grid grid-cols-7 border-b border-emerald-950/10 bg-stone-50">{weekdays.map(day => <div role="columnheader" key={day} className="py-3 text-center text-xs font-semibold">{day}</div>)}</div>
          {Array.from({ length: days.length / 7 }, (_, week) => <div role="row" key={week} className="grid grid-cols-7">{days.slice(week * 7, week * 7 + 7).map((day, index) => <div role="cell" key={day ?? `empty-${index}`} className={`min-w-0 border-r border-b border-emerald-950/10 p-2 last:border-r-0 ${fullscreen ? "min-h-12" : "min-h-28"} ${day === initialDate ? "bg-emerald-50/70" : day ? "" : "bg-stone-50"}`}>
            {day ? <><div className={`${fullscreen ? "mb-1" : "mb-2"} flex items-center justify-between gap-1`}><time dateTime={day} aria-label={formatCalendarDate(day)} aria-current={day === initialDate ? "date" : undefined} className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${day === initialDate ? "bg-emerald-900 font-bold text-white" : "text-emerald-950/65"}`}>{Number(day.slice(-2))}</time><button type="button" aria-label={`Ajouter un événement le ${formatCalendarDate(day)}`} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-emerald-800 hover:bg-emerald-100 focus-visible:outline-2" onClick={() => openEditor(null, day)}>+</button></div><div className="space-y-1.5">{eventsOnDay(visible, day).map(event => <button type="button" key={event.id} onClick={() => openEditor(event, event.start)} aria-label={`Modifier ${event.title}, ${formatCalendarDate(day)}`} className={`block w-full break-words rounded-lg border px-2 ${fullscreen ? "py-1 text-[11px] leading-4" : "py-2 text-xs leading-5"} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${eventColor(event)}`}><span className="block font-semibold">{event.time ? `${event.time} · ` : ""}{event.title}</span><span className="block text-[10px]">{eventLabel(event)}{event.zone && event.zone !== "all" ? ` · ${event.zone}` : ""}</span></button>)}</div></> : null}
          </div>)}</div>)}
        </div>
      </div>}
    </section>;
  }
  return <div className="mt-6 space-y-5 text-emerald-950">
    {localMode ? <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Prévisualisation locale : les modifications sont enregistrées uniquement sur cet ordinateur. Elles ne sont pas envoyées au site public.</p> : null}
    {!expanded ? calendar(false) : null}
    {expanded ? <AdminDialog label="Calendrier agrandi" wide onClose={() => setExpanded(false)}>{calendar(true)}</AdminDialog> : null}
    {editor ? <EventEditor key={editor.event?.id ?? editor.day} event={editor.event} day={editor.day} localMode={localMode} busy={busy} error={error} onSave={save} onDelete={remove} onClose={() => { if (!submitting.current) { setEditor(null); setError(""); } }} /> : null}
  </div>;
}
