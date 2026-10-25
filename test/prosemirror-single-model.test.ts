import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Keystatic's editor breaks in subtle ways (instanceof checks on Node/Mark)
// if prosemirror packages resolve different copies of prosemirror-model.
// The pnpm override in package.json pins one copy; this guards it.
const keystaticRequire = createRequire(
  realpathSync(createRequire(import.meta.url).resolve("@keystatic/core")),
);

function modelFrom(pkg: string) {
  const pkgRequire = createRequire(realpathSync(keystaticRequire.resolve(pkg)));
  return realpathSync(pkgRequire.resolve("prosemirror-model"));
}

describe("prosemirror dependency graph", () => {
  it("resolves a single prosemirror-model for every editor package", () => {
    const keystaticModel = realpathSync(keystaticRequire.resolve("prosemirror-model"));
    for (const pkg of [
      "prosemirror-view",
      "prosemirror-state",
      "prosemirror-transform",
      "prosemirror-tables",
    ]) {
      expect(modelFrom(pkg), pkg).toBe(keystaticModel);
    }
  });
});
