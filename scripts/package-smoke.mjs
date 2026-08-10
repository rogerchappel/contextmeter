import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
});

const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const readme = readFileSync('README.md', 'utf8');

if (/npm install (?:--global|-g) contextmeter/.test(readme)) {
  console.error('Package smoke failed; README advertises npm installation while npm publishing is disabled.');
  process.exit(1);
}

const requiredFiles = [
  'package.json',
  'dist/cli.js',
  'dist/index.js',
  'fixtures/codebase/simple.ts',
  'fixtures/prompts/system-prompt.md',
  'docs/accuracy-and-safety.md',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'SECURITY.md',
  'CONTRIBUTING.md',
];

const missing = requiredFiles.filter((file) => !packedFiles.has(file));
if (missing.length > 0) {
  console.error(`Package smoke failed; missing files:\n${missing.join('\n')}`);
  process.exit(1);
}

const declaredBins = Object.values(packageJson.bin ?? {}).map((binPath) =>
  binPath.replace(/^.\//, ''),
);
const missingBins = declaredBins.filter((binPath) => !packedFiles.has(binPath));
if (missingBins.length > 0) {
  console.error(`Package smoke failed; missing declared bins:\n${missingBins.join('\n')}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);
