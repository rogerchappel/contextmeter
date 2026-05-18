export type OutputFormat = "markdown" | "json";

export type BudgetStatus = "ok" | "over";

export interface CategoryConfig {
  name: string;
  globs: string[];
  maxTokens?: number | undefined;
}

export interface ContextMeterConfig {
  include?: string[] | undefined;
  exclude?: string[] | undefined;
  maxTokens?: number | undefined;
  maxFileTokens?: number | undefined;
  categories?: CategoryConfig[] | undefined;
}

export interface NormalizedCategory {
  name: string;
  globs: string[];
  maxTokens?: number | undefined;
}

export interface NormalizedConfig {
  root: string;
  include: string[];
  exclude: string[];
  maxTokens?: number | undefined;
  maxFileTokens?: number | undefined;
  categories: NormalizedCategory[];
}

export interface FileMetrics {
  path: string;
  category: string;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number | undefined;
  status: BudgetStatus;
}

export interface CategoryMetrics {
  name: string;
  files: number;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number | undefined;
  status: BudgetStatus;
}

export interface ScanSummary {
  files: number;
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
  maxTokens?: number | undefined;
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
