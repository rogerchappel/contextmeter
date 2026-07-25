# Accuracy and Safety Notes

ContextMeter estimates token usage for planning and triage. Treat its output as
directional rather than an exact bill of materials for any specific model API.

## Token Estimates

- Language ratios approximate common tokenizer behavior and can differ from a
  provider's current production tokenizer.
- Markdown, generated code, minified files, and mixed-language files can skew
  estimates.
- Model preset limits are convenience defaults. Check the provider's current
  documentation before using a preset as a release or deployment gate.

## Review Before Sharing

- `count`, `analyze`, `simulate`, and `report` read local files and may print
  file paths, code snippets, TODO markers, or other repository details.
- Review plain-text and JSON output before pasting it into tickets, pull
  requests, chat systems, or external tools.
- Use repository-level ignores to keep secrets, generated artifacts, and
  private customer data out of scans.

## Ignore Rules

Directory scans apply ContextMeter's built-in generated/dependency exclusions
and the `.gitignore` in the scanned directory. File names, directory patterns
ending in `/`, root-anchored patterns beginning with `/`, `*`, `**`, `?`, and
ordered `!` negations are supported. A later negation can restore a file below
an ignored directory.

ContextMeter reads only the `.gitignore` at the scan root. It does not currently
combine nested `.gitignore` files, global Git excludes, or `.git/info/exclude`,
and it does not implement character-class (`[abc]`) patterns. Review scan output
when a repository relies on those features.
