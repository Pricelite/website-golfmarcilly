import assert from "node:assert/strict";
import test from "node:test";
import { canAccessAdminSection, canManageRestaurant, parseAdminSections, RESTAURANT_ID, type AdminSection } from "./policy";

const actor = { id: "account", email: "staff@example.com", username: null, name: "Gestionnaire", role: "restaurant_admin", restaurantId: RESTAURANT_ID, active: true, sections: ["restaurant"] as AdminSection[] };

test("l’administrateur restaurant ne gère que son restaurant tant que son compte est actif", () => {
  assert.equal(canManageRestaurant(actor, RESTAURANT_ID), true);
  assert.equal(canManageRestaurant({ ...actor, email: null, username: "marine" }, RESTAURANT_ID), true);
  assert.equal(canManageRestaurant(actor, "autre-restaurant"), false);
  assert.equal(canManageRestaurant({ ...actor, restaurantId: "autre-restaurant" }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant({ ...actor, active: false }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant({ ...actor, role: "super_admin" }, RESTAURANT_ID), false);
  assert.equal(canManageRestaurant(null, RESTAURANT_ID), false);
});

test("les droits par rubrique sont explicites, actifs et sans élévation", () => {
  const staff = { ...actor, role: "staff", sections: ["restaurant", "competitions"] as AdminSection[] };
  assert.equal(canAccessAdminSection(staff, "restaurant"), true);
  assert.equal(canAccessAdminSection(staff, "competitions"), true);
  assert.equal(canAccessAdminSection(staff, "publicites"), false);
  assert.equal(canAccessAdminSection({ ...staff, active: false }, "competitions"), false);
  assert.equal(canAccessAdminSection({ ...staff, role: "super_admin" }, "competitions"), false);
  assert.deepEqual(parseAdminSections(["restaurant", "pages"]), ["restaurant", "pages"]);
  assert.equal(parseAdminSections(["restaurant", "restaurant"]), null);
  assert.equal(parseAdminSections(["users"]), null);
});
