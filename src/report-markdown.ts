import path from "node:path";
import { formatBudget } from "./budget.js";
import type { ScanReport } from "./types.js";

function statusIcon(status: "ok" | "over"): string {
  return status === "ok" ? "OK" : "OVER";
}

function row(values: Array<string | number | undefined>): string {
  return `| ${values.map((value) => value ?? "").join(" | ")} |`;
}

export function renderMarkdown(report: ScanReport): string {
  const lines = [
    "# ContextMeter Report",
    "",
    `Root: \`${path.basename(report.root)}\``,
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    row(["Status", "Files", "Bytes", "Lines", "Non-empty lines", "Tokens"]),
    row(["---", "---:", "---:", "---:", "---:", "---:"]),
    row([
      statusIcon(report.summary.status),
      report.summary.files,
      report.summary.bytes,
      report.summary.lines,
      report.summary.nonEmptyLines,
      formatBudget(report.summary.tokens, report.summary.maxTokens)
    ]),
    "",
    "## Categories",
    "",
    row(["Category", "Status", "Files", "Bytes", "Lines", "Tokens"]),
    row(["---", "---", "---:", "---:", "---:", "---:"]),
    ...report.categories.map((category) => row([
      category.name,
      statusIcon(category.status),
      category.files,
      category.bytes,
      category.lines,
      formatBudget(category.tokens, category.maxTokens)
    ])),
    "",
    "## Files",
    "",
    row(["File", "Category", "Status", "Bytes", "Lines", "Tokens"]),
    row(["---", "---", "---", "---:", "---:", "---:"]),
    ...report.files.map((file) => row([
      `\`${file.path}\``,
      file.category,
      statusIcon(file.status),
      file.bytes,
      file.lines,
      formatBudget(file.tokens, file.maxTokens)
    ]))
  ];

  if (report.warnings.length > 0) {
    lines.push("", "## Warnings", "", ...report.warnings.map((warning) => `- ${warning}`));
  }

  return `${lines.join("\n")}\n`;
}
