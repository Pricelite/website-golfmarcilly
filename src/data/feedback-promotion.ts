// Accès flottant temporaire : jusqu'au 4 décembre 2026 inclus, heure de Paris.
export const feedbackPromotionEndsAt = Date.parse("2026-12-05T00:00:00+01:00");

export function isFeedbackPromotionActive(now = Date.now()) {
  return now < feedbackPromotionEndsAt;
}
