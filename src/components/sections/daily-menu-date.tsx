"use client";

import { useEffect, useState } from "react";
import { formatDailyMenuDate, parisDateKey } from "@/data/daily-menu";

export function DailyMenuDate({ initialDate }: { initialDate: string }) {
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    const update = () => setDate(parisDateKey());
    update();
    const timer = window.setInterval(update, 15_000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);

  return <time dateTime={date} className="text-xs capitalize text-emerald-900/85">{formatDailyMenuDate(date)}</time>;
}
