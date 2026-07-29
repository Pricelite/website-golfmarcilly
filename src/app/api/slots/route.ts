import { NextResponse } from "next/server";

import { ensureAndListSlotAvailability } from "@/lib/initiation/db";
import { hasInitiationPaymentEnv } from "@/lib/initiation/env";
import {
  getGoogleCalendarSlotAvailability,
  getMissingGoogleCalendarEnv,
  hasGoogleCalendarEnv,
} from "@/lib/initiation/google-calendar";
import { buildAllowedWeekendSlots } from "@/lib/initiation/time";

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } }
  );
}

export async function GET() {
  try {
    const useGoogleCalendarDirect =
      hasGoogleCalendarEnv() && !hasInitiationPaymentEnv();

    if (useGoogleCalendarDirect) {
      const availability = await getGoogleCalendarSlotAvailability();

      return NextResponse.json(
        {
          ok: true,
          generatedAt: new Date().toISOString(),
          slots: availability,
        },
        { status: 200 }
      );
    }

    const availability = await ensureAndListSlotAvailability({
      slots: buildAllowedWeekendSlots(),
    });

    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        slots: availability,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const missingEnvMatch =
      typeof message === "string"
        ? /Missing required env var:\s*([A-Z0-9_,\s]+)|Missing Supabase env vars:\s*([A-Z0-9_,\s.]+)/.exec(message)
        : null;
    const fallbackMissingEnv = !missingEnvMatch && !hasGoogleCalendarEnv()
      ? getMissingGoogleCalendarEnv()
      : [];
    const publicError = missingEnvMatch
      ? `Server configuration is incomplete. ${
          missingEnvMatch[1]
            ? `Missing env var: ${missingEnvMatch[1]}.`
            : `Missing Supabase env vars: ${missingEnvMatch[2]}.`
        }`
      : fallbackMissingEnv.length > 0
        ? `Server configuration is incomplete. Missing env var: ${fallbackMissingEnv.join(", ")}.`
      : "Unable to list slots.";

    console.error("[api/slots] failed", { message });
    return NextResponse.json(
      { ok: false, error: publicError },
      { status: missingEnvMatch || fallbackMissingEnv.length > 0 ? 503 : 500 }
    );
  }
}

export function POST() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}
