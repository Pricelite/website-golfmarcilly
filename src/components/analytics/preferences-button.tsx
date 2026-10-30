"use client";

import { usePathname } from "next/navigation";

import { publicPath } from "@/lib/analytics/core";

export function AnalyticsPreferencesButton() {
  const pathname = usePathname();
  if (!publicPath(pathname)) return null;
  return <button type="button" className="text-sm text-stone-100/80 underline underline-offset-4 hover:text-white" onClick={() => window.dispatchEvent(new Event("analytics-preferences"))}>Choix de mesure d’audience</button>;
}
