import assert from "node:assert/strict";
import test from "node:test";
import { formatSchoolEnquiry, parseSchoolEnquiry } from "./school-enquiry";

const valid = {
  guardianFirstName: " Camille ",
  guardianLastName: " Martin ",
  email: " CAMILLE@EXAMPLE.FR ",
  phone: "06 00 00 00 00",
  childFirstName: "Lou",
  childAge: 9,
  program: "loisir",
  preferredSlot: "Mercredi : 14 h – 15 h",
  notes: "Une séance d’essai souhaitée.",
};

test("la demande école de golf valide le groupe et le créneau côté serveur", () => {
  const enquiry = parseSchoolEnquiry(valid);
  assert.ok(enquiry);
  assert.equal(enquiry.email, "camille@example.fr");
  assert.match(formatSchoolEnquiry(enquiry), /Groupe souhaité : Loisir/);
  assert.equal(parseSchoolEnquiry({ ...valid, program: "autre" }), null);
  assert.equal(parseSchoolEnquiry({ ...valid, preferredSlot: "Vendredi : 21 h" }), null);
});

test("la demande école de golf refuse les âges et champs invalides", () => {
  assert.equal(parseSchoolEnquiry({ ...valid, childAge: 3 }), null);
  assert.equal(parseSchoolEnquiry({ ...valid, childAge: 19 }), null);
  assert.equal(parseSchoolEnquiry({ ...valid, childAge: "9" }), null);
  assert.equal(parseSchoolEnquiry({ ...valid, childFirstName: "" }), null);
  assert.equal(parseSchoolEnquiry({ ...valid, notes: "a".repeat(2001) }), null);
});
