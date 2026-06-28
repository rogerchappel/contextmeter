# Context Budget Demo

This recipe shows how to turn a small codebase fixture into three reviewable
artifacts: token counts, content analysis, and a context-window simulation.

## Run the demo

```sh
npm install
bash demo/run-context-budget.sh
```

The script builds the CLI, scans `fixtures/codebase`, and writes JSON outputs to
`.tmp/context-budget-demo/`.

## What to inspect

- `count.json` shows the total token estimate and per-file ranking.
- `analyze.json` captures boilerplate, duplicate groups, findings, and
  suggestions.
- `simulate.json` checks whether the fixture fits inside a 2,000-token budget.

## Why this is useful

Use this flow before pasting a repo slice into an LLM. The count output shows
which files consume the most budget, the analysis output points at low-value or
repeated content, and the simulation output gives a quick fit/no-fit signal for
a chosen context limit.

## Guardrails

- Token counts are estimates, not model-provider billing records.
- ContextMeter reads local files and does not upload project content.
- The demo fixture is intentionally small; run the same commands against a real
  repo path before making pruning decisions.
