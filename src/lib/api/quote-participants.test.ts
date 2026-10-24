import assert from "node:assert/strict";
import test from "node:test";
import { isValidQuoteParticipants } from "./quote-participants";

test("quote participants must be a positive safe integer in decimal notation", () => {
  for (const value of ["1", "25", "9007199254740991"]) assert.equal(isValidQuoteParticipants(value), true, value);
  for (const value of ["", "0", "-1", "1.5", "abc", "1e3", "+1", "01", "1\n", "9007199254740992", "9".repeat(100)]) {
    assert.equal(isValidQuoteParticipants(value), false, value);
  }
});
