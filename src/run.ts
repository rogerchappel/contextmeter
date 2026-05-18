import path from "node:path";
import { loadConfig } from "./config.js";
import { parseCliArgs } from "./cli-options.js";
import { ContextMeterError } from "./errors.js";
import { renderHelp } from "./help.js";
import { renderReport } from "./reporter.js";
import { scan } from "./scanner.js";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function run(args: string[]): Promise<RunResult> {
  try {
    const options = parseCliArgs(args);

    if (options.command === "help") {
      return { stdout: renderHelp(), stderr: "", exitCode: 0 };
    }

    const root = path.resolve(process.cwd(), options.root);
    const config = await loadConfig({
      root,
      configPath: options.configPath,
      include: options.globs,
      maxTokens: options.maxTokens,
      maxFileTokens: options.maxFileTokens
    });
    const report = await scan(config);

    return {
      stdout: renderReport(report, options.format),
      stderr: "",
      exitCode: report.summary.status === "over" || report.warnings.length > 0 ? 1 : 0
    };
  } catch (error) {
    const message = error instanceof ContextMeterError ? error.message : (error as Error).message;
    return { stdout: "", stderr: `Error: ${message}\n`, exitCode: 2 };
  }
}
