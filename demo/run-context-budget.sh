#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/context-budget-demo"

mkdir -p "$OUT"

npm run build

echo "== count fixture codebase =="
node "$ROOT/dist/cli.js" count "$ROOT/fixtures/codebase" --json > "$OUT/count.json"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log({totalTokens:data.totalTokens, files:data.files.length}); if (!data.totalTokens || data.files.length < 3) process.exit(1);" "$OUT/count.json"

echo
echo "== analyze fixture codebase =="
node "$ROOT/dist/cli.js" analyze "$ROOT/fixtures/codebase" --json > "$OUT/analyze.json"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log({findings:data.findings.length, redundantTokenCount:data.redundantTokenCount}); if (!Array.isArray(data.findings)) process.exit(1);" "$OUT/analyze.json"

echo
echo "== simulate a 2k-token context budget =="
node "$ROOT/dist/cli.js" simulate "$ROOT/fixtures/codebase" --limit 2000 --json > "$OUT/simulate.json"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log({limit:data.limit, fits:data.fits, totalTokens:data.totalTokens}); if (data.limit !== 2000 || data.fits !== true) process.exit(1);" "$OUT/simulate.json"

echo
echo "Demo artifacts written to $OUT"
