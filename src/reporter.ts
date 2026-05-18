import { renderJson } from "./report-json.js";
import { renderMarkdown } from "./report-markdown.js";
import type { OutputFormat, ScanReport } from "./types.js";

export function renderReport(report: ScanReport, format: OutputFormat): string {
  return format === "json" ? renderJson(report) : renderMarkdown(report);
}
