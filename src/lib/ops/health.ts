import "server-only";
import { checkMailConnection } from "@/lib/email/mailer";
import { getInitiationOptions } from "@/lib/initiation/calendar-options-server";
import { getEnvironmentOverview, getPublicEnvironmentStatus } from "./environment";

async function succeeds(operation: () => Promise<unknown>): Promise<boolean> {
  try { await operation(); return true; } catch { return false; }
}

async function probeServices() {
  const overview = getEnvironmentOverview();
  const { services } = getPublicEnvironmentStatus(overview);
  const [calendar, mail, competitions] = await Promise.all([
    services.initiationCalendar && succeeds(() => getInitiationOptions()),
    services.emailDelivery && succeeds(() => checkMailConnection()),
    services.competitions && succeeds(async () => {
      const url = new URL("/rest/v1/association_events?select=id&limit=1", process.env.NEXT_PUBLIC_SUPABASE_URL);
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
      const response = await fetch(url, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok || !Array.isArray(await response.json())) throw new Error("Calendar store unavailable");
    }),
  ]);
  services.initiationCalendar = calendar;
  services.emailDelivery = mail;
  services.competitions = competitions;
  return {
    status: Object.values(services).every(Boolean) ? "ok" as const : "degraded" as const,
    services,
    checkedAt: new Date().toISOString(),
    // A connection check never sends email and cannot certify inbox delivery.
    scope: "configuration-and-connectivity" as const,
  };
}

let cached: { until: number; result: Promise<Awaited<ReturnType<typeof probeServices>>> } | undefined;

export function getServiceHealth() {
  if (!cached || cached.until <= Date.now()) {
    cached = { until: Date.now() + 60_000, result: probeServices() };
  }
  return cached.result;
}
