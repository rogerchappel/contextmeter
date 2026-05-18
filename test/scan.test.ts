import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "../src/config.js";
import { scan } from "../src/scanner.js";

async function makeRepo(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contextmeter-"));
  await fs.mkdir(path.join(root, "docs"), { recursive: true });
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.writeFile(path.join(root, "docs", "guide.md"), "one two three four five\n");
  await fs.writeFile(path.join(root, "src", "index.ts"), "export const value = 1;\n");
  await fs.writeFile(path.join(root, "contextmeter.json"), JSON.stringify({
    maxTokens: 3,
    maxFileTokens: 4,
    categories: [
      { name: "docs", globs: ["docs/**/*.md"], maxTokens: 4 },
      { name: "source", globs: ["src/**/*.ts"], maxTokens: 20 }
    ]
  }));
  return root;
}

test("scan groups configured globs and flags budgets", async () => {
  const root = await makeRepo();
  const config = await loadConfig({ root });
  const report = await scan(config);

  assert.equal(report.summary.files, 2);
  assert.equal(report.summary.status, "over");
  assert.equal(report.categories.find((category) => category.name === "docs")?.status, "over");
  assert.equal(report.files.find((file) => file.path === "docs/guide.md")?.status, "over");
});
