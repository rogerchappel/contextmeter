import { ContextMeterError } from "./errors.js";
import type { CategoryConfig, ContextMeterConfig } from "./types.js";

function assertStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ContextMeterError(`${field} must be an array of strings`);
  }
  return value;
}

function assertNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ContextMeterError(`${field} must be a non-negative number`);
  }
  return value;
}

function parseCategory(value: unknown, index: number): CategoryConfig {
  if (typeof value !== "object" || value === null) {
    throw new ContextMeterError(`categories[${index}] must be an object`);
  }

  const source = value as Record<string, unknown>;
  if (typeof source.name !== "string" || source.name.trim().length === 0) {
    throw new ContextMeterError(`categories[${index}].name must be a non-empty string`);
  }

  const globs = assertStringArray(source.globs, `categories[${index}].globs`);
  if (!globs || globs.length === 0) {
    throw new ContextMeterError(`categories[${index}].globs must contain at least one glob`);
  }

  return {
    name: source.name,
    globs,
    maxTokens: assertNumber(source.maxTokens, `categories[${index}].maxTokens`)
  };
}

export function parseConfig(value: unknown): ContextMeterConfig {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContextMeterError("contextmeter config must be a JSON object");
  }

  const source = value as Record<string, unknown>;
  const categoriesValue = source.categories;

  return {
    include: assertStringArray(source.include, "include"),
    exclude: assertStringArray(source.exclude, "exclude"),
    maxTokens: assertNumber(source.maxTokens, "maxTokens"),
    maxFileTokens: assertNumber(source.maxFileTokens, "maxFileTokens"),
    categories: categoriesValue === undefined
      ? undefined
      : Array.isArray(categoriesValue)
        ? categoriesValue.map(parseCategory)
        : (() => {
          throw new ContextMeterError("categories must be an array");
        })()
  };
}
