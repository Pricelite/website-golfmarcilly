"use client";

import { useEffect, useState, type ReactNode } from "react";

import { isDailyMenuDisplayTime } from "@/data/daily-menu";

export function DailyMenuVisibility({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(isDailyMenuDisplayTime(new Date()));
    update();
    const timer = window.setInterval(update, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!visible) {
    return (
      <p className="px-5 py-5 text-sm leading-6 sm:px-6">
        La carte du jour est affichée tous les jours de 10 h à 15 h.
      </p>
    );
  }

  return children;
}
