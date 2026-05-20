#!/bin/bash
# Build and test validation script
echo "Running TypeScript build..."
npm run build || exit 1
echo "Running tests..."
npm test || exit 1
echo "Validation passed!"
