# OSS Factory Orchestration

ContextMeter was built as a local-first TypeScript CLI MVP for Roger's OSS
factory cycle. The repository is designed to be verified locally and pushed
directly to `main`.

## Scope

- Owned repo: `/Users/roger/Developer/my-opensource/contextmeter`
- Public GitHub target: `rogerchappel/contextmeter`
- Default branch: `main`
- Runtime: Node.js 20 or newer
- Package manager: npm

## Verification Gates

Run these before release or handoff:

```sh
npm install
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

The smoke command scans both included fixtures and exercises Markdown and JSON
output.

## Release Notes

This MVP does not call remote tokenizer APIs and does not upload source content.
Budgets are deterministic local estimates intended for comparison across runs,
not provider-specific token parity.
