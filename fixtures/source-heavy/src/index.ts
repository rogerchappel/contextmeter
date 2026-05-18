import { calculateBudget, type BudgetInput, type BudgetResult } from "./calculator";

export function summarizeBudgets(inputs: BudgetInput[]): BudgetResult[] {
  return inputs.map(calculateBudget).sort((left, right) => {
    if (left.overBudget !== right.overBudget) {
      return left.overBudget ? -1 : 1;
    }
    return left.label.localeCompare(right.label);
  });
}
