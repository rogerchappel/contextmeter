import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const CLI = 'node --import tsx src/cli.ts';
const FIXTURES = 'fixtures';

describe('CLI Integration', () => {
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
    it('counts a single file', () => {
      const output = execSync(`${CLI} count fixtures/codebase/simple.ts`, { encoding: 'utf8' });
      assert.ok(output.includes('tokens'));
    });
    it('fails on non-existent path', () => {
      try {
        execSync(`${CLI} count /nonexistent/path/abc123`, { encoding: 'utf8', stdio: 'pipe' });
        assert.fail('should have thrown');
      } catch { /* expected */ }
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
    it('fails on unknown preset', () => {
      try {
        execSync(`${CLI} simulate ${FIXTURES} --model nonexistent_model_xyz`, { encoding: 'utf8', stdio: 'pipe' });
        assert.fail('should have thrown');
      } catch { /* expected */ }
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
  });

  describe('error handling', () => {
    it('handles unknown command', () => {
      try {
        execSync(`${CLI} bogus_command_xyz`, { encoding: 'utf8', stdio: 'pipe' });
        assert.fail('should have thrown for unknown command');
      } catch (e: any) {
        assert.ok(e.status !== 0, 'unknown command should fail');
      }
    });
  });
});
