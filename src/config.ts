import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_CATEGORY, DEFAULT_CONFIG_FILE, DEFAULT_EXCLUDE, DEFAULT_INCLUDE } from "./defaults.js";
import { ContextMeterError } from "./errors.js";
import { parseConfig } from "./config-schema.js";
import type { ContextMeterConfig, NormalizedConfig } from "./types.js";

export interface LoadConfigOptions {
  root: string;
  configPath?: string;
  include?: string[];
  maxTokens?: number;
  maxFileTokens?: number;
}

async function readConfigFile(root: string, configPath?: string): Promise<ContextMeterConfig> {
  const filePath = path.resolve(root, configPath ?? DEFAULT_CONFIG_FILE);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return parseConfig(JSON.parse(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" && configPath === undefined) {
      return {};
    }
    if (error instanceof SyntaxError) {
      throw new ContextMeterError(`Invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

export async function loadConfig(options: LoadConfigOptions): Promise<NormalizedConfig> {
  const config = await readConfigFile(options.root, options.configPath);
  const include = options.include && options.include.length > 0
    ? options.include
    : (config.include && config.include.length > 0 ? config.include : DEFAULT_INCLUDE);
  const categories = config.categories && config.categories.length > 0
    ? config.categories
    : [{ name: DEFAULT_CATEGORY, globs: include }];

  return {
    root: options.root,
    include,
    exclude: [...DEFAULT_EXCLUDE, ...(config.exclude ?? [])],
    maxTokens: options.maxTokens ?? config.maxTokens,
    maxFileTokens: options.maxFileTokens ?? config.maxFileTokens,
    categories: categories.map((category) => ({
      name: category.name,
      globs: category.globs,
      maxTokens: category.maxTokens
    }))
  };
}
