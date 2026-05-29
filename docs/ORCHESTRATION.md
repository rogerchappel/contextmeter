# contextmeter - ORCHESTRATION.md

## Sub-agent build plan

This project follows the standard StackForge OSS CLI build pattern:

- [x] Wave 0: Baseline project structure
- [x] Wave 1: Token counter with tiktoken-compatible encoding
- [x] Wave 2: Context analyzer with deduplication and waste detection
- [x] Wave 3: Overflow simulator with pruning suggestions
- [x] Wave 4: Polish, README, smoke tests, CI

## Release candidate status

Classification: ship

The initial public build is ready for release review when the local validation
gates pass. The CLI remains intentionally local-only and uses deterministic
token estimation rather than model API calls.

Known limitations:

- Token counts are calibrated estimates, not exact vendor tokenizer output.
- Analyzer findings are heuristic and should be treated as guidance.
- Overflow simulation models pruning impact; it does not rewrite files.

## Verification commands

```bash
npm test          # Unit tests
npm run check     # TypeScript type check
npm run build     # TypeScript compilation
npm run smoke     # CLI count/analyze/simulate smoke test
bash scripts/validate.sh  # Full validation pipeline
contextmeter count fixtures/   # Real smoke test
```

## Commit target

Atomic commits by area: scaffold, token counter, analyzer, simulator, tests,
reporting, docs, CLI commands, release readiness.
