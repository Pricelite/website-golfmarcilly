"use client";

import { useState, useSyncExternalStore } from "react";
import type { AssociationEvent } from "@/data/association-events";
import { AssociationAgenda2027 } from "./association-agenda-2027";

function currentParisDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function subscribeToDate(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);
  window.addEventListener("focus", callback);
  return () => { window.clearInterval(interval); window.removeEventListener("focus", callback); };
}

export function AssociationCalendar({ initialDate, events }: { initialDate: string; events: AssociationEvent[] }) {
  const today = useSyncExternalStore(subscribeToDate, currentParisDate, () => initialDate);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const year = view?.year ?? Number(today.slice(0, 4));
  const month = view?.month ?? Number(today.slice(5, 7)) - 1;
  const years = Array.from(new Set([year, ...events.flatMap(event => [Number(event.start.slice(0, 4)), Number((event.end ?? event.start).slice(0, 4))])])).sort((a, b) => a - b);

  return <AssociationAgenda2027
    events={events}
    year={year}
    month={month}
    today={today}
    years={years}
    onMonthChange={nextMonth => setView({ year, month: nextMonth })}
    onYearChange={nextYear => setView({ year: nextYear, month })}
    onMonthStep={delta => {
      const date = new Date(Date.UTC(year, month + delta, 1));
      setView({ year: date.getUTCFullYear(), month: date.getUTCMonth() });
    }}
    onToday={() => setView(null)}
  />;
}
