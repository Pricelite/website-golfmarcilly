"use client";

import { useEffect, useState } from "react";

import { getParisTime, type ClockTime } from "@/lib/restaurant/paris-clock";

export function RestaurantLiveClock() {
  const [time, setTime] = useState<ClockTime | null>(null);

  useEffect(() => {
    const update = () => setTime(getParisTime(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = time ? (time.hours % 12) * 30 + time.minutes * 0.5 : 0;
  const minutes = time ? time.minutes * 6 + time.seconds * 0.1 : 0;
  const seconds = time ? time.seconds * 6 : 0;

  return (
    <div className="mt-4 flex flex-col items-center" role="group" aria-label="Heure actuelle à Marcilly-en-Villette">
      <svg viewBox="0 0 240 240" className="h-32 w-32 sm:h-36 sm:w-36" aria-hidden="true" focusable="false">
        <circle cx="120" cy="120" r="114" fill="#DCE9C7" fillOpacity="0.08" />
        <circle cx="120" cy="120" r="104" fill="#113D34" stroke="#DCE9C7" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="120" cy="120" r="94" fill="#0A332B" stroke="#F3E7C5" strokeWidth="3" />
        <circle cx="120" cy="120" r="83" stroke="#DCE9C7" strokeOpacity="0.22" />
        {Array.from({ length: 12 }, (_, index) => (
          <line key={index} x1="120" y1="34" x2="120" y2={index % 3 === 0 ? "50" : "44"} transform={`rotate(${index * 30} 120 120)`} stroke="#F3E7C5" strokeWidth={index % 3 === 0 ? "3" : "2"} strokeLinecap="round" />
        ))}
        <line x1="120" y1="130" x2="120" y2="76" transform={`rotate(${hours} 120 120)`} stroke="#F3E7C5" strokeWidth="6" strokeLinecap="round" />
        <line x1="120" y1="134" x2="120" y2="56" transform={`rotate(${minutes} 120 120)`} stroke="#F3E7C5" strokeWidth="4" strokeLinecap="round" />
        <line x1="120" y1="145" x2="120" y2="48" transform={`rotate(${seconds} 120 120)`} stroke="#D5B870" strokeWidth="2" strokeLinecap="round" />
        <circle cx="120" cy="120" r="5" fill="#D5B870" />
      </svg>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-stone-100/70">Heure à Marcilly</p>
      <p className="mt-1 font-serif text-2xl tabular-nums text-[#F3E7C5]">{time?.label ?? "--:--:--"}</p>
    </div>
  );
}
