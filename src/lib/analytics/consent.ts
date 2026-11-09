export const ANALYTICS_CONSENT_KEY = "marcilly_analytics_consent";
export type AnalyticsConsent = "yes" | "no" | null;

export function readAnalyticsConsent(storage: Pick<Storage, "getItem">): AnalyticsConsent {
  try {
    const value = storage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "yes" || value === "no" ? value : null;
  } catch { return null; }
}

/** Read only the existing choice before paint. No identifier, cookie or request is created. */
export const analyticsConsentBootstrap = `try{var c=localStorage.getItem(${JSON.stringify(ANALYTICS_CONSENT_KEY)});if(c==="yes"||c==="no")document.documentElement.setAttribute("data-analytics-consent",c)}catch{}`;
