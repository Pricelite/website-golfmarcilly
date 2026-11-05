"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { calendarDefaultDate, eventsInWeek, eventsOnDay, formatCalendarDate, formatCalendarWeek, isPastEvent, shiftCalendarDate, upcomingCompetitions, weekDays } from "@/lib/association-calendar";
import { siteConfig } from "@/data/site";

const buttonClass = "site-button inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

function isContextEvent(event: AssociationEvent) {
  return event.category === "holiday" || event.category === "vacation" || event.category === "celebration";
}

function eventStyle(event: AssociationEvent, today: string) {
  if (isPastEvent(event, today)) return "border-slate-400 bg-slate-100 text-slate-600";
  if (isContextEvent(event)) return "border-slate-200 bg-slate-50/60 text-slate-600";
  if (event.category === "open_slot" || event.title === "Créneau à définir") return "border-blue-300 bg-blue-100 text-blue-950";
  return event.status === "private" ? "border-stone-400 bg-stone-100 text-stone-700" : event.status === "provisional" ? "border-amber-300 bg-amber-100 text-amber-950" : event.status === "confirmed" ? "border-green-300 bg-green-100 text-green-950" : "border-blue-300 bg-blue-100 text-blue-950";
}

function eventSymbol(event: AssociationEvent) {
  return event.status === "confirmed" ? "✓ " : event.status === "provisional" ? "◌ " : "";
}

function eventStatus(event: AssociationEvent, today: string) {
  const status = event.category === "holiday" ? "Jour férié" : event.category === "vacation" ? "Vacances scolaires" : event.category === "celebration" ? "Fête" : event.category === "open_slot" || event.title === "Créneau à définir" ? "Créneau libre" : event.status === "private" ? "Épreuve privée" : event.status === "unconfirmed" ? "À confirmer" : event.status === "provisional" ? "Option" : event.status === "confirmed" ? "Confirmé" : "Au programme";
  if (isPastEvent(event, today)) {
    return `Date passée · ${status}`;
  }
  return status;
}

function eventZone(event: AssociationEvent) {
  return event.zone && event.zone !== "all" ? ` · Zone ${event.zone}` : "";
}

function currentParisDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function subscribeToDate(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);
  window.addEventListener("focus", callback);
  return () => { window.clearInterval(interval); window.removeEventListener("focus", callback); };
}

