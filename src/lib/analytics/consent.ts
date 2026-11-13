export const ANALYTICS_CONSENT_KEY = "marcilly_analytics_consent";
export type AnalyticsConsent = "yes" | "no" | null;
export const CONSENT_DURATION_MS = 183 * 24 * 60 * 60 * 1000;

export function readAnalyticsConsent(storage: Pick<Storage, "getItem">, now = Date.now()): AnalyticsConsent {
  try {
    const choice = JSON.parse(storage.getItem(ANALYTICS_CONSENT_KEY) ?? "null");
    if (!choice || (choice.value !== "yes" && choice.value !== "no")) return null;
    if (!Number.isFinite(choice.at) || choice.at > now || now - choice.at >= CONSENT_DURATION_MS) return null;
    return choice.value;
  } catch { return null; }
}

export function saveAnalyticsConsent(storage: Pick<Storage, "setItem">, value: Exclude<AnalyticsConsent, null>, now = Date.now()): void {
  storage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ value, at: now }));
}

/** Read only the existing choice before paint. No identifier, cookie or request is created. */
export const analyticsConsentBootstrap = `try{var c=JSON.parse(localStorage.getItem(${JSON.stringify(ANALYTICS_CONSENT_KEY)})||"null"),n=Date.now();if(c&&(c.value==="yes"||c.value==="no")&&Number.isFinite(c.at)&&c.at<=n&&n-c.at<${CONSENT_DURATION_MS})document.documentElement.setAttribute("data-analytics-consent",c.value)}catch{}`;
