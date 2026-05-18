# ContextMeter Tasks

## MVP

- [x] Define deterministic token, byte, and line metrics.
- [x] Load `contextmeter.json` with include, exclude, category, total, and file budgets.
- [x] Support CLI glob overrides for ad hoc scans.
- [x] Group file metrics by category.
- [x] Flag files, categories, and total reports over budget.
- [x] Output Markdown and JSON reports.
- [x] Add docs-heavy and source-heavy fixtures.
- [x] Cover metrics, config, scanner, reporter, and CLI behavior with tests.
- [x] Add real CLI smoke commands through `npm run smoke`.
- [x] Document installation, configuration, usage, safety, and contribution flow.

## Next

- [ ] Add optional report output files with `--output`.
- [ ] Add SARIF or GitHub annotation output for CI.
- [ ] Add ignore-file support for teams that want a dedicated context ignore list.
- [ ] Publish npm package after repository settings and maintainer security contact are finalized.
