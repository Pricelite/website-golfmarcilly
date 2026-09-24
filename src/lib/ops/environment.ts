type EnvironmentCheck = { configured: boolean; missing: string[] };

export type EnvironmentOverview = {
  publicSite: EnvironmentCheck;
  competitions: EnvironmentCheck;
  initiationCalendar: EnvironmentCheck;
  emailDelivery: EnvironmentCheck;
  admin: EnvironmentCheck;
  ops: EnvironmentCheck;
};

function check(names: readonly string[]): EnvironmentCheck {
  const missing = names.filter(name => !process.env[name]?.trim());
  return { configured: missing.length === 0, missing };
}

export function getEnvironmentOverview(): EnvironmentOverview {
  const smtp = check(["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"]);
  const brevo = check(["BREVO_API_KEY", "EMAIL_FROM"]);
  const emailDelivery = check(["EMAIL_TO"]);
  if (!smtp.configured && !brevo.configured) {
    emailDelivery.missing.push("SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_PASS|EMAIL_FROM or BREVO_API_KEY|EMAIL_FROM");
    emailDelivery.configured = false;
  }
  return {
    publicSite: check(["NEXT_PUBLIC_SITE_URL"]),
    competitions: check(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]),
    initiationCalendar: check(["INITIATION_CALENDAR_ICS_URL"]),
    emailDelivery,
    admin: check(["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]),
    ops: check(["OPS_CRON_TOKEN"]),
  };
}

export function getPublicEnvironmentStatus(overview: EnvironmentOverview) {
  const services = {
    publicSite: overview.publicSite.configured,
    competitions: overview.competitions.configured,
    initiationCalendar: overview.initiationCalendar.configured,
    emailDelivery: overview.emailDelivery.configured,
    admin: overview.admin.configured,
  };
  return { status: Object.values(services).every(Boolean) ? "ok" as const : "degraded" as const, services };
}
