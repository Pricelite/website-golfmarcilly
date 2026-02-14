import assert from "node:assert/strict";

import type { PlanningEvent } from "./calendar-announcements";
import { selectUpcomingPlanningEvents } from "./calendar-announcements";

const baseEvents: PlanningEvent[] = [
  {
    id: "past",
    title: "Evenement passe",
    date: "2026-03-09",
  },
  {
    id: "in-3-days",
    title: "Evenement dans 3 jours",
    date: "2026-03-13",
  },
  {
    id: "in-10-days",
    title: "Evenement dans 10 jours",
    date: "2026-03-20",
  },
];

{
  const selected = selectUpcomingPlanningEvents(baseEvents, {
    today: new Date("2026-03-10T12:00:00.000Z"),
    daysAhead: 7,
    limit: 3,
    timeZone: "Europe/Paris",
  });

  // Cases obligatoires: passe / dans 3 jours / dans 10 jours.
  assert.deepEqual(selected.map((event) => event.id), ["in-3-days"]);
}

{
  const selected = selectUpcomingPlanningEvents(
    [
      { id: "today", title: "Evenement du jour", date: "2026-03-10" },
      { id: "in-7-days", title: "Evenement dans 7 jours", date: "2026-03-17" },
    ],
    {
      today: new Date("2026-03-10T12:00:00.000Z"),
      daysAhead: 7,
      limit: 3,
      timeZone: "Europe/Paris",
    }
  );

  assert.deepEqual(selected.map((event) => event.id), ["today", "in-7-days"]);
}
