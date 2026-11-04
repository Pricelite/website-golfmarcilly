"use client";

import { useEffect } from "react";

const MAX_AGE_MS = 5 * 60 * 1000;
const parisDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export function RefreshStaleHome() {
  useEffect(() => {
    let reloading = false;
    const renderedAt = Date.now();
    const renderedDay = document.getElementById("conditions-date")?.getAttribute("datetime");

    const refreshIfStale = () => {
      if (reloading || document.visibilityState !== "visible") return;
      if (renderedDay === parisDay(new Date()) && Date.now() - renderedAt <= MAX_AGE_MS) return;
      reloading = true;
      window.location.reload();
    };

    const refreshOnNewDay = () => {
      if (parisDay(new Date()) !== renderedDay) refreshIfStale();
    };

    const onVisibilityChange = () => refreshIfStale();
    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(refreshOnNewDay, 60 * 1000);
    refreshIfStale();

    return () => {
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
