"use client";

import { useEffect, useState } from "react";

export const COOKIE_CONSENT_STORAGE_KEY = "cookie-consent-v1";

type ConsentValue = "accepted" | "rejected";

function readConsentValue(): ConsentValue | null {
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (stored === "accepted" || stored === "rejected") {
      return stored;
    }
  } catch {
    // Ignore localStorage access errors.
  }

  return null;
}

function writeConsentValue(value: ConsentValue): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // Ignore localStorage write errors.
  }

  window.dispatchEvent(
    new CustomEvent("cookie-consent-changed", {
      detail: value,
    })
  );
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue | null | "unknown">(
    "unknown"
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(readConsentValue());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (consent === "unknown") {
    return null;
  }

  if (consent !== null) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[130] mx-auto w-full max-w-3xl rounded-2xl border border-emerald-900/20 bg-white/95 p-4 shadow-2xl shadow-emerald-900/15 backdrop-blur"
    >
      <p className="text-sm font-semibold text-emerald-950">
        Cookies et mesure d&apos;audience
      </p>
      <p className="mt-2 text-sm text-emerald-900/80">
        Nous utilisons des cookies de mesure d&apos;audience (GA4) uniquement avec votre accord.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            writeConsentValue("accepted");
            setConsent("accepted");
          }}
          className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => {
            writeConsentValue("rejected");
            setConsent("rejected");
          }}
          className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          Refuser
        </button>
      </div>
    </aside>
  );
}
