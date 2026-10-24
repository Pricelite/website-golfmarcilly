export type InitiationMealOption = "WITH_MEAL" | "WITHOUT_MEAL";

export const INITIATION_PRICE_PER_PERSON_CENTS: Record<
  InitiationMealOption,
  number
> = {
  WITH_MEAL: 4800,
  WITHOUT_MEAL: 2500,
};
