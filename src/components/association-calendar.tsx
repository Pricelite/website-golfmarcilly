"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { calendarDefaultDate, eventsInMonth, eventsOnDay, formatCalendarDate, isPastEvent, monthDays, upcomingCompetitions } from "@/lib/association-calendar";
import { siteConfig } from "@/data/site";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
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
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const defaultDate = calendarDefaultDate(today, associationEvents);
  const mobile = useSyncExternalStore(subscribeScreen, () => window.matchMedia("(max-width: 767px)").matches, () => false);
  const [display, setDisplay] = useState<"list" | "calendar" | null>(null);
  const listView = (display ?? (mobile ? "list" : "calendar")) === "list";
  const upcoming = upcomingCompetitions(associationEvents, today);
  const year = view?.year ?? Number(defaultDate.slice(0, 4));
  const month = view?.month ?? Number(defaultDate.slice(5, 7)) - 1;
  const [selected, setSelected] = useState<AssociationEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [zone, setZone] = useState<"all" | "A" | "B" | "C">("B");
  const detailRef = useRef<HTMLDivElement>(null);
  const years = Array.from(new Set([year, ...associationEvents.flatMap(event => [Number(event.start.slice(0, 4)), Number((event.end ?? event.start).slice(0, 4))])])).sort((a, b) => a - b);

  useEffect(() => {
    if (selected) detailRef.current?.focus();
  }, [selected]);

  function changeMonth(delta: number) {
    const date = new Date(Date.UTC(year, month + delta, 1));
    setView({ year: date.getUTCFullYear(), month: date.getUTCMonth() });
    setSelected(null);
    setSelectedDay(null);
  }

  const events = eventsInMonth(associationEvents.filter(event => zone === "all" || !event.zone || event.zone === "all" || event.zone === zone), year, month);
  const monthCompetitions = events.filter(event => !isContextEvent(event)).length;
  const monthMarkers = events.length - monthCompetitions;
  const visibleEvents = selectedDay ? eventsOnDay(events, selectedDay) : events;
  const competitions = visibleEvents.filter(event => !isContextEvent(event));
  const markers = visibleEvents.filter(isContextEvent);

  return (
    <>
    <section aria-labelledby="upcoming-competitions" className="mt-8 rounded-2xl border border-emerald-950/15 bg-[#f7f4e9] p-5 sm:p-6">
      <h3 id="upcoming-competitions" className="font-serif text-2xl">Prochaines compétitions</h3>
      {upcoming.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{upcoming.slice(0, 3).map(event => <li key={event.id}><button type="button" onClick={() => { setView({ year: Number(event.start.slice(0, 4)), month: Number(event.start.slice(5, 7)) - 1 }); setSelectedDay(null); setSelected(event); }} className={`h-full w-full rounded-xl border-l-3 p-4 text-left ${eventStyle(event, today)}`}><span className="block text-xs">{formatCalendarDate(event.start)}</span><span className="mt-2 block font-semibold">{event.title}</span><span className="mt-2 block text-xs">{eventStatus(event, today)} · Voir les détails</span></button></li>)}</ul> : <p className="mt-3 text-sm">Aucune compétition à venir n’est publiée pour le moment. Les créneaux à définir restent consultables dans le calendrier complet.</p>}
    </section>
    <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-950/15 bg-white text-emerald-950 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          <h3 className="font-serif text-3xl">{months[month]} {year}</h3>
          <p className="mt-1 text-sm text-emerald-900/70">{monthCompetitions} compétition{monthCompetitions > 1 ? "s" : ""} ou créneau{monthCompetitions > 1 ? "x" : ""} · {monthMarkers} repère{monthMarkers > 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} onClick={() => { setView({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }); setSelected(null); setSelectedDay(null); }}>Ce mois-ci</button>
          <button type="button" aria-label="Mois précédent" className={buttonClass} onClick={() => changeMonth(-1)}>←</button>
          <button type="button" aria-label="Mois suivant" className={buttonClass} onClick={() => changeMonth(1)}>→</button>
          <label className="sr-only" htmlFor="as-calendar-month">Choisir un mois</label>
          <select id="as-calendar-month" className="min-h-11 max-w-full rounded-lg border border-emerald-950/20 bg-white px-3 text-sm" value={month} onChange={event => { setView({ year, month: Number(event.target.value) }); setSelected(null); setSelectedDay(null); }}>
            {months.map((label, index) => <option key={label} value={index}>{label}</option>)}
          </select>
          <label className="sr-only" htmlFor="as-calendar-year">Choisir une année</label>
          <select id="as-calendar-year" className="min-h-11 rounded-lg border border-emerald-950/20 bg-white px-3 text-sm" value={year} onChange={event => { setView({ year: Number(event.target.value), month }); setSelected(null); setSelectedDay(null); }}>
            {years.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
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
      <div hidden={listView}>
      <div className="grid grid-cols-7 border-y border-emerald-950/10 bg-stone-50 text-center text-xs font-semibold text-emerald-800">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => <div key={day} className="py-3">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-emerald-950/10">
        {monthDays(year, month).map((day, index) => {
          const dayEvents = day ? eventsOnDay(events, day) : [];
          const pastDayEvents = dayEvents.length > 0 && dayEvents.every(event => isPastEvent(event, today));
          return (
            <div key={day ?? `blank-${index}`} className={`min-w-0 ${pastDayEvents ? "bg-slate-100" : day ? "bg-white" : "bg-stone-50"} min-h-16 p-1 sm:min-h-20 md:min-h-32 md:p-2`}>
              {day ? <>
                <button type="button" aria-label={`${formatCalendarDate(day)}, ${dayEvents.length} date${dayEvents.length > 1 ? "s" : ""} au programme`} aria-pressed={selectedDay === day} aria-current={day === today ? "date" : undefined} onClick={() => { setSelectedDay(selectedDay === day ? null : day); setSelected(null); }} className={`site-button mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:mx-0 ${day === today ? "font-bold ring-2 ring-emerald-800" : selectedDay === day ? "font-bold ring-2 ring-amber-500" : ""}`}>
                  {Number(day.slice(-2))}
                </button>
                <div aria-hidden="true" className="mt-1 flex justify-center gap-1 md:hidden">{dayEvents.length > 0 ? <span className={`h-1.5 w-1.5 rounded-full ${pastDayEvents ? "bg-slate-500" : "bg-emerald-700"}`} /> : null}</div>
                <div className="mt-1 hidden space-y-1 md:block">
                  {dayEvents.map(event => <button key={event.id} type="button" onClick={() => setSelected(event)} className={`block w-full break-words rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${isContextEvent(event) ? "px-1.5 py-1 text-[11px] leading-4 text-slate-500 hover:bg-slate-50" : `border-l-3 px-2 py-1.5 text-xs leading-5 ${eventStyle(event, today)}`}`}>
                    {event.time ? `${event.time} · ` : ""}<span aria-hidden="true">{eventSymbol(event)}</span>{event.title}
                    {isContextEvent(event) ? null : <span className="block text-[11px] font-semibold">{eventStatus(event, today)}{eventZone(event)}</span>}
                  </button>)}
                </div>
              </> : null}
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

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-serif text-xl">{selectedDay ? `Le ${formatCalendarDate(selectedDay)}` : "Les dates du mois"}</h4>
          {selectedDay ? <button type="button" className="site-button rounded-full px-4 py-2 text-sm" onClick={() => setSelectedDay(null)}>Afficher tout le mois</button> : null}
        </div>
        {visibleEvents.length === 0 ? <p className="text-sm leading-7 text-emerald-900/70">Aucune date publiée pour {selectedDay ? "ce jour" : "ce mois"}.</p> : null}
        {competitions.length === 0 && visibleEvents.length > 0 ? <p className="mb-4 text-sm leading-7">Aucune compétition ni aucun créneau publié pour {selectedDay ? "ce jour" : "ce mois"}. Les repères ci-dessous sont uniquement informatifs.</p> : null}
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
        <p className="mt-5 border-t border-emerald-950/10 pt-4 text-xs leading-6 text-emerald-900/70">Les épreuves et leurs modalités peuvent évoluer. Contactez l’accueil avant toute inscription. Les dates en option ou à confirmer restent susceptibles de changer.</p>
      </div>
    </div>
    </>
  );
}
