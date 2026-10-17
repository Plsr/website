import assert from "node:assert/strict";
import { test } from "node:test";
import { pageCount, pageItems } from "./pagination.ts";

const items = Array.from({ length: 23 }, (_, i) => i + 1);

test("pageCount rounds up partial pages", () => {
  assert.equal(pageCount(23, 10), 3);
  assert.equal(pageCount(20, 10), 2);
  assert.equal(pageCount(1, 10), 1);
});

test("pageCount is at least one when there are no items", () => {
  assert.equal(pageCount(0, 10), 1);
});

test("pageItems returns full pages and the remainder", () => {
  assert.deepEqual(pageItems(items, 1, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(
    pageItems(items, 2, 10),
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  );
  assert.deepEqual(pageItems(items, 3, 10), [21, 22, 23]);
});

test("pageItems is empty past the last page", () => {
  assert.deepEqual(pageItems(items, 4, 10), []);
});
