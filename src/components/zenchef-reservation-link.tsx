"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

import { capturePostHog } from "@/lib/analytics/posthog-client";

export const ZENCHEF_RESTAURANT_ID = "389706";
const ZENCHEF_SDK_URL = "https://sdk.zenchef.com/v1/sdk.min.js";
const ZENCHEF_BOOKING_URL = `https://bookings.zenchef.com/results?rid=${ZENCHEF_RESTAURANT_ID}`;

type ZenchefWindow = Window & {
  ZenchefWidget?: { open: () => void };
};

let sdkReady: Promise<void> | undefined;

function loadZenchefWidget(): Promise<void> {
  if (sdkReady) return sdkReady;

  // Configuration générée par Zenchef : un seul widget, sans bouton flottant.
  const config = document.createElement("div");
  config.className = "zc-widget-config";
  config.dataset.restaurant = ZENCHEF_RESTAURANT_ID;
  config.dataset.hideDefaultButton = "true";
  config.dataset.disableGtm = "true";
  config.dataset.disableGa4 = "true";
  config.dataset.sendPageViews = "false";
  document.body.append(config);

  sdkReady = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "zenchef-sdk";
    script.src = ZENCHEF_SDK_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Zenchef indisponible"));
    script.onload = () => {
      const started = Date.now();
      const waitForWidget = () => {
        if ((window as ZenchefWindow).ZenchefWidget?.open) {
          resolve();
        } else if (Date.now() - started > 10_000) {
          reject(new Error("Zenchef indisponible"));
        } else {
          window.setTimeout(waitForWidget, 100);
        }
      };
      waitForWidget();
    };
    document.body.append(script);
  }).catch((error: unknown) => {
    sdkReady = undefined;
    document.getElementById("zenchef-sdk")?.remove();
    config.remove();
    throw error;
  });

  return sdkReady;
}

export function ZenchefReservationLink({ className, children = "Réserver une table", onClick }: {
  className: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function openReservation(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (loading) return;

    onClick?.();
    capturePostHog("restaurant_booking_opened");
    setLoading(true);
    try {
      await loadZenchefWidget();
      (window as ZenchefWindow).ZenchefWidget?.open();
    } catch {
      // Si le SDK est bloqué, conserver un accès à la réservation Zenchef.
      window.location.assign(ZENCHEF_BOOKING_URL);
    } finally {
      setLoading(false);
    }
  }

  return (
    <a href={ZENCHEF_BOOKING_URL} onClick={openReservation} aria-busy={loading} className={className}>
      {children}
    </a>
  );
}
