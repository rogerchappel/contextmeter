import assert from "node:assert/strict";
import test from "node:test";
import { estimateTokens, measureText } from "../src/metrics.js";

test("estimateTokens is deterministic and non-zero for text", () => {
  assert.equal(estimateTokens("hello world"), 3);
  assert.equal(estimateTokens("hello world"), estimateTokens("hello world"));
});

test("measureText counts bytes, lines, non-empty lines, and tokens", () => {
  const metrics = measureText("alpha\n\nsecond line");

  assert.equal(metrics.bytes, 18);
  assert.equal(metrics.lines, 3);
  assert.equal(metrics.nonEmptyLines, 2);
  assert.equal(metrics.tokens, 5);
});
