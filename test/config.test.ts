import assert from "node:assert/strict";
import test from "node:test";
import { parseConfig } from "../src/config-schema.js";

test("parseConfig accepts category budgets", () => {
  const config = parseConfig({
    maxTokens: 100,
    maxFileTokens: 50,
    categories: [{ name: "docs", globs: ["docs/**/*.md"], maxTokens: 80 }]
  });

  assert.equal(config.maxTokens, 100);
  assert.equal(config.maxFileTokens, 50);
  assert.equal(config.categories?.[0]?.name, "docs");
});

test("parseConfig rejects invalid category globs", () => {
  assert.throws(
    () => parseConfig({ categories: [{ name: "docs", globs: "docs/**/*.md" }] }),
    /globs must be an array/
  );
});
