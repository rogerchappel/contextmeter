export interface BudgetInput {
  label: string;
  tokens: number;
  maxTokens?: number;
}

export interface BudgetResult extends BudgetInput {
  remaining: number | null;
  overBudget: boolean;
}

export function calculateBudget(input: BudgetInput): BudgetResult {
  if (input.maxTokens === undefined) {
    return {
      ...input,
      remaining: null,
      overBudget: false
    };
  }

  return {
    ...input,
    remaining: input.maxTokens - input.tokens,
    overBudget: input.tokens > input.maxTokens
  };
}