function subscribeScreen(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function AssociationCalendar({ initialDate, events: associationEvents }: { initialDate: string; events: AssociationEvent[] }) {
  const today = useSyncExternalStore(subscribeToDate, currentParisDate, () => initialDate);
  const [view, setView] = useState<string | null>(null);
  const weekStart = calendarDefaultDate(view ?? today);
  const days = weekDays(weekStart);
  const mobile = useSyncExternalStore(subscribeScreen, () => window.matchMedia("(max-width: 767px)").matches, () => false);
  const [display, setDisplay] = useState<"list" | "calendar" | null>(null);
  const listView = (display ?? (mobile ? "list" : "calendar")) === "list";
  const [selected, setSelected] = useState<AssociationEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [zone, setZone] = useState<"all" | "A" | "B" | "C">("B");
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) detailRef.current?.focus();
  }, [selected]);

  function changeWeek(date: string | null) {
    setView(date);
    setSelected(null);
    setSelectedDay(null);
  }

  const zoneEvents = associationEvents.filter(event => zone === "all" || !event.zone || event.zone === "all" || event.zone === zone);
  const events = eventsInWeek(zoneEvents, weekStart);
  const weekCompetitions = events.filter(event => !isContextEvent(event)).length;
  const weekMarkers = events.length - weekCompetitions;
  const nextCompetition = upcomingCompetitions(zoneEvents, today)[0];
  const visibleEvents = selectedDay ? eventsOnDay(events, selectedDay) : events;
  const competitions = visibleEvents.filter(event => !isContextEvent(event));
  const markers = visibleEvents.filter(isContextEvent);

  return (
    <>
    <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/15 bg-white text-emerald-950 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          <h3 className="font-serif text-2xl sm:text-3xl">{formatCalendarWeek(weekStart)}</h3>
          <p className="mt-1 text-sm text-emerald-900/70">{weekCompetitions} compétition{weekCompetitions > 1 ? "s" : ""} ou créneau{weekCompetitions > 1 ? "x" : ""} · {weekMarkers} repère{weekMarkers > 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} onClick={() => changeWeek(null)}>Cette semaine</button>
          <button type="button" aria-label="Semaine précédente" className={buttonClass} onClick={() => changeWeek(shiftCalendarDate(weekStart, -7))}>←</button>
          <button type="button" aria-label="Semaine suivante" className={buttonClass} onClick={() => changeWeek(shiftCalendarDate(weekStart, 7))}>→</button>
          <label className="sr-only" htmlFor="as-calendar-date">Choisir une date</label>
          <input id="as-calendar-date" type="date" className="min-h-11 min-w-0 max-w-full rounded-lg border border-emerald-950/20 bg-white px-3 text-sm" value={view ?? today} onChange={event => { if (event.target.value) changeWeek(event.target.value); }} />
          {associationEvents.some(event => event.zone && event.zone !== "all") ? <><label className="sr-only" htmlFor="as-calendar-zone">Choisir une zone scolaire</label><select id="as-calendar-zone" className="min-h-11 rounded-lg border border-emerald-950/20 bg-white px-3 text-sm" value={zone} onChange={event => { setZone(event.target.value as typeof zone); setSelected(null); setSelectedDay(null); }}><option value="all">Toutes les zones</option><option value="A">Zone A</option><option value="B">Zone B</option><option value="C">Zone C</option></select></> : null}
        </div>
      </div>

      <div role="group" aria-label="Affichage du calendrier sportif" className="flex flex-wrap gap-2 px-4 pb-4 sm:px-6">
        <button type="button" aria-pressed={listView} className={buttonClass} onClick={() => { setDisplay("list"); setSelectedDay(null); }}>Vue liste</button>
        <button type="button" aria-pressed={!listView} className={buttonClass} onClick={() => setDisplay("calendar")}>Vue calendrier</button>
      </div>

      <p className="px-4 pb-4 text-xs leading-5 text-slate-600 sm:px-6">
        Bleu : à confirmer ou créneau libre ; jaune : option ; vert : confirmé. Les vacances, fêtes et jours fériés apparaissent en gris clair comme repères.
      </p>
      {events.length === 0 ? <div className="border-t border-emerald-950/10 px-4 py-4 text-sm sm:px-6"><p>Aucune date publiée pour cette semaine.</p>{nextCompetition && nextCompetition.start > days[6] ? <button type="button" className="mt-2 min-h-11 text-left font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => changeWeek(nextCompetition.start)}>Prochaine compétition : {formatCalendarDate(nextCompetition.start)} →</button> : null}</div> : null}
      <div hidden={listView}>
      <div className="grid grid-cols-7 border-y border-emerald-950/10 bg-stone-50 text-center text-xs font-semibold text-emerald-800">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => <div key={day} className="py-3">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-emerald-950/10">
        {days.map(day => {
          const dayEvents = eventsOnDay(events, day);
          const pastDayEvents = dayEvents.length > 0 && dayEvents.every(event => isPastEvent(event, today));
          return (
            <div key={day} className={`min-w-0 ${pastDayEvents ? "bg-slate-100" : "bg-white"} min-h-16 p-1 sm:min-h-20 md:min-h-32 md:p-2`}>
                <button type="button" aria-label={`${formatCalendarDate(day)}, ${dayEvents.length} date${dayEvents.length > 1 ? "s" : ""} au programme`} aria-pressed={selectedDay === day} aria-current={day === today ? "date" : undefined} onClick={() => { setSelectedDay(selectedDay === day ? null : day); setSelected(null); }} className={`site-button mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:mx-0 ${day === today ? "font-bold ring-2 ring-emerald-800" : selectedDay === day ? "font-bold ring-2 ring-amber-500" : ""}`}>
                  {Number(day.slice(-2))}
                </button>
                <span className="mt-1 block text-center text-[10px] text-emerald-900/70 md:text-left">{new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`))}</span>
                <div aria-hidden="true" className="mt-1 flex justify-center gap-1 md:hidden">{dayEvents.length > 0 ? <span className={`h-1.5 w-1.5 rounded-full ${pastDayEvents ? "bg-slate-500" : "bg-emerald-700"}`} /> : null}</div>
                <div className="mt-1 hidden space-y-1 md:block">
                  {dayEvents.map(event => <button key={event.id} type="button" onClick={() => setSelected(event)} className={`block w-full break-words rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${isContextEvent(event) ? "px-1.5 py-1 text-[11px] leading-4 text-slate-500 hover:bg-slate-50" : `border-l-3 px-2 py-1.5 text-xs leading-5 ${eventStyle(event, today)}`}`}>
                    {event.time ? `${event.time} · ` : ""}<span aria-hidden="true">{eventSymbol(event)}</span>{event.title}
                    {isContextEvent(event) ? null : <span className="block text-[11px] font-semibold">{eventStatus(event, today)}{eventZone(event)}</span>}
                  </button>)}
                </div>
            </div>
          );
        })}
      </div>

      </div>
      {selected ? <div ref={detailRef} tabIndex={-1} role="region" aria-label="Détails de la date" className="m-4 scroll-mt-28 rounded-xl border border-emerald-800/20 bg-[#f7f4e9] p-5 focus:outline-2 focus:outline-emerald-700 sm:m-6">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">{eventStatus(selected, today)}{eventZone(selected)}</p><h4 className="mt-2 font-serif text-2xl">{selected.title}</h4></div>
          <button className={buttonClass} type="button" onClick={() => setSelected(null)}>Fermer</button>
        </div>
        <p className="mt-3 text-sm">{formatCalendarDate(selected.start)}{selected.end ? ` au ${formatCalendarDate(selected.end)}` : ""}</p>
        {selected.category === "holiday" || selected.category === "vacation" || selected.category === "celebration" ? null : <p className="mt-2 text-sm">{selected.time ? `À partir de ${selected.time.replace(":", " h ")}` : "Horaire à préciser auprès de l’accueil."}</p>}
        {selected.note ? <p className="mt-2 text-sm leading-6">{selected.note}</p> : null}
        <a className="mt-4 inline-block text-sm font-semibold underline underline-offset-4" href={`tel:${siteConfig.phoneHref}`}>Renseignements : {siteConfig.phoneDisplay}</a>
      </div> : null}

      {(listView || selectedDay) ? <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-serif text-xl">{selectedDay ? `Le ${formatCalendarDate(selectedDay)}` : "Compétitions et créneaux"}</h4>
          {selectedDay ? <button type="button" className="site-button rounded-full px-4 py-2 text-sm" onClick={() => setSelectedDay(null)}>Afficher toute la semaine</button> : null}
        </div>
        {visibleEvents.length === 0 && selectedDay ? <p className="text-sm leading-7 text-emerald-900/70">Aucune date publiée pour ce jour.</p> : null}
        {competitions.length === 0 && visibleEvents.length > 0 ? <p className="mb-4 text-sm leading-7">Aucune compétition ni aucun créneau publié pour {selectedDay ? "ce jour" : "cette semaine"}. Les repères ci-dessous sont uniquement informatifs.</p> : null}
        {competitions.length > 0 ? <ul aria-label="Compétitions et créneaux" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map(event => <li key={event.id}>
            <button type="button" onClick={() => setSelected(event)} className={`h-full w-full rounded-lg border-l-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${eventStyle(event, today)}`}>
              <span className="block text-xs">{formatCalendarDate(event.start)}{event.end ? ` → ${formatCalendarDate(event.end)}` : ""}</span>
              <span className="mt-1 block text-sm font-semibold">{event.title}</span>
              <span className="mt-1 block text-xs">{event.time ? `${event.time} · ` : ""}{eventStatus(event, today)}{eventZone(event)} · Voir les détails</span>
            </button>
          </li>)}
        </ul> : null}
        {markers.length > 0 ? <div className="mt-6 border-t border-emerald-950/10 pt-4"><h5 className="text-sm font-medium text-slate-600">Fêtes, jours fériés et vacances</h5><ul aria-label="Repères du calendrier" className="mt-2 flex flex-wrap gap-2">{markers.map(event => <li key={event.id}><button type="button" onClick={() => setSelected(event)} className="rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-left text-xs text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><span className="font-medium">{event.title}</span> · {formatCalendarDate(event.start)}{event.end ? ` → ${formatCalendarDate(event.end)}` : ""}{eventZone(event)}</button></li>)}</ul></div> : null}
      </div> : null}
      <p className="border-t border-emerald-950/10 p-4 text-xs leading-6 text-emerald-900/70 sm:p-6">Les épreuves et leurs modalités peuvent évoluer. Contactez l’accueil avant toute inscription. Les dates en option ou à confirmer restent susceptibles de changer.</p>
    </div>
    </>
  );
}
