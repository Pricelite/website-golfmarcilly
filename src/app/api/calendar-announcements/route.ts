import { NextRequest, NextResponse } from "next/server";
import { mapPlanningEventsToAnnouncementItems } from "@/lib/calendar-announcement-items";
import { getUpcomingPlanningAnnouncements } from "@/lib/calendar-announcements";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const daysAhead = parsePositiveInt(
    request.nextUrl.searchParams.get("daysAhead"),
    7
  );
  const limit = parsePositiveInt(request.nextUrl.searchParams.get("limit"), 20);

  const events = await getUpcomingPlanningAnnouncements({ daysAhead, limit });
  const announcements = mapPlanningEventsToAnnouncementItems(events);

  return NextResponse.json(
    { announcements, daysAhead, limit },
    { headers: { "Cache-Control": "no-store" } }
  );
}
