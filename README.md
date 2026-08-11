# ContextMeter

> 🔍 Count, analyze, and optimize your codebase for LLM context windows.

**ContextMeter** is a CLI tool that helps you understand how much of an LLM's context window your codebase consumes. It identifies duplication, boilerplate, and verbose content so you can trim your files into context more efficiently.


## Quickstart

Run the tool from a fresh checkout:

```sh
npm install
npm run build
node dist/cli.js --help
npm test
```

The help command is a quick smoke test for the CLI entrypoint, and `npm test` runs the committed regression suite before you depend on the output.

## Why?

When you paste a codebase into an LLM, every token counts. ContextMeter tells you:

- **How many tokens** your files will consume (tiktoken-compatible estimation)
- **Where redundancy lives** — duplicate content across files
- **What to trim first** — boilerplate, long comments, and stale maintenance markers
- **If it fits** — simulate overflow against any model's context window

## Installation

ContextMeter is not currently published to npm. Install it from a checkout:

```sh
git clone https://github.com/rogerchappel/contextmeter.git
cd contextmeter
npm install
npm run build
node dist/cli.js --help
```

## Quick Start

```sh
# Count tokens in your project
node dist/cli.js count .

# Find redundant content
node dist/cli.js analyze .

# Will it fit in GPT-4's context window?
node dist/cli.js simulate . --model gpt-4
node dist/cli.js simulate . --limit 16384
```

For automation, add `--json` to `count`, `analyze`, `simulate`, or `report`.

## Commands

| Command | Description |
|---------|-------------|
| `count <path>` | Count tokens across a file or directory |
| `analyze <path>` | Analyze a file or directory for redundancy, boilerplate, and stale references |
| `simulate <path>` | Simulate context window overflow for a file or directory |
| `report <path>` | Combined report for a file or directory: token count + analysis + simulation |

## Flags

- `--json` — Output results as JSON for piping/automation
- `--limit <n>` — Set custom token limit for simulation
- `--model <name>` — Use preset: `gpt-4`, `gpt-4o`, `claude-3-sonnet`, `gemini-1.5-pro`, etc.

## Example Output

```
ContextMeter - Token Count
--------------------------------------------------
Scanned: 45 files (2 binary, skipped)
Total tokens: 12,847

Top files by token usage:
  src/core/analyzer.ts                     3,210 tokens (25.0%)
  src/utils/parser.ts                        2,100 tokens (16.3%)
```

## Supported Languages

TypeScript, JavaScript, Python, Go, Rust, Java, C, C++, Ruby, PHP, Swift, Kotlin, and 20+ more. ContextMeter uses language-specific token estimation ratios for better accuracy.

## Pruning Strategies

When context overflows, ContextMeter simulates different approaches:

- **combined** — Truncate files against the remaining context budget, then remove low-value files when budget remains (default)
- **truncate** — Reduce each file according to the remaining context budget
- **remove-low-value** — Remove smallest files first
- **remove-boilerplate** — Strip license headers and generated comments
- **deduplicate** — Account for shared content across files

## Limitations and Safety

ContextMeter is a planning tool, not an exact tokenizer for every provider or
model version. Token counts are estimates, model presets can change, and command
output may include local file paths or repository details. Review
[accuracy and safety notes](docs/accuracy-and-safety.md) before using results as
a release gate or sharing JSON output outside the repository.

## Development

```sh
git clone https://github.com/rogerchappel/contextmeter.git
cd contextmeter
npm install
npm test
npm run check
npm run lint
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

`release:check` builds the TypeScript CLI, runs the fixture-backed tests and
smoke commands, and finishes with `npm pack --dry-run` so package contents stay
visible before tagging or publishing.
## License

MIT — see [LICENSE](LICENSE)
