import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { simulateOverflow, CONTEXT_PRESETS, PruningStrategy, generateOptimizationSuggestions } from '../../src/core/overflow-simulator.js';

describe('OverflowSimulator', () => {
  describe('simulateOverflow - no overflow', () => {
    it('reports no overflow when under limit', () => {
      const files = [{ path: 'a.ts', tokens: 100 }];
      const result = simulateOverflow(files, 1000);
      assert.strictEqual(result.fits, true);
      assert.strictEqual(result.overflows, false);
    });
    it('reports exact fit', () => {
      const files = [{ path: 'a.ts', tokens: 500 }];
      const result = simulateOverflow(files, 500);
      assert.strictEqual(result.fits, true);
    });
  });

  describe('simulateOverflow - with overflow', () => {
    it('detects overflow', () => {
      const files = [{ path: 'a.ts', tokens: 200 }, { path: 'b.ts', tokens: 300 }];
      const result = simulateOverflow(files, 400);
      assert.strictEqual(result.overflows, true);
    });
    it('includes simulation metadata', () => {
      const files = [{ path: 'a.ts', tokens: 200 }];
      const result = simulateOverflow(files, 100);
      assert.strictEqual(result.totalTokens, 200);
      assert.strictEqual(result.limit, 100);
      assert.strictEqual(result.strategy, 'combined');
    });
  });

  describe('pruning strategies', () => {
    it('truncate strategy reduces all files proportionally', () => {
      const files = [{ path: 'a.ts', tokens: 300 }, { path: 'b.ts', tokens: 200 }];
      const result = simulateOverflow(files, 250, 'truncate');
      assert.ok(result.prunedFiles.length >= 1);
    });
    it('combined strategy applies multiple approaches', () => {
      const files = [{ path: 'a.ts', tokens: 300, content: 'const x = 42;' }];
      const result = simulateOverflow(files, 100, 'combined');
      assert.ok(result.prunedFiles.length >= 1);
    });
    it('remove boilerplate saves estimated tokens', () => {
      const files = [{ path: 'a.ts', tokens: 300, content: '// MIT License\n' + 'x'.repeat(100) }];
      const result = simulateOverflow(files, 100, 'remove-boilerplate');
      assert.ok(result.prunedFiles.some(f => f.savedTokens > 0));
    });
    it('remove low value removes files', () => {
      const files = [{ path: 'a.ts', tokens: 300 }, { path: 'b.ts', tokens: 200 }];
      const result = simulateOverflow(files, 100, 'remove-low-value');
      assert.ok(result.prunedFiles.some(f => f.savedTokens === f.originalTokens));
    });
    it('remove low value removes the smallest files needed to fit', () => {
      const files = [{ path: 'large.ts', tokens: 80 }, { path: 'small.ts', tokens: 30 }];
      const result = simulateOverflow(files, 100, 'remove-low-value');
      assert.strictEqual(result.saved, 30);
      assert.strictEqual(result.afterPruning, 80);
      assert.strictEqual(result.fits, true);
      assert.deepStrictEqual(result.prunedFiles, [
        { path: 'small.ts', originalTokens: 30, savedTokens: 30 },
        { path: 'large.ts', originalTokens: 80, savedTokens: 0 },
      ]);
    });
    it('deduplicate strategy handles duplicate groups', () => {
      const files = [{ path: 'a.ts', tokens: 300 }];
      const result = simulateOverflow(files, 100, 'deduplicate');
      assert.ok(result.prunedFiles.length >= 1);
    });
  });

  describe('generateOptimizationSuggestions', () => {
    it('returns non-empty suggestions for non-overflow', () => {
      const files = [{ path: 'a.ts', tokens: 100 }];
      const suggestions = generateOptimizationSuggestions(files, 100, 500, 'combined', 0);
      assert.ok(suggestions.length > 0);
    });
    it('suggests reducing scope when cannot fit', () => {
      const files = [{ path: 'a.ts', tokens: 500 }];
      const suggestions = generateOptimizationSuggestions(files, 500, 100, 'combined', 100);
      assert.ok(suggestions.some(s => s.toLowerCase().includes('reduce') || s.toLowerCase().includes('larger')));
    });
  });

  describe('CONTEXT_PRESETS', () => {
    it('has known model presets', () => {
      assert.ok(CONTEXT_PRESETS['gpt-4'] > 0);
      assert.ok(CONTEXT_PRESETS['claude-3-sonnet'] > 0);
      assert.ok(CONTEXT_PRESETS['gemini-pro'] > 0);
    });
    it('all preset values are positive numbers', () => {
      for (const [name, value] of Object.entries(CONTEXT_PRESETS)) {
        assert.ok(value > 0, `${name} should have positive limit`);
      }
    });
    it('preset values are in reasonable ranges', () => {
      for (const [name, value] of Object.entries(CONTEXT_PRESETS)) {
        assert.ok(value >= 4096 && value <= 5000000, `${name} limit ${value} outside reasonable range`);
      }
    });
  });
});
