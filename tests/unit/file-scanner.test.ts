import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLanguage, isBinary, DEFAULT_EXCLUDES } from '../../src/utils/file-scanner.js';

describe('FileScanner', () => {
  describe('getLanguage', () => {
    it('detects TypeScript files', () => {
      assert.strictEqual(getLanguage('test.ts'), 'typescript');
      assert.strictEqual(getLanguage('test.tsx'), 'typescript');
    });
    it('detects JavaScript files', () => {
      assert.strictEqual(getLanguage('app.js'), 'javascript');
      assert.strictEqual(getLanguage('app.mjs'), 'javascript');
    });
    it('detects Python files', () => { assert.strictEqual(getLanguage('script.py'), 'python'); });
    it('detects Go files', () => { assert.strictEqual(getLanguage('main.go'), 'go'); });
    it('detects Rust files', () => { assert.strictEqual(getLanguage('lib.rs'), 'rust'); });
    it('detects Java files', () => { assert.strictEqual(getLanguage('App.java'), 'java'); });
    it('detects web files', () => {
      assert.strictEqual(getLanguage('index.html'), 'html');
      assert.strictEqual(getLanguage('styles.css'), 'css');
    });
    it('returns null for unknown extensions', () => {
      assert.strictEqual(getLanguage('file.xyz'), null);
    });
    it('detects special filenames', () => {
      assert.strictEqual(getLanguage('Dockerfile'), 'dockerfile');
      assert.strictEqual(getLanguage('Makefile'), 'makefile');
      assert.strictEqual(getLanguage('Gemfile'), 'ruby');
    });
    it('is case-insensitive for extensions', () => {
      assert.strictEqual(getLanguage('file.TS'), 'typescript');
      assert.strictEqual(getLanguage('file.PY'), 'python');
    });
  });

  describe('isBinary', () => {
    it('detects binary extensions', () => {
      assert.strictEqual(isBinary('/path/to/image.png'), true);
      assert.strictEqual(isBinary('/path/to/archive.zip'), true);
      assert.strictEqual(isBinary('/path/to/app.exe'), true);
    });
    it('detects text file as non-binary', () => {
      const tmp = '/tmp/cm-test-isbinary.txt';
      require('fs').writeFileSync(tmp, 'hello world');
      assert.strictEqual(isBinary(tmp), false);
      require('fs').unlinkSync(tmp);
    });
    it('detects ts file as non-binary', () => {
      const tmp = '/tmp/cm-test-isbinary.ts';
      require('fs').writeFileSync(tmp, 'const x = 42;');
      assert.strictEqual(isBinary(tmp), false);
      require('fs').unlinkSync(tmp);
    });
  });

  describe('DEFAULT_EXCLUDES', () => {
    it('excludes common directories', () => {
      assert.ok(DEFAULT_EXCLUDES.includes('node_modules'));
      assert.ok(DEFAULT_EXCLUDES.includes('.git'));
      assert.ok(DEFAULT_EXCLUDES.includes('.venv'));
    });
    it('excludes lock files', () => {
      assert.ok(DEFAULT_EXCLUDES.includes('pnpm-lock.yaml'));
      assert.ok(DEFAULT_EXCLUDES.includes('package-lock.json'));
    });
    it('excludes minified files', () => {
      assert.ok(DEFAULT_EXCLUDES.includes('*.min.js'));
      assert.ok(DEFAULT_EXCLUDES.includes('*.min.css'));
    });
  });
});
