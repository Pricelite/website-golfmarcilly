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

  if (visible) return children;
  return <div className="px-5 py-4 text-sm leading-6 sm:px-6">
    <p>La carte est affichée de 10 h à 15 h, heure de Paris. Vous pouvez aussi la consulter ci-dessous.</p>
    <details className="mt-3"><summary className="cursor-pointer py-2 font-semibold underline underline-offset-4">Consulter la carte</summary>{children}</details>
  </div>;
}
