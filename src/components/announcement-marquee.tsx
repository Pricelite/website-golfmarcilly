import AnnouncementMarqueeClient from "@/components/announcement-marquee-client";
import { mapPlanningEventsToAnnouncementItems } from "@/lib/calendar-announcement-items";
import { getUpcomingPlanningAnnouncements } from "@/lib/calendar-announcements";

export default async function AnnouncementMarquee() {
  const events = await getUpcomingPlanningAnnouncements({ daysAhead: 7 });
  const initialItems = mapPlanningEventsToAnnouncementItems(events);

  return <AnnouncementMarqueeClient initialItems={initialItems} />;
}
