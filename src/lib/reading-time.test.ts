import assert from "node:assert/strict";
import test from "node:test";
import { readingTime } from "./reading-time";
import { posts } from "../data/posts";

test("reading times use the same 200 word rule for cards and articles", () => {
  assert.equal(readingTime("", "", []), "1 min");
  assert.equal(readingTime("", "", ["mot ".repeat(200)]), "1 min");
  assert.equal(readingTime("Titre", "", ["mot ".repeat(200)]), "2 min");
  for (const post of posts) assert.equal(post.readingTime, readingTime(post.title, post.excerpt, post.content));
});
