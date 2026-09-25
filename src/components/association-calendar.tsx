"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { eventsInMonth, eventsOnDay, formatCalendarDate, isPastEvent, monthDays } from "@/lib/association-calendar";
import { siteConfig } from "@/data/site";

const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const buttonClass = "site-button inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

function eventStyle(event: AssociationEvent, today: string) {
  if (isPastEvent(event, today)) return "border-slate-400 bg-slate-100 text-slate-600";
  return event.status === "private" ? "border-stone-400 bg-stone-100 text-stone-700" : event.status === "provisional" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-emerald-600 bg-emerald-50 text-emerald-950";
}

function eventStatus(event: AssociationEvent, today: string) {
  if (isPastEvent(event, today)) {
    return event.status === "provisional" ? "Date passée · En option" : event.status === "private" ? "Terminée · Épreuve privée" : "Terminée";
  }
  return event.status === "private" ? "Épreuve privée" : event.status === "provisional" ? "En option" : "Au programme";
}

function currentParisDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function subscribeToDate(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);
  window.addEventListener("focus", callback);
  return () => { window.clearInterval(interval); window.removeEventListener("focus", callback); };
}

export function AssociationCalendar({ initialDate, events: associationEvents }: { initialDate: string; events: AssociationEvent[] }) {
  const today = useSyncExternalStore(subscribeToDate, currentParisDate, () => initialDate);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const year = view?.year ?? Number(today.slice(0, 4));
  const month = view?.month ?? Number(today.slice(5, 7)) - 1;
  const [selected, setSelected] = useState<AssociationEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) detailRef.current?.focus();
  }, [selected]);

  function changeMonth(delta: number) {
    const date = new Date(Date.UTC(year, month + delta, 1));
    setView({ year: date.getUTCFullYear(), month: date.getUTCMonth() });
    setSelected(null);
    setSelectedDay(null);
  }

  const events = eventsInMonth(associationEvents, year, month);
  const visibleEvents = selectedDay ? eventsOnDay(events, selectedDay) : events;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/15 bg-white text-emerald-950 shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          <h3 className="font-serif text-3xl">{months[month]} {year}</h3>
          <p className="mt-1 text-sm text-emerald-900/70">{events.length} épreuve{events.length > 1 ? "s" : ""} au programme</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} onClick={() => { setView(null); setSelected(null); setSelectedDay(null); }}>Ce mois-ci</button>
          <button type="button" aria-label="Mois précédent" className={buttonClass} onClick={() => changeMonth(-1)}>←</button>
          <button type="button" aria-label="Mois suivant" className={buttonClass} onClick={() => changeMonth(1)}>→</button>
          <label className="sr-only" htmlFor="as-calendar-month">Choisir un mois</label>
          <select id="as-calendar-month" className="min-h-11 max-w-full rounded-lg border border-emerald-950/20 bg-white px-3 text-sm" value={month} onChange={event => { setView({ year, month: Number(event.target.value) }); setSelected(null); setSelectedDay(null); }}>
            {months.map((label, index) => <option key={label} value={index}>{label}</option>)}
          </select>
        </div>
      </div>

      <p className="flex items-center gap-2 px-4 pb-4 text-xs text-slate-600 sm:px-6">
        <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-slate-400 bg-slate-100" />
        En gris : les compétitions dont la date de fin est passée.
      </p>
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
                <button type="button" aria-label={`${formatCalendarDate(day)}, ${dayEvents.length} épreuve${dayEvents.length > 1 ? "s" : ""}`} aria-pressed={selectedDay === day} aria-current={day === today ? "date" : undefined} onClick={() => { setSelectedDay(selectedDay === day ? null : day); setSelected(null); }} className={`site-button mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:mx-0 ${day === today ? "font-bold ring-2 ring-emerald-800" : selectedDay === day ? "font-bold ring-2 ring-amber-500" : ""}`}>
                  {Number(day.slice(-2))}
                </button>
                <div aria-hidden="true" className="mt-1 flex justify-center gap-1 md:hidden">{dayEvents.length > 0 ? <span className={`h-1.5 w-1.5 rounded-full ${pastDayEvents ? "bg-slate-500" : "bg-emerald-700"}`} /> : null}</div>
                <div className="mt-1 hidden space-y-1 md:block">
                  {dayEvents.map(event => <button key={event.id} type="button" onClick={() => setSelected(event)} className={`block w-full break-words rounded-md border-l-3 px-2 py-1.5 text-left text-xs leading-5 focus-visible:outline-2 focus-visible:outline-offset-2 ${eventStyle(event, today)}`}>
                    {event.time ? `${event.time} · ` : ""}{event.title}
                    {event.status || isPastEvent(event, today) ? <span className="block text-[11px] font-semibold">{eventStatus(event, today)}</span> : null}
                  </button>)}
                </div>
              </> : null}
            </div>
          );
        })}
      </div>

      {selected ? <div ref={detailRef} tabIndex={-1} role="region" aria-label="Détails de l’épreuve" className="m-4 scroll-mt-28 rounded-xl border border-emerald-800/20 bg-[#f7f4e9] p-5 focus:outline-2 focus:outline-emerald-700 sm:m-6">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">{eventStatus(selected, today)}</p><h4 className="mt-2 font-serif text-2xl">{selected.title}</h4></div>
          <button className={buttonClass} type="button" onClick={() => setSelected(null)}>Fermer</button>
        </div>
        <p className="mt-3 text-sm">{formatCalendarDate(selected.start)}{selected.end ? ` au ${formatCalendarDate(selected.end)}` : ""}</p>
        <p className="mt-2 text-sm">{selected.time ? `À partir de ${selected.time.replace(":", " h ")}` : "Horaire à préciser auprès de l’accueil."}</p>
        {selected.note ? <p className="mt-2 text-sm leading-6">{selected.note}</p> : null}
        <a className="mt-4 inline-block text-sm font-semibold underline underline-offset-4" href={`tel:${siteConfig.phoneHref}`}>Renseignements : {siteConfig.phoneDisplay}</a>
      </div> : null}

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-serif text-xl">{selectedDay ? `Le ${formatCalendarDate(selectedDay)}` : "Les épreuves du mois"}</h4>
          {selectedDay ? <button type="button" className="site-button rounded-full px-4 py-2 text-sm" onClick={() => setSelectedDay(null)}>Afficher tout le mois</button> : null}
        </div>
        {visibleEvents.length === 0 ? <p className="text-sm leading-7 text-emerald-900/70">Aucune épreuve publiée pour {selectedDay ? "cette date" : "ce mois"}.</p> : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map(event => <li key={event.id}>
            <button type="button" onClick={() => setSelected(event)} className={`h-full w-full rounded-lg border-l-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${eventStyle(event, today)}`}>
              <span className="block text-xs">{formatCalendarDate(event.start)}{event.end ? ` → ${formatCalendarDate(event.end)}` : ""}</span>
              <span className="mt-1 block text-sm font-semibold">{event.title}</span>
              <span className="mt-1 block text-xs">{event.time ? `${event.time} · ` : ""}{eventStatus(event, today)} · Voir les détails</span>
            </button>
          </li>)}
        </ul>}
        <p className="mt-5 border-t border-emerald-950/10 pt-4 text-xs leading-6 text-emerald-900/70">Les épreuves et leurs modalités peuvent évoluer. Contactez l’accueil avant toute inscription. Les rendez-vous privés et en option sont signalés.</p>
      </div>
    </div>
  );
}
