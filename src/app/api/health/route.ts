import { NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/env";

export function GET() {
  try {
    getSupabaseEnv();

    return NextResponse.json(
      { status: "ok", supabaseConfigured: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ] as const;
    const missing = required.filter((key) => !process.env[key]);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Supabase env vars missing. Configure in .env.local and Vercel Project Settings > Environment Variables.";

    return NextResponse.json(
      {
        status: "error",
        supabaseConfigured: false,
        message,
        missing,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
