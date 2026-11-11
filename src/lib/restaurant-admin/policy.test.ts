import assert from "node:assert/strict";
import test from "node:test";
import { canManageRestaurant, RESTAURANT_ID } from "./policy";

const actor = { id: "account", email: "staff@example.com", name: "Gestionnaire", role: "restaurant_admin", restaurantId: RESTAURANT_ID, active: true };

test("l’administrateur restaurant ne gère que son restaurant tant que son compte est actif", () => {
  assert.equal(canManageRestaurant(actor, RESTAURANT_ID), true);
  assert.equal(canManageRestaurant(actor, "autre-restaurant"), false);
  assert.equal(canManageRestaurant({ ...actor, restaurantId: "autre-restaurant" }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant({ ...actor, active: false }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant({ ...actor, role: "super_admin" }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant(null, RESTAURANT_ID), false);
});
