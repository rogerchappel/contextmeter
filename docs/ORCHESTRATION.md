# contextmeter - ORCHESTRATION.md

## Sub-agent build plan

This project follows the standard StackForge OSS CLI build pattern:

1. Wave 0 (done by scaffold): Baseline project structure
- [ ] Implement ContextAnalyzer: identify redundant content across files
2. Wave 1: Token counter with tiktoken-compatible encoding
3. Wave 2: Context analyzer with deduplication and waste detection
4. Wave 3: Overflow simulator with pruning suggestions
5. Wave 4: Polish, README, smoke tests, CI

## Verification commands

```bash
npm test          # Unit tests
npm run build     # TypeScript compilation
bash scripts/validate.sh  # Full validation pipeline
contextmeter count fixtures/   # Real smoke test
```

## Commit target

~30-50 atomic commits. Split by: scaffold, token counter, analyzer, simulator, tests, reporting, docs, CLI commands.
