import { budgetStatus } from "./budget.js";
import type { CategoryMetrics, FileMetrics, ScanSummary } from "./types.js";

export function summarizeFiles(files: FileMetrics[], maxTokens: number | undefined): ScanSummary {
  const summary = files.reduce(
    (accumulator, file) => ({
      files: accumulator.files + 1,
      bytes: accumulator.bytes + file.bytes,
      lines: accumulator.lines + file.lines,
      nonEmptyLines: accumulator.nonEmptyLines + file.nonEmptyLines,
      tokens: accumulator.tokens + file.tokens
    }),
    { files: 0, bytes: 0, lines: 0, nonEmptyLines: 0, tokens: 0 }
  );

  return {
    ...summary,
    maxTokens,
    status: budgetStatus(summary.tokens, maxTokens)
  };
}

export function summarizeCategories(files: FileMetrics[], categoryBudgets: Map<string, number | undefined>): CategoryMetrics[] {
  const byCategory = new Map<string, FileMetrics[]>();

  for (const file of files) {
    byCategory.set(file.category, [...(byCategory.get(file.category) ?? []), file]);
  }

  return [...byCategory.entries()]
    .map(([name, categoryFiles]) => {
      const summary = summarizeFiles(categoryFiles, categoryBudgets.get(name));
      return {
        name,
        files: summary.files,
        bytes: summary.bytes,
        lines: summary.lines,
        nonEmptyLines: summary.nonEmptyLines,
        tokens: summary.tokens,
        maxTokens: summary.maxTokens,
        status: summary.status
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}
