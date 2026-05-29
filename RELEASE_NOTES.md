# Release candidate

### Highlights

- Maintenance: Document release candidate readiness.
- Fixes: Fail cli errors with nonzero status.
- Features: Add smoke test script for real codebase analysis.
- Features: Add example fixture directories with sample prompts and configs.
- Fixes: Handle edge cases in multi-file analysis.

### Changes

- Features: Add smoke test script for real codebase analysis. (2ba5c93)
- Features: Add example fixture directories with sample prompts and configs. (2272bbf)
- Features: Wire up analyze, simulate, and report CLI commands. (b44fdc1)
- Features: Implement OverflowSimulator with 10+ model presets. (f17a04d)
- Features: Implement analyzeContent() for full multi-file analysis. (ad80d0c)
- Features: Implement ContentAnalyzer core with boilerplate detection. (5b4aff0)
- Features: Add fixture directory with sample files for testing. (21cbef7)
- Fixes: Fail cli errors with nonzero status. (6aa6704)
- Fixes: Handle edge cases in multi-file analysis. (d7eeda3)
- Fixes: Restore test fixtures and fix CLI edge cases. (b000d8a)
- Maintenance: Document release candidate readiness. (f9e4587)
- Docs: Update CHANGELOG for v0.1.0. (98ef32c)
- Docs: Improve contributing guide with test, command, and language addition guides. (6b90993)
- Docs: Write README with personality, use cases, and examples. (d6807c3)
- Maintenance: Restore missing scaffold files from initial project generation. (5e5a535)
- Maintenance: Update package.json metadata. (a242190)
- Maintenance: Add dist/ to .gitignore and remove from git history. (3cc7221)
- Tests: Add overflow simulator and pruning strategy tests. (de2bc1c)
- Tests: Add content analyzer unit tests. (bc96e24)
- Tests: Add CLI integration tests for all commands. (5a56ac5)

### Contributors

- Roger Chappel

