import { hasInitiationPaymentEnv } from "@/lib/initiation/env";

type EnvironmentCheck = {
  configured: boolean;
  missing: string[];
};

export type EnvironmentOverview = {
  publicSite: EnvironmentCheck;
  supabasePublic: EnvironmentCheck;
  initiationCalendar: EnvironmentCheck;
  initiationPayment: EnvironmentCheck;
  emailDelivery: EnvironmentCheck;
  admin: EnvironmentCheck;
  ops: EnvironmentCheck;
};

function getMissingVars(names: readonly string[]): string[] {
  return names.filter((name) => !process.env[name]?.trim());
}

export function getEnvironmentOverview(): EnvironmentOverview {
  const publicSiteMissing = getMissingVars(["NEXT_PUBLIC_SITE_URL"]);
  const supabasePublicMissing = getMissingVars([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  const initiationCalendarMissing = getMissingVars([
    "GOOGLE_CALENDAR_CLIENT_EMAIL",
    "GOOGLE_CALENDAR_PRIVATE_KEY",
  ]);
  const initiationPaymentMissing = hasInitiationPaymentEnv()
    ? []
    : getMissingVars(["SUMUP_API_KEY", "SUMUP_MERCHANT_CODE", "APP_BASE_URL"]);

  const emailDeliveryMissing = (() => {
    const hasSmtp =
      Boolean(process.env.SMTP_HOST?.trim()) &&
      Boolean(process.env.SMTP_PORT?.trim()) &&
      Boolean(process.env.SMTP_USER?.trim()) &&
      Boolean(process.env.SMTP_PASS?.trim()) &&
      Boolean(process.env.EMAIL_FROM?.trim());
    const hasBrevo =
      Boolean(process.env.BREVO_API_KEY?.trim()) &&
      Boolean(process.env.EMAIL_FROM?.trim());
    const hasEmailRecipient = Boolean(process.env.EMAIL_TO?.trim());

    if ((hasSmtp || hasBrevo) && hasEmailRecipient) {
      return [];
    }

    const missing = new Set<string>();
    if (!hasEmailRecipient) {
      missing.add("EMAIL_TO");
    }
    if (!hasSmtp && !hasBrevo) {
      missing.add("SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_PASS|EMAIL_FROM or BREVO_API_KEY|EMAIL_FROM");
    }

    return [...missing];
  })();

  const adminMissing = (() => {
    const missing: string[] = [];
    if (!process.env.ADMIN_PASSWORD?.trim()) {
      missing.push("ADMIN_PASSWORD");
    }
    if (!process.env.ADMIN_SESSION_SECRET?.trim()) {
      missing.push("ADMIN_SESSION_SECRET");
    }
    return missing;
  })();

  const opsMissing = getMissingVars(["OPS_CRON_TOKEN"]);

  return {
    publicSite: {
      configured: publicSiteMissing.length === 0,
      missing: publicSiteMissing,
    },
    supabasePublic: {
      configured: supabasePublicMissing.length === 0,
      missing: supabasePublicMissing,
    },
    initiationCalendar: {
      configured: initiationCalendarMissing.length === 0,
      missing: initiationCalendarMissing,
    },
    initiationPayment: {
      configured: initiationPaymentMissing.length === 0,
      missing: initiationPaymentMissing,
    },
    emailDelivery: {
      configured: emailDeliveryMissing.length === 0,
      missing: emailDeliveryMissing,
    },
    admin: {
      configured: adminMissing.length === 0,
      missing: adminMissing,
    },
    ops: {
      configured: opsMissing.length === 0,
      missing: opsMissing,
    },
  };
}

export function getPublicEnvironmentStatus(overview: EnvironmentOverview): {
  status: "ok" | "degraded";
  services: Record<string, boolean>;
} {
  const services = {
    publicSite: overview.publicSite.configured,
    supabasePublic: overview.supabasePublic.configured,
    initiationCalendar: overview.initiationCalendar.configured,
    initiationPayment: overview.initiationPayment.configured,
    emailDelivery: overview.emailDelivery.configured,
  };

  return {
    status: Object.values(services).every(Boolean) ? "ok" : "degraded",
    services,
  };
}
