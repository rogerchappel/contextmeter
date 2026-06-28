# ContextMeter Social Hooks

Grounded draft posts for the fixture-backed context budget demo.

## Hooks

1. Before pasting a repo into an LLM, run `contextmeter count .` to see which
   files are consuming the prompt budget.
2. ContextMeter turns a local codebase into count, analysis, and simulation
   reports without uploading source.
3. The new demo writes `count.json`, `analyze.json`, and `simulate.json` for a
   small fixture codebase, so the workflow is easy to inspect and repeat.
4. `contextmeter simulate fixtures/codebase --limit 2000 --json` gives a quick
   fit/no-fit signal for a chosen context budget.

## Demo CTA

```sh
npm run build
bash demo/run-context-budget.sh
```

## Video Beats

1. Open `fixtures/codebase` and show the four files being measured.
2. Run the demo script.
3. Show `count.json` with the highest-token file first.
4. Show `analyze.json` for findings and suggestions.
5. Show `simulate.json` confirming the fixture fits a 2,000-token budget.

## Guardrails

- Do not present token estimates as exact provider billing counts.
- Do not claim automatic optimization; ContextMeter reports and simulates so a
  human can decide what to trim.
- Keep the privacy claim scoped to local file scanning.
