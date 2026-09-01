import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getLanguage, isBinary, scanDirectory, loadGitignore, normalizeRepositoryPath, DEFAULT_EXCLUDES,
} from '../../src/utils/file-scanner.js';

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
      const directory = mkdtempSync(join(tmpdir(), 'contextmeter-isbinary-'));
      const file = join(directory, 'fixture.txt');
      writeFileSync(file, 'hello world');
      try { assert.strictEqual(isBinary(file), false); } finally { rmSync(directory, { recursive: true }); }
    });
    it('detects ts file as non-binary', () => {
      const directory = mkdtempSync(join(tmpdir(), 'contextmeter-isbinary-'));
      const file = join(directory, 'fixture.ts');
      writeFileSync(file, 'const x = 42;');
      try { assert.strictEqual(isBinary(file), false); } finally { rmSync(directory, { recursive: true }); }
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

  describe('gitignore patterns', () => {
    function withProject(
      files: Record<string, string>,
      test: (projectPath: string) => void,
    ): void {
      const projectPath = mkdtempSync(join(tmpdir(), 'contextmeter-ignore-'));
      try {
        for (const [relativePath, content] of Object.entries(files)) {
          const filePath = join(projectPath, relativePath);
          mkdirSync(join(filePath, '..'), { recursive: true });
          writeFileSync(filePath, content);
        }
        test(projectPath);
      } finally {
        rmSync(projectPath, { recursive: true, force: true });
      }
    }

    it('excludes a directory pattern and everything below it', () => {
      withProject({
        '.gitignore': 'ignored/\n',
        'ignored/secret.ts': 'export const secret = true;\n',
        'visible.ts': 'export const visible = true;\n',
      }, projectPath => {
        const files = scanDirectory(projectPath, [
          ...DEFAULT_EXCLUDES,
          ...loadGitignore(projectPath),
        ]);
        assert.deepStrictEqual(files.map(file => file.relativePath).sort(), [
          '.gitignore',
          'visible.ts',
        ]);
      });
    });

    it('supports file, anchored, glob, and ordered negation patterns', () => {
      withProject({
        '.gitignore': [
          '*.log',
          '/root-only.ts',
          'generated/**',
          '!generated/keep.ts',
          '',
        ].join('\n'),
        'app.log': 'ignored\n',
        'nested/app.log': 'ignored\n',
        'root-only.ts': 'ignored\n',
        'nested/root-only.ts': 'kept\n',
        'generated/drop.ts': 'ignored\n',
        'generated/keep.ts': 'kept\n',
        'src/main.ts': 'kept\n',
      }, projectPath => {
        const files = scanDirectory(projectPath, [
          ...DEFAULT_EXCLUDES,
          ...loadGitignore(projectPath),
        ]);
        assert.deepStrictEqual(files.map(file => file.relativePath).sort(), [
          '.gitignore',
          'generated/keep.ts',
          'nested/root-only.ts',
          'src/main.ts',
        ]);
      });
    });

    it('matches double-star directory globs at zero or multiple levels', () => {
      withProject({
        '.gitignore': 'foo/**/bar.txt\n',
        'foo/bar.txt': 'ignored at zero levels\n',
        'foo/x/y/bar.txt': 'ignored at multiple levels\n',
        'foo/x/kept.txt': 'kept\n',
      }, projectPath => {
        const files = scanDirectory(projectPath, loadGitignore(projectPath));
        assert.deepStrictEqual(files.map(file => file.relativePath).sort(), [
          '.gitignore',
          'foo/x/kept.txt',
        ]);
      });
    });

    it('normalizes Windows-style relative paths for repository output and ignore matching', () => {
      assert.strictEqual(normalizeRepositoryPath('src\\nested\\main.ts'), 'src/nested/main.ts');
      assert.strictEqual(normalizeRepositoryPath('generated\\keep.ts'), 'generated/keep.ts');
    });

    it('returns only stable repository-relative paths for nested directory scans', () => {
      withProject({
        '.gitignore': 'generated/**\n!generated/keep.ts\n',
        'generated/drop.ts': 'ignored\n',
        'generated/keep.ts': 'kept\n',
        'src/nested/main.ts': 'kept\n',
      }, projectPath => {
        const files = scanDirectory(projectPath, loadGitignore(projectPath));
        const relativePaths = files.map(file => file.relativePath).sort();
        assert.deepStrictEqual(relativePaths, [
          '.gitignore',
          'generated/keep.ts',
          'src/nested/main.ts',
        ]);
        assert.ok(relativePaths.every(filePath => !filePath.includes('\\')));
        assert.ok(relativePaths.every(filePath => !filePath.startsWith(projectPath)));
      });
    });

    it('applies nested ignore rules only below their containing directory', () => {
      withProject({
        'packages/app/.gitignore': 'generated/\n',
        'packages/app/generated/nested.txt': 'ignored\n',
        'packages/app/keep.txt': 'kept\n',
        'generated/nested.txt': 'outside child scope\n',
      }, projectPath => {
        const paths = scanDirectory(projectPath, DEFAULT_EXCLUDES)
          .map(file => file.relativePath).sort();
        assert.ok(!paths.includes('packages/app/generated/nested.txt'));
        assert.ok(paths.includes('packages/app/keep.txt'));
        assert.ok(paths.includes('generated/nested.txt'));
      });
    });

    it('lets child negations override matching parent rules', () => {
      withProject({
        '.gitignore': '*.txt\n',
        'packages/app/.gitignore': '!keep.txt\n',
        'packages/app/keep.txt': 'kept\n',
        'packages/app/other.txt': 'ignored\n',
      }, projectPath => {
        const paths = scanDirectory(projectPath, DEFAULT_EXCLUDES)
          .map(file => file.relativePath).sort();
        assert.ok(paths.includes('packages/app/keep.txt'));
        assert.ok(!paths.includes('packages/app/other.txt'));
      });
    });
  });
});
