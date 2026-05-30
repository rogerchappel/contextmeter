# ContextMeter

> 🔍 Count, analyze, and optimize your codebase for LLM context windows.

**ContextMeter** is a CLI tool that helps you understand how much of an LLM's context window your codebase consumes. It identifies duplication, boilerplate, and verbose content so you can trim your files into context more efficiently.

## Why?

When you paste a codebase into an LLM, every token counts. ContextMeter tells you:

- **How many tokens** your files will consume (tiktoken-compatible estimation)
- **Where redundancy lives** — duplicate content across files
- **What to trim first** — boilerplate, long comments, stale TODOs
- **If it fits** — simulate overflow against any model's context window

## Installation

```sh
npm install -g contextmeter
```

## Quick Start

```sh
# Count tokens in your project
contextmeter count .

# Find redundant content
contextmeter analyze .

# Will it fit in GPT-4's context window?
contextmeter simulate . --model gpt-4
contextmeter simulate . --limit 16384
```

For automation, add `--json` to `count`, `analyze`, `simulate`, or `report`.

## Commands

| Command | Description |
|---------|-------------|
| `count <path>` | Count tokens across a file or directory |
| `analyze <path>` | Analyze for redundancy, boilerplate, and stale references |
| `simulate <path>` | Simulate context window overflow with pruning strategies |
| `report <path>` | Combined report: token count + analysis + simulation |

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

- **combined** — Proportional truncation + low-value removal (default)
- **truncate** — Proportionally reduce every file
- **remove-low-value** — Remove smallest files first
- **remove-boilerplate** — Strip license headers and generated comments
- **deduplicate** — Account for shared content across files

## Development

```sh
git clone https://github.com/rogerchappel/contextmeter.git
cd contextmeter
npm install
npm test
npm run release:check
```

## License

MIT — see [LICENSE](LICENSE)
