import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });
import { getRestaurantReservationEnv } from "../env";

test("restaurant requests default to the golf address independently of general contact", () => {
  process.env.RESTAURANT_RESERVATION_EMAIL_TO = "";
  process.env.EMAIL_TO = "contact@example.com";
  assert.equal(getRestaurantReservationEnv().restaurantReservationTo, "golf@marcilly.com");
});

test("restaurant recipient can be configured explicitly and must be valid", () => {
  process.env.RESTAURANT_RESERVATION_EMAIL_TO = "golf@marcilly.com";
  assert.equal(getRestaurantReservationEnv().restaurantReservationTo, "golf@marcilly.com");
  process.env.RESTAURANT_RESERVATION_EMAIL_TO = "invalid";
  assert.throws(() => getRestaurantReservationEnv());
});
