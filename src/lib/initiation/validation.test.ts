import assert from "node:assert/strict";
import test from "node:test";

import { parseCreateReservationPayload } from "./validation";

test("parseCreateReservationPayload computes prices for a valid reservation", () => {
  const result = parseCreateReservationPayload(
    {
      date: "2026-08-01",
      startTime: "11:00",
      fullName: "Anthony Martin",
      email: "anthony@example.com",
      phone: "+33 6 12 34 56 78",
      participantsCount: 2,
      mealOption: "WITH_MEAL",
    },
    new Date("2026-07-29T10:00:00.000Z")
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.data.endTime, "12:00");
  assert.equal(result.data.pricePerPersonCents, 4800);
  assert.equal(result.data.totalPriceCents, 9600);
});

test("parseCreateReservationPayload rejects invalid email and capacity overflow", () => {
  const badEmail = parseCreateReservationPayload(
    {
      date: "2026-08-01",
      startTime: "11:00",
      fullName: "Anthony Martin",
      email: "not-an-email",
      phone: "+33 6 12 34 56 78",
      participantsCount: 1,
      mealOption: "WITHOUT_MEAL",
    },
    new Date("2026-07-29T10:00:00.000Z")
  );

  assert.deepEqual(badEmail, {
    ok: false,
    error: "Email is invalid.",
  });

  const overflow = parseCreateReservationPayload(
    {
      date: "2026-08-01",
      startTime: "11:00",
      fullName: "Anthony Martin",
      email: "anthony@example.com",
      phone: "+33 6 12 34 56 78",
      participantsCount: 99,
      mealOption: "WITHOUT_MEAL",
    },
    new Date("2026-07-29T10:00:00.000Z")
  );

  assert.equal(overflow.ok, false);
});
