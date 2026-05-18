import assert from "node:assert/strict";
import test from "node:test";
import { renderReport } from "../src/reporter.js";
import type { ScanReport } from "../src/types.js";

const report: ScanReport = {
  root: "/tmp/example",
  generatedAt: "2026-05-19T00:00:00.000Z",
  summary: { files: 1, bytes: 10, lines: 1, nonEmptyLines: 1, tokens: 4, maxTokens: 3, status: "over" },
  categories: [{ name: "docs", files: 1, bytes: 10, lines: 1, nonEmptyLines: 1, tokens: 4, maxTokens: 3, status: "over" }],
  files: [{ path: "README.md", category: "docs", bytes: 10, lines: 1, nonEmptyLines: 1, tokens: 4, maxTokens: 3, status: "over" }],
  warnings: ["Total context over budget"]
};

test("renderReport emits JSON", () => {
  const rendered = renderReport(report, "json");
  assert.equal(JSON.parse(rendered).summary.status, "over");
});

test("renderReport emits Markdown tables and warnings", () => {
  const rendered = renderReport(report, "markdown");
  assert.match(rendered, /# ContextMeter Report/);
  assert.match(rendered, /Total context over budget/);
  assert.match(rendered, /README.md/);
});
