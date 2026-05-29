# contextmeter - TASKS.md

## Release candidate checklist

- [x] Token counting for files and directories
- [x] Content analysis for duplicates, boilerplate, verbose comments, and stale references
- [x] Overflow simulation with model presets and custom limits
- [x] Combined report command
- [x] Human-readable and JSON CLI output
- [x] Unit and integration tests
- [x] Smoke test script
- [x] ReleaseBox configuration
- [x] CI and release dry-run workflows

## Release gates

Run before classifying the build:

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
npm run release:check
node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .
node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js notes . > RELEASE_NOTES.md
```

## Known limitations

- Token counts are approximate and local-only.
- Pruning suggestions are heuristic; the tool does not rewrite source files.
- Model presets represent context window sizes only, not provider-specific prompt formatting overhead.
