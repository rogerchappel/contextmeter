export type OutputFormat = "markdown" | "json";

export type BudgetStatus = "ok" | "over";

export interface CategoryConfig {
  name: string;
  globs: string[];
  maxTokens?: number;
}

export interface ContextMeterConfig {
  include?: string[];
  exclude?: string[];
  maxTokens?: number;
  categories?: CategoryConfig[];
}

export interface NormalizedCategory {
  name: string;
  globs: string[];
  maxTokens?: number;
}

export interface NormalizedConfig {
  root: string;
  include: string[];
  exclude: string[];
  maxTokens?: number;
  categories: NormalizedCategory[];
}

export interface FileMetrics {
  path: string;
  category: string;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number;
  status: BudgetStatus;
}

export interface CategoryMetrics {
  name: string;
  files: number;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number;
  status: BudgetStatus;
}

export interface ScanSummary {
  files: number;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number;
  status: BudgetStatus;
}

export interface ScanReport {
  root: string;
  generatedAt: string;
  summary: ScanSummary;
  categories: CategoryMetrics[];
  files: FileMetrics[];
  warnings: string[];
}
