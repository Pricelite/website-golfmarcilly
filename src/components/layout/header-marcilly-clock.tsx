"use client";

import { useEffect, useState } from "react";

import { getParisTime, type ClockTime } from "@/lib/restaurant/paris-clock";

export function HeaderMarcillyClock() {
  const [time, setTime] = useState<ClockTime | null>(null);

  useEffect(() => {
    const update = () => setTime(getParisTime(new Date()));
    update();
    const timer = window.setInterval(update, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = time ? (time.hours % 12) * 30 + time.minutes * 0.5 : 0;
  const minutes = time ? time.minutes * 6 : 0;
  const label = time?.label.slice(0, 5) ?? "--:--";

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.7rem] font-semibold tabular-nums text-emerald-800" aria-label={`Heure actuelle à Marcilly-en-Villette : ${label}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="13" x2="12" y2="7" transform={`rotate(${hours} 12 12)`} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="13" x2="12" y2="5" transform={`rotate(${minutes} 12 12)`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
      <span aria-hidden="true">Marcilly {label}</span>
    </span>
  );
}
