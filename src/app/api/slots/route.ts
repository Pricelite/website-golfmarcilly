import { NextResponse } from "next/server";

import { ensureAndListSlotAvailability, markExpiredPendingReservations } from "@/lib/initiation/db";
import { buildAllowedWeekendSlots } from "@/lib/initiation/time";

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } }
  );
}

export async function GET() {
  try {
    await markExpiredPendingReservations();
    const slots = buildAllowedWeekendSlots();
    const availability = await ensureAndListSlotAvailability({ slots });

    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        slots: availability,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/slots] failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { ok: false, error: "Unable to list slots." },
      { status: 500 }
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

