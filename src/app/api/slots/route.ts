import { NextResponse } from "next/server";

import {
  getGoogleCalendarSlotAvailability,
  getMissingGoogleCalendarEnv,
  hasGoogleCalendarEnv,
} from "@/lib/initiation/google-calendar";

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } }
  );
}

export async function GET() {
  try {
    if (!hasGoogleCalendarEnv()) {
      const missingEnv = getMissingGoogleCalendarEnv();
      return NextResponse.json(
        {
          ok: false,
          error: `Server configuration is incomplete. Missing env var: ${missingEnv.join(", ")}.`,
        },
        { status: 503 }
      );
    }
    const availability = await getGoogleCalendarSlotAvailability();

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
        ? /Missing required env var:\s*([A-Z0-9_,\s]+)/.exec(message)
        : null;
    const publicError = missingEnvMatch
      ? `Server configuration is incomplete. Missing env var: ${missingEnvMatch[1]}.`
      : "Unable to list slots.";

    console.error("[api/slots] failed", { message });
    return NextResponse.json(
      { ok: false, error: publicError },
      { status: missingEnvMatch ? 503 : 500 }
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
