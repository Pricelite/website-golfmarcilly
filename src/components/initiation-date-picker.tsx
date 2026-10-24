"use client";

import { useState } from "react";
import { monthDays } from "@/lib/association-calendar";

export function InitiationDatePicker({ dates, value, onChange, disabled }: { dates: string[]; value: string; onChange: (date: string) => void; disabled: boolean }) {
  const sortedDates = [...new Set(dates)].sort();
  const [view, setView] = useState("");
  const firstMonth = sortedDates[0]?.slice(0, 7) ?? "";
  const lastMonth = sortedDates.at(-1)?.slice(0, 7) ?? "";
  const monthKey = view && view >= firstMonth && view <= lastMonth ? view : value.slice(0, 7) || firstMonth;
  if (!monthKey) return null;
  const [year, monthNumber] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${monthKey}-01T12:00:00Z`));
  function move(delta: number) {
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    setView(date.toISOString().slice(0, 7));
  }
  return <fieldset disabled={disabled} className="min-w-0 rounded-2xl border border-emerald-950/20 p-3">
    <legend className="px-1 font-semibold">Date souhaitée</legend>
    <div className="flex items-center justify-between gap-2">
      <button type="button" aria-label="Mois précédent des initiations" disabled={monthKey <= firstMonth} onClick={() => move(-1)} className="site-button h-11 w-11 rounded-full disabled:opacity-40">←</button>
      <p aria-live="polite" className="text-center font-semibold capitalize">{label}</p>
      <button type="button" aria-label="Mois suivant des initiations" disabled={monthKey >= lastMonth} onClick={() => move(1)} className="site-button h-11 w-11 rounded-full disabled:opacity-40">→</button>
    </div>
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
      {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map(day => <span key={day} className="py-2 font-semibold">{day}</span>)}
      {monthDays(year, monthNumber - 1).map((day, index) => day ? <button key={day} type="button" disabled={!sortedDates.includes(day)} aria-pressed={value === day} aria-label={new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`))} onClick={() => onChange(day)} className={`min-h-11 rounded-lg border text-sm disabled:border-transparent disabled:text-stone-500 ${value === day ? "border-emerald-950 bg-emerald-950 font-bold text-white" : "border-emerald-900/30 bg-white text-emerald-950 enabled:hover:bg-emerald-100"}`}>{Number(day.slice(-2))}</button> : <span key={`blank-${index}`} />)}
    </div>
    <p className="mt-3 text-xs leading-5">Les dates encadrées proposent une initiation. {sortedDates.some(day => day.startsWith(monthKey)) ? "Choisissez une date, puis un horaire." : "Aucun créneau ce mois-ci. Consultez le mois suivant."}</p>
    <p role="status" className="mt-2 text-sm font-semibold">{value ? `Date choisie : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))}` : "Aucune date choisie"}</p>
  </fieldset>;
}
