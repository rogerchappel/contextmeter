import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { run } from "../src/run.js";

test("run returns help output", async () => {
  const result = await run(["--help"]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /contextmeter scan/);
});

test("run emits JSON and a non-zero exit for over-budget scans", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "contextmeter-cli-"));
  await fs.writeFile(path.join(root, "notes.md"), "alpha beta gamma delta epsilon");

  const cwd = process.cwd();
  process.chdir(root);
  try {
    const result = await run(["budget", "*.md", "--max-tokens", "2", "--format", "json"]);
    assert.equal(result.exitCode, 1);
    assert.equal(JSON.parse(result.stdout).summary.status, "over");
  } finally {
    process.chdir(cwd);
  }
});
