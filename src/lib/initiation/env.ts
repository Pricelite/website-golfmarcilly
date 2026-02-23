import "server-only";

export type InitiationPaymentEnv = {
  sumupApiKey: string;
  sumupMerchantCode: string;
  appBaseUrl: string;
  sumupApiBaseUrl: string;
  sumupWebhookSecret?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getInitiationPaymentEnv(): InitiationPaymentEnv {
  return {
    sumupApiKey: getRequiredEnv("SUMUP_API_KEY"),
    sumupMerchantCode: getRequiredEnv("SUMUP_MERCHANT_CODE"),
    appBaseUrl: getRequiredEnv("APP_BASE_URL").replace(/\/+$/, ""),
    sumupApiBaseUrl:
      process.env.SUMUP_API_BASE_URL?.trim().replace(/\/+$/, "") ||
      "https://api.sumup.com",
    sumupWebhookSecret: process.env.SUMUP_WEBHOOK_SECRET?.trim() || undefined,
  };
}

export function getAdminPassword(): string {
  return getRequiredEnv("ADMIN_PASSWORD");
}

