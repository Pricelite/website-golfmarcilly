import assert from "node:assert/strict";
import test from "node:test";
import { isFeedbackPromotionActive } from "./feedback-promotion";

test("l'accès flottant expire après le 4 décembre inclus à Paris et ne revient pas l'année suivante", () => {
  assert.equal(isFeedbackPromotionActive(Date.parse("2026-12-04T23:59:59+01:00")), true);
  assert.equal(isFeedbackPromotionActive(Date.parse("2026-12-05T00:00:00+01:00")), false);
  assert.equal(isFeedbackPromotionActive(Date.parse("2027-11-04T10:00:00+01:00")), false);
});
