import posthog from "posthog-js";

import { ANALYTICS_CONSENT_KEY, readAnalyticsConsent } from "./consent";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
let initialized = false;

export function postHogConsentGranted(): boolean {
  return typeof window !== "undefined" && readAnalyticsConsent(window.localStorage) === "yes";
}

function syncPostHogConsent(): boolean {
  if (!token || !host || !postHogConsentGranted()) {
    if (initialized && !posthog.has_opted_out_capturing()) {
      posthog.reset();
      posthog.opt_out_capturing();
    }
    return false;
  }

  if (!initialized) {
    posthog.init(token, {
      api_host: host,
      defaults: "2026-08-30",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      disable_session_recording: true,
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      debug: process.env.NODE_ENV === "development",
      before_send: (event) => {
        for (const key of ["$current_url", "$initial_current_url", "$session_entry_url", "$referrer"]) {
          delete event.properties?.[key];
        }
        return event;
      },
    });
    initialized = true;
  }
  if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false });
  return true;
}

export function installPostHogConsentSync(): void {
  if (typeof window === "undefined") return;
  syncPostHogConsent();
  window.addEventListener("analytics-consent-changed", syncPostHogConsent);
  window.addEventListener("storage", (event) => {
    if (event.key === ANALYTICS_CONSENT_KEY) syncPostHogConsent();
  });
}

export function capturePostHog(event: string, properties?: Record<string, string | number | boolean>): void {
  if (syncPostHogConsent()) posthog.capture(event, properties);
}

export function identifyPostHog(id: string, role: string): void {
  if (syncPostHogConsent()) posthog.identify(id, { role });
}

export function resetPostHogIdentity(): void {
  if (!initialized || !postHogConsentGranted()) return;
  posthog.reset();
  posthog.opt_in_capturing({ captureEventName: false });
}
