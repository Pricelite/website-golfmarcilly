"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { COOKIE_CONSENT_STORAGE_KEY } from "@/components/cookie-consent";

type ConsentValue = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

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

export default function Analytics() {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentValue | null | "unknown">(
    "unknown"
  );
  const [isReady, setIsReady] = useState(false);

  const pagePath = useMemo(() => {
    const query = searchParams.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(readConsentValue());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    function handleConsentChange(event: Event) {
      const detail = (event as CustomEvent<ConsentValue>).detail;
      if (detail === "accepted" || detail === "rejected") {
        setConsent(detail);
      } else {
        setConsent(readConsentValue());
      }
    }

    window.addEventListener("cookie-consent-changed", handleConsentChange as EventListener);
    return () => {
      window.removeEventListener(
        "cookie-consent-changed",
        handleConsentChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!isReady || consent !== "accepted" || !ga4Id || !window.gtag) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: pagePath,
    });
  }, [consent, ga4Id, isReady, pagePath]);

  if (!ga4Id || consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsReady(true);
        }}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${ga4Id}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
