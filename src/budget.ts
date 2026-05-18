import type { BudgetStatus } from "./types.js";

export function budgetStatus(tokens: number, maxTokens: number | undefined): BudgetStatus {
  return maxTokens !== undefined && tokens > maxTokens ? "over" : "ok";
}

export function formatBudget(tokens: number, maxTokens: number | undefined): string {
  return maxTokens === undefined ? String(tokens) : `${tokens}/${maxTokens}`;
}
