"use client";
import { capturePostHog } from "@/lib/analytics/posthog-client";

export const ZENCHEF_RESTAURANT_ID = "389706";

export function ZenchefReservationLink({ className, children = "Réserver une table" }: {
  className: string;
  children?: string;
}) {
  return (
    <a
      href={`https://bookings.zenchef.com/results?rid=${ZENCHEF_RESTAURANT_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => capturePostHog("restaurant_booking_opened")}
      className={className}
    >
      {children}
    </a>
  );
}
