import fs from "node:fs/promises";
import path from "node:path";
import { budgetStatus } from "./budget.js";
import { summarizeCategories, summarizeFiles } from "./aggregate.js";
import { matchFiles } from "./globs.js";
import { measureText } from "./metrics.js";
import type { FileMetrics, NormalizedConfig, ScanReport } from "./types.js";

async function measureFile(root: string, relativeFilePath: string, category: string, maxFileTokens: number | undefined): Promise<FileMetrics> {
  const content = await fs.readFile(path.join(root, relativeFilePath), "utf8");
  const metrics = measureText(content);

  return {
    path: relativeFilePath,
    category,
    ...metrics,
    maxTokens: maxFileTokens,
    status: budgetStatus(metrics.tokens, maxFileTokens)
  };
}

export async function scan(config: NormalizedConfig): Promise<ScanReport> {
  const matches = await matchFiles(config);
  const files = await Promise.all(
    matches.map((match) => measureFile(config.root, match.path, match.category.name, config.maxFileTokens))
  );
  const categoryBudgets = new Map(config.categories.map((category) => [category.name, category.maxTokens] as const));
  const categories = summarizeCategories(files, categoryBudgets);
  const summary = summarizeFiles(files, config.maxTokens);
  const warnings = [
    ...files.filter((file) => file.status === "over").map((file) => `File over budget: ${file.path}`),
    ...categories.filter((category) => category.status === "over").map((category) => `Category over budget: ${category.name}`),
    ...(summary.status === "over" ? ["Total context over budget"] : [])
  ];

  return {
    root: config.root,
    generatedAt: new Date().toISOString(),
    summary,
    categories,
    files,
    warnings
  };
}
