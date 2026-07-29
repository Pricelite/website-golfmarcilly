import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/api/logging";
import { mapPlanningEventsToAnnouncementItems } from "@/lib/calendar-announcement-items";
import { getUpcomingPlanningAnnouncements } from "@/lib/calendar-announcements";

function parsePositiveInt(
  value: string | null,
  fallback: number,
  max: number
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const daysAhead = parsePositiveInt(
    request.nextUrl.searchParams.get("daysAhead"),
    7,
    30
  );
  const limit = parsePositiveInt(
    request.nextUrl.searchParams.get("limit"),
    20,
    50
  );

  try {
    const events = await getUpcomingPlanningAnnouncements({ daysAhead, limit });
    const announcements = mapPlanningEventsToAnnouncementItems(events);

    return NextResponse.json(
      { announcements, daysAhead, limit },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    logApiError("api/calendar-announcements", "load_failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });

    return NextResponse.json(
      { ok: false, error: "Unable to load calendar announcements." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
