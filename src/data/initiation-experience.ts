// Déroulement confirmé par le propriétaire le 17 octobre 2026.
export const initiationExperience = {
  lesson: "1 h avec un pro",
  course: "1 h 30 sur le parcours 9 trous en autonomie",
  meal: "1 h de repas à La Bergerie",
  equipment: "Matériel fourni",
  withoutMealDuration: "2 h 30",
  withMealDuration: "3 h 30",
} as const;

export function initiationInclusions(withMeal: boolean): string[] {
  return [
    initiationExperience.lesson,
    initiationExperience.course,
    ...(withMeal ? [initiationExperience.meal] : []),
    initiationExperience.equipment,
  ];
}
