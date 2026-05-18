export function renderHelp(): string {
  return `ContextMeter measures local files against deterministic token budgets.

Usage:
  contextmeter scan [root] [globs...] [options]
  contextmeter budget <globs...> --max-tokens <count> [options]

Options:
  --config <path>          Read contextmeter.json from the scan root
  --format <markdown|json> Output format (default: markdown)
  --max-tokens <count>     Override total token budget
  --max-file-tokens <n>    Override per-file token budget
  -h, --help               Show this help

Examples:
  contextmeter scan .
  contextmeter scan . --config contextmeter.json --format json
  contextmeter budget 'docs/**/*.md' --max-tokens 12000
`;
}
