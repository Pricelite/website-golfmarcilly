import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Report = {
  current: { visitors: number; visits: number; views: number; logins: number; accounts: number };
  previous: { visitors: number; visits: number; views: number; logins: number; accounts: number };
  series: { day: string; visitors: number; visits: number; views: number }[];
  pages: { path: string; visitors: number; views: number }[];
  sections: { section: string; visitors: number; views: number }[];
  since: string | null;
};

function retentionDays() {
  const value = Number(process.env.ANALYTICS_RETENTION_DAYS || 180);
  return Number.isInteger(value) && value >= 30 && value <= 730 ? value : 180;
}

async function cleanup() {
  const { error } = await createSupabaseAdminClient().rpc("site_analytics_cleanup", { retention_days: retentionDays() });
  if (error) throw error;
}

export async function recordPageView(event: { eventId: string; visitorId: string; visitId: string; path: string }) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("site_analytics_page_views").insert({ event_id: event.eventId, visitor_id: event.visitorId, visit_id: event.visitId, path: event.path });
  if (error && error.code !== "23505") throw error;
  await cleanup();
}

export async function recordLogin(source: "shared_admin" | "named_account", accountId?: string) {
  const { error } = await createSupabaseAdminClient().from("site_analytics_logins").insert({ source, account_id: accountId ?? null });
  if (error) throw error;
  await cleanup();
}

export async function loadReport(start: string, end: string): Promise<Report> {
  const { data, error } = await createSupabaseAdminClient().rpc("site_analytics_report", { start_day: start, end_day: end });
  if (error) throw error;
  return data as Report;
}
