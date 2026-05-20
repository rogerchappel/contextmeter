
## Running Tests

```bash
# Unit + integration tests
npm test

# Build TypeScript
npm run build

# Full validation
bash scripts/validate.sh
```

## Adding New Commands

CLI commands are defined in `src/cli.ts`. Each command follows this pattern:

```typescript
async function yourCommand(path: string, json = false) {
  // 1. Scan files with scanDirectory()
  // 2. Process with core logic
  // 3. Output text or JSON based on flag
}
```

## Adding Language Support

Add your language mapping in `src/utils/file-scanner.ts`:

```typescript
const EXTENSION_MAP: Record<string, string> = {
  '.yourExt': 'your-language-name',
};
```

And add a token-per-char ratio in `src/core/token-counter.ts`:

```typescript
const LANGUAGE_RATIOS: Record<string, number> = {
  'your-language-name': 0.XX,
};
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation changes
- `test:` test additions or fixes
- `chore:` maintenance and tooling
- `refactor:` code changes that don't add features or fix bugs
