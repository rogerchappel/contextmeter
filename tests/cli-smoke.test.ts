import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('count command emits machine-readable totals for fixture files', async () => {
  const { stdout } = await execFileAsync('node', ['--import', 'tsx', 'src/cli.ts', 'count', 'fixtures', '--json']);
  const parsed = JSON.parse(stdout) as { totalTokens: number; files: Array<{ path: string; tokens: number }> };

  assert.ok(parsed.totalTokens > 0);
  assert.ok(parsed.files.some((file) => file.path === 'codebase/simple.ts'));
});

test('simulate rejects invalid token limits before scanning', async () => {
  await assert.rejects(
    execFileAsync('node', ['--import', 'tsx', 'src/cli.ts', 'simulate', 'fixtures', '--limit', '0']),
    /--limit must be a positive integer/
  );
});
