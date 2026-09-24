import assert from "node:assert/strict";
import test from "node:test";
import { getEnvironmentOverview, getPublicEnvironmentStatus } from "./environment";

test("email initiation requires the private feed, without legacy Google, SumUp or public Supabase keys", () => {
  const saved = { ...process.env };
  try {
    for (const key of Object.keys(process.env)) {
      if (/^(GOOGLE_|SUMUP_|SMTP_|BREVO_|EMAIL_|NEXT_PUBLIC_|INITIATION_|SUPABASE_|ADMIN_|OPS_)/.test(key)) delete process.env[key];
    }
    Object.assign(process.env, {
      NEXT_PUBLIC_SITE_URL: "https://example.com", NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-only", INITIATION_CALENDAR_ICS_URL: "https://calendar.google.com/calendar/ical/test/basic.ics",
      BREVO_API_KEY: "test-only", EMAIL_FROM: "golf@example.com", EMAIL_TO: "golf@example.com",
      ADMIN_PASSWORD: "test-only", ADMIN_SESSION_SECRET: "test-only",
    });
    assert.equal(getPublicEnvironmentStatus(getEnvironmentOverview()).status, "ok");
    delete process.env.INITIATION_CALENDAR_ICS_URL;
    process.env.GOOGLE_CALENDAR_CLIENT_EMAIL = "legacy@example.com";
    process.env.GOOGLE_CALENDAR_PRIVATE_KEY = "legacy";
    assert.equal(getPublicEnvironmentStatus(getEnvironmentOverview()).services.initiationCalendar, false);
    delete process.env.BREVO_API_KEY;
    assert.equal(getPublicEnvironmentStatus(getEnvironmentOverview()).services.emailDelivery, false);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
