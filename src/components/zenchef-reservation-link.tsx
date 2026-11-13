"use client";

import type { MouseEvent } from "react";
import { capturePostHog } from "@/lib/analytics/posthog-client";

export const ZENCHEF_RESTAURANT_ID = "389706";

type ZenchefWindow = Window & {
  ZenchefWidget?: { open: () => void };
};

export function ZenchefReservationLink({ className, children = "Réserver une table" }: {
  className: string;
  children?: string;
}) {
  function openReservation(event: MouseEvent<HTMLAnchorElement>) {
    capturePostHog("restaurant_booking_opened");
    const widget = (window as ZenchefWindow).ZenchefWidget;
    if (!widget) return;
    event.preventDefault();
    widget.open();
  }

  return (
    <a
      href={`https://bookings.zenchef.com/results?rid=${ZENCHEF_RESTAURANT_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openReservation}
      className={className}
    >
      {children}
    </a>
  );
}
