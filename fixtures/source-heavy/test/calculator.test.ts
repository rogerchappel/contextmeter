import { strict as assert } from "node:assert";
import { calculateBudget } from "../src/calculator";

const result = calculateBudget({ label: "docs", tokens: 120, maxTokens: 100 });
assert.equal(result.overBudget, true);
assert.equal(result.remaining, -20);
