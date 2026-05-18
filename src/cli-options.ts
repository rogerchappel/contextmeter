import { ContextMeterError } from "./errors.js";
import type { OutputFormat } from "./types.js";

export interface ParsedOptions {
  command: "scan" | "budget" | "help";
  root: string;
  globs: string[];
  configPath?: string | undefined;
  format: OutputFormat;
  maxTokens?: number | undefined;
  maxFileTokens?: number | undefined;
}

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new ContextMeterError(`${flag} requires a value`);
  }
  return value;
}

function parseNumber(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ContextMeterError(`${flag} must be a non-negative number`);
  }
  return parsed;
}

function parseFormat(value: string): OutputFormat {
  if (value === "markdown" || value === "json") {
    return value;
  }
  throw new ContextMeterError("--format must be markdown or json");
}

export function parseCliArgs(args: string[]): ParsedOptions {
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    return { command: "help", root: ".", globs: [], format: "markdown" };
  }

  const command = args[0];
  if (command !== "scan" && command !== "budget") {
    throw new ContextMeterError(`Unknown command: ${command}`);
  }

  const positionals: string[] = [];
  let configPath: string | undefined;
  let format: OutputFormat = "markdown";
  let maxTokens: number | undefined;
  let maxFileTokens: number | undefined;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index] ?? "";

    if (arg === "--config") {
      configPath = readValue(args, index, arg);
      index += 1;
    } else if (arg === "--format") {
      format = parseFormat(readValue(args, index, arg));
      index += 1;
    } else if (arg === "--max-tokens") {
      maxTokens = parseNumber(readValue(args, index, arg), arg);
      index += 1;
    } else if (arg === "--max-file-tokens") {
      maxFileTokens = parseNumber(readValue(args, index, arg), arg);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      return { command: "help", root: ".", globs: [], format: "markdown" };
    } else if (arg.startsWith("--")) {
      throw new ContextMeterError(`Unknown option: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }

  if (command === "budget") {
    if (positionals.length === 0) {
      throw new ContextMeterError("budget requires at least one glob");
    }
    return {
      command,
      root: ".",
      globs: positionals,
      configPath,
      format,
      maxTokens,
      maxFileTokens
    };
  }

  return {
    command,
    root: positionals[0] ?? ".",
    globs: positionals.slice(1),
    configPath,
    format,
    maxTokens,
    maxFileTokens
  };
}
