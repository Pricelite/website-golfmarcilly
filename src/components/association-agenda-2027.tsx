"use client";

import { useRef, useState } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { formatCalendarDate } from "@/lib/association-calendar";
import styles from "./association-agenda-2027.module.css";

const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function eventStatus(event: AssociationEvent) {
  if (event.category === "holiday" || event.category === "vacation" || event.category === "celebration") return "Repère";
  if (event.status === "provisional") return "Option";
  if (event.status === "confirmed") return "Confirmé";
  return "À confirmer";
}

function eventColor(event: AssociationEvent) {
  if (/\bcoupes?\s+de\s+classement\b/i.test(event.title)) return { background: "#c9f2d8", color: "#226b4a" };
  const status = eventStatus(event);
  return { background: status === "Option" ? "#fff0c2" : status === "Confirmé" ? "#c9f2d8" : status === "Repère" ? "#e8e8e8" : "#e1ecff", color: "#203047" };
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthCells(month: number) {
  const first = new Date(Date.UTC(2027, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(Date.UTC(2027, month, 1 - offset + index)));
}

export function AssociationAgenda2027({ events, month, years, onMonthChange, onYearChange }: {
  events: AssociationEvent[];
  month: number;
  years: number[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}) {
  const [zone, setZone] = useState<"A" | "B" | "C" | "all">("B");
  const [display, setDisplay] = useState<"month" | "list">("month");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AssociationEvent | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = events.filter(event => event.start.startsWith("2027-") &&
    (zone === "all" || !event.zone || event.zone === "all" || event.zone === zone) &&
    `${event.title} ${event.note ?? ""}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));
  const first = dateKey(new Date(Date.UTC(2027, month, 1)));
  const last = dateKey(new Date(Date.UTC(2027, month + 1, 0)));

  function openEvent(event: AssociationEvent) {
    setSelected(event);
    dialogRef.current?.showModal();
  }

  return <div className={styles.agenda}>
    <div className={styles.toolbar}>
      <button type="button" className={styles.control} aria-label="Mois précédent" onClick={() => onMonthChange((month + 11) % 12)}>‹</button>
      <button type="button" className={styles.control} aria-label="Mois suivant" onClick={() => onMonthChange((month + 1) % 12)}>›</button>
      <strong className={styles.heading} aria-live="polite">{monthNames[month]} 2027</strong>
      <select className={styles.control} aria-label="Mois" value={month} onChange={event => onMonthChange(Number(event.target.value))}>
        {monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}
      </select>
      <select className={styles.control} aria-label="Année" value={2027} onChange={event => onYearChange(Number(event.target.value))}>
        {years.map(year => <option key={year} value={year}>{year}</option>)}
      </select>
      <select className={styles.control} aria-label="Zone scolaire" value={zone} onChange={event => setZone(event.target.value as typeof zone)}>
        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="all">Toutes</option>
      </select>
      <select className={styles.control} aria-label="Vue" value={display} onChange={event => setDisplay(event.target.value as typeof display)}>
        <option value="month">Vue mois</option><option value="list">Vue liste</option>
      </select>
    </div>
    <div className={styles.toolbar}>
      <input className={`${styles.control} ${styles.search}`} type="search" placeholder="Rechercher…" aria-label="Rechercher" value={search} onChange={event => setSearch(event.target.value)} />
    </div>
    <div className={styles.legend} aria-label="Légende du calendrier">
      <span style={{ background: "#e1ecff" }}>Compétitions</span>
      <span style={{ background: "#ffe4e5", color: "#a32f38" }}>Jours fériés</span>
      <span style={{ background: "#dcf4e9", color: "#226b4a" }}>Vacances</span>
      <span style={{ background: "#f1e5ff", color: "#7849a3" }}>Fêtes</span>
      <span style={{ background: "#eee", color: "#666" }}>Créneaux libres</span>
    </div>
    {display === "month" ? <div className={styles.grid} aria-label={`Calendrier de ${monthNames[month].toLocaleLowerCase("fr")} 2027`}>
      {weekdays.map(day => <div key={day} className={styles.weekday}>{day}</div>)}
      {monthCells(month).map(day => {
        const key = dateKey(day);
        const dayEvents = visible.filter(event => event.start <= key && (event.end ?? event.start) >= key);
        return <div key={key} className={`${styles.day} ${day.getUTCMonth() !== month ? styles.outside : ""}`}>
          <div className={styles.date}>{day.getUTCDate()}</div>
          {dayEvents.map(event => <button key={event.id} type="button" className={styles.event} style={eventColor(event)} title={`${eventStatus(event)} · ${event.note ?? ""}`} onClick={() => openEvent(event)}>
            {event.status === "provisional" ? "◌ " : event.status === "confirmed" ? "✓ " : ""}{event.title}
          </button>)}
        </div>;
      })}
    </div> : <div>
      {visible.filter(event => event.start <= last && (event.end ?? event.start) >= first).sort((a, b) => a.start.localeCompare(b.start)).map(event => <button type="button" key={event.id} className={styles.listRow} style={/\bcoupes?\s+de\s+classement\b/i.test(event.title) ? eventColor(event) : undefined} onClick={() => openEvent(event)}>
        <b>{event.start}{event.end && event.end !== event.start ? ` → ${event.end}` : ""}</b> · {event.title} <small>· {eventStatus(event)}</small>
      </button>)}
      {!visible.some(event => event.start <= last && (event.end ?? event.start) >= first) ? <p>Aucun événement ce mois-ci.</p> : null}
    </div>}
    <dialog ref={dialogRef} className={styles.dialog} onClose={() => setSelected(null)}>
      {selected ? <>
        <h4 className="text-xl font-semibold">{selected.title}</h4>
        <p className="mt-3">{formatCalendarDate(selected.start)}{selected.end && selected.end !== selected.start ? ` → ${formatCalendarDate(selected.end)}` : ""}</p>
        <p className="mt-2">{eventStatus(selected)}{selected.zone && selected.zone !== "all" ? ` · Zone ${selected.zone}` : ""}</p>
        {selected.note ? <p className="mt-2">{selected.note}</p> : null}
        <button type="button" className={`${styles.control} mt-5`} onClick={() => dialogRef.current?.close()}>Fermer</button>
      </> : null}
    </dialog>
  </div>;
}
