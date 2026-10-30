"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isWeekdaySpecialDate } from "@/data/daily-menu";

export function WeekdaySpecialVisibility({ menuDate, children }: { menuDate: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(isWeekdaySpecialDate(menuDate));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [menuDate]);

  return visible ? children : null;
}
