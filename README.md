# ContextMeter

ContextMeter is a local-first TypeScript CLI that measures files before they are
packed into an agent prompt. It scans configured globs, estimates tokens with a
deterministic heuristic, reports byte and line counts, groups results by
category, and flags budgets in Markdown or JSON.

It does not call remote LLM APIs or try to match provider tokenizers exactly.
The goal is a stable local ruler for comparing context cost across runs.

## Install

```sh
npm install
npm run build
```

For local development, run the compiled CLI directly:

```sh
node dist/cli.js scan .
```

After package installation, the binary name is `contextmeter`.

## Quick Start

```sh
contextmeter scan .
contextmeter scan . --config contextmeter.json --format json
contextmeter budget 'docs/**/*.md' --max-tokens 12000
```

## Configuration

Create `contextmeter.json` in the scan root:

```json
{
  "maxTokens": 20000,
  "maxFileTokens": 5000,
  "exclude": ["**/*.snap"],
  "categories": [
    {
      "name": "docs",
      "globs": ["docs/**/*.md", "README.md"],
      "maxTokens": 8000
    },
    {
      "name": "source",
      "globs": ["src/**/*.ts"],
      "maxTokens": 12000
    }
  ]
}
```

If no config exists, ContextMeter scans `**/*` with common generated and binary
paths ignored.

## Output

Markdown output is designed for human review in terminals, pull requests, and
agent handoff notes. JSON output preserves the same report model for automation.

Reports include:

- Total files, bytes, lines, non-empty lines, and estimated tokens.
- Category totals and category budget status.
- Per-file counts and per-file budget status.
- Warnings for over-budget files, categories, and totals.

## Fixtures

Two fixture repositories are included for smoke testing:

```sh
node dist/cli.js scan fixtures/docs-heavy --config fixtures/docs-heavy/contextmeter.json
node dist/cli.js scan fixtures/source-heavy --config fixtures/source-heavy/contextmeter.json --format json
```

## Verify

```sh
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## Safety

ContextMeter reads local text files and writes reports to stdout. It does not
upload file contents, use telemetry, or mutate scanned repositories.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, add focused tests,
and run the verification commands before opening a pull request.

## License

MIT
