import type { InitiationMealOption, InitiationSlotTemplate } from "./types";

export const INITIATION_TIME_ZONE = "Europe/Paris";
export const INITIATION_MAX_DAYS_AHEAD = 7;
export const INITIATION_SLOT_CAPACITY = 12;
export const INITIATION_PENDING_TTL_MINUTES = 10;

export const INITIATION_SLOT_TEMPLATES: readonly InitiationSlotTemplate[] = [
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "14:00", endTime: "15:00" },
] as const;

export const INITIATION_PRICE_PER_PERSON_CENTS: Record<
  InitiationMealOption,
  number
> = {
  WITH_MEAL: 4800,
  WITHOUT_MEAL: 2500,
};
