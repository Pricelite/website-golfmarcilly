import { NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/env";

export function GET() {
  const requiredPublicEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const requiredInitiationCalendarEnv = [
    "GOOGLE_CALENDAR_CLIENT_EMAIL",
    "GOOGLE_CALENDAR_PRIVATE_KEY",
  ] as const;
  const optionalPaymentEnv = [
    "SUMUP_API_KEY",
    "SUMUP_MERCHANT_CODE",
    "APP_BASE_URL",
  ] as const;
  const missingPublic = requiredPublicEnv.filter((key) => !process.env[key]);
  const missingInitiationCalendar = requiredInitiationCalendarEnv.filter(
    (key) => !process.env[key]
  );
  const missingPaymentEnv = optionalPaymentEnv.filter((key) => !process.env[key]);

  try {
    getSupabaseEnv();

    if (missingPublic.length > 0 || missingInitiationCalendar.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          supabaseConfigured: missingPublic.length === 0,
          initiationCalendarConfigured: missingInitiationCalendar.length === 0,
          paymentConfigured: missingPaymentEnv.length === 0,
          missing: [...missingPublic, ...missingInitiationCalendar],
          optionalMissing: missingPaymentEnv,
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        supabaseConfigured: true,
        initiationCalendarConfigured: true,
        paymentConfigured: missingPaymentEnv.length === 0,
        optionalMissing: missingPaymentEnv,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Supabase env vars missing. Configure in .env.local and Vercel Project Settings > Environment Variables.";

    return NextResponse.json(
      {
        status: "error",
        supabaseConfigured: false,
        initiationCalendarConfigured: missingInitiationCalendar.length === 0,
        paymentConfigured: missingPaymentEnv.length === 0,
        message,
        missing: [...missingPublic, ...missingInitiationCalendar],
        optionalMissing: missingPaymentEnv,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
