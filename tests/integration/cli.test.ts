import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const CLI = 'node --import tsx src/cli.ts';
const FIXTURES = 'fixtures';

function runCli(args: string): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execSync(`${CLI} ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout, stderr: '' };
  } catch (error: any) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? '',
    };
  }
}

describe('CLI Integration', () => {
  describe('package release contents', () => {
    it('keeps linked docs and fixtures in the npm allowlist', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

      assert.ok(pkg.files.includes('docs'));
      assert.ok(pkg.files.includes('fixtures'));
      assert.ok(existsSync('docs/accuracy-and-safety.md'));
      assert.ok(existsSync('fixtures/codebase/simple.ts'));
    });
  });

  describe('count command', () => {
    it('counts tokens in fixtures directory', () => {
      const output = execSync(`${CLI} count ${FIXTURES}`, { encoding: 'utf8' });
      assert.ok(output.includes('ContextMeter - Token Count'));
      assert.ok(output.includes('Total tokens:'));
    });
    it('outputs JSON with --json flag', () => {
      const output = execSync(`${CLI} count ${FIXTURES} --json`, { encoding: 'utf8' });
      const data = JSON.parse(output);
      assert.ok(typeof data.totalTokens === 'number');
      assert.ok(Array.isArray(data.files));
    });
    it('defaults to current directory when only flags are provided', () => {
      const output = execSync(`${CLI} count --json`, { encoding: 'utf8' });
      const data = JSON.parse(output);
      assert.ok(typeof data.totalTokens === 'number');
      assert.ok(Array.isArray(data.files));
    });
    it('counts a single file', () => {
      const output = execSync(`${CLI} count fixtures/codebase/simple.ts`, { encoding: 'utf8' });
      assert.ok(output.includes('tokens'));
    });
    it('fails on non-existent path', () => {
      const result = runCli('count /nonexistent/path/abc123');
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /no such file or directory|ENOENT/);
    });
  });

  describe('analyze command', () => {
    it('analyzes fixtures directory', () => {
      const output = execSync(`${CLI} analyze ${FIXTURES}`, { encoding: 'utf8' });
      assert.ok(output.includes('ContextMeter - Content Analysis'));
      assert.ok(output.includes('Findings:'));
    });
    it('outputs JSON with --json flag', () => {
      const output = execSync(`${CLI} analyze ${FIXTURES} --json`, { encoding: 'utf8' });
      const data = JSON.parse(output);
      assert.ok(Array.isArray(data.findings));
    });
    it('analyzes a single file in text and JSON formats', () => {
      const path = 'fixtures/codebase/simple.ts';
      const output = execSync(`${CLI} analyze ${path}`, { encoding: 'utf8' });
      assert.ok(output.includes('Files analyzed: 1'));

      const data = JSON.parse(execSync(`${CLI} analyze ${path} --json`, { encoding: 'utf8' }));
      assert.equal(data.totalTokens, data.fileBreakdown[0].tokens);
      assert.equal(data.fileBreakdown[0].path, path);
    });
  });

  describe('simulate command', () => {
    it('simulates with explicit limit', () => {
      const output = execSync(`${CLI} simulate ${FIXTURES} --limit 4000`, { encoding: 'utf8' });
      assert.ok(output.includes('ContextMeter - Overflow Simulation'));
      assert.ok(output.includes('Context limit:'));
    });
    it('simulates with preset model name', () => {
      const output = execSync(`${CLI} simulate ${FIXTURES} --model gpt-4`, { encoding: 'utf8' });
      assert.ok(output.includes('8,192'));
    });
    it('outputs JSON with --json flag', () => {
      const output = execSync(`${CLI} simulate ${FIXTURES} --limit 4000 --json`, { encoding: 'utf8' });
      const data = JSON.parse(output);
      assert.ok(typeof data.totalTokens === 'number');
    });
    it('simulates a single file in text and JSON formats', () => {
      const path = 'fixtures/codebase/simple.ts';
      const output = execSync(`${CLI} simulate ${path} --limit 4000`, { encoding: 'utf8' });
      assert.ok(output.includes('ContextMeter - Overflow Simulation'));

      const data = JSON.parse(execSync(`${CLI} simulate ${path} --limit 4000 --json`, { encoding: 'utf8' }));
      assert.equal(data.limit, 4000);
      assert.ok(data.totalTokens > 0);
      assert.equal(data.afterPruning, data.totalTokens);
      assert.equal(data.fits, true);
      assert.ok(Array.isArray(data.prunedFiles));
    });
    it('fails on unknown preset', () => {
      const result = runCli(`simulate ${FIXTURES} --model nonexistent_model_xyz`);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /Unknown model preset/);
    });
    it('fails on invalid token limits', () => {
      const result = runCli(`simulate ${FIXTURES} --limit nope`);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /positive integer/);
    });
  });

  describe('help and version', () => {
    it('shows help with --help', () => {
      const output = execSync(`${CLI} --help`, { encoding: 'utf8' });
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('count'));
    });
    it('shows version with --version', () => {
      const output = execSync(`${CLI} --version`, { encoding: 'utf8' });
      assert.ok(output.includes('0.1.0'));
    });
    it('shows help with no arguments', () => {
      const output = execSync(`${CLI}`, { encoding: 'utf8' });
      assert.ok(output.includes('Usage:'));
    });
  });

  describe('report command', () => {
    it('generates report for fixtures', () => {
      const output = execSync(`${CLI} report ${FIXTURES}`, { encoding: 'utf8' });
      assert.ok(output.includes('ContextMeter - Report'));
      assert.ok(output.includes('Token Count:'));
    });
    it('outputs JSON with --json flag', () => {
      const output = execSync(`${CLI} report ${FIXTURES} --json`, { encoding: 'utf8' });
      const data = JSON.parse(output);
      assert.ok(typeof data.totalTokens === 'number');
    });
    it('reports on a single file in text and JSON formats', () => {
      const path = 'fixtures/codebase/simple.ts';
      const output = execSync(`${CLI} report ${path}`, { encoding: 'utf8' });
      assert.ok(output.includes('Files: 1 (0 binary skipped)'));

      const data = JSON.parse(execSync(`${CLI} report ${path} --json`, { encoding: 'utf8' }));
      assert.equal(data.totalTokens, data.tokenCount);
      assert.equal(data.analysis.fileBreakdown.length, 1);
      assert.equal(data.analysis.fileBreakdown[0].path, path);
    });
  });

  describe('error handling', () => {
    it('handles unknown command', () => {
      const result = runCli('bogus_command_xyz');
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /Unknown command/);
    });
  });
});
