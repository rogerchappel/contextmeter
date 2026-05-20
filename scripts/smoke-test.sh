#!/bin/bash
set -e

echo "=== ContextMeter Smoke Tests ==="

echo ""
echo "=== COUNT ==="
node --import tsx src/cli.ts count tests/fixtures

echo ""
echo "=== ANALYZE ==="
node --import tsx src/cli.ts analyze tests/fixtures

echo ""
echo "=== SIMULATE ==="
node --import tsx src/cli.ts simulate tests/fixtures --model gpt-4

echo ""
echo "=== REPORT ==="
node --import tsx src/cli.ts report tests/fixtures

echo ""
echo "=== VERSION ==="
node --import tsx src/cli.ts --version

echo ""
echo "✅ All smoke tests passed!"
