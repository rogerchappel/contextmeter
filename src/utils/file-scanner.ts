import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname, basename, resolve } from 'node:path';

export const EXTENSION_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.py': 'python', '.pyi': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java', '.kt': 'kotlin', '.kts': 'kotlin', '.scala': 'scala',
  '.c': 'c', '.h': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hh': 'cpp',
  '.cs': 'cs', '.vb': 'visualbasic', '.fs': 'fsharp',
  '.html': 'html', '.htm': 'html', '.css': 'css', '.scss': 'css', '.sass': 'css', '.less': 'css',
  '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml', '.xml': 'xml', '.toml': 'toml',
  '.ini': 'ini', '.cfg': 'ini',
  '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell', '.fish': 'shell', '.ps1': 'powershell',
  '.rb': 'ruby', '.php': 'php', '.swift': 'swift',
  '.m': 'objectivec', '.r': 'r', '.sql': 'sql',
  '.md': 'markdown', '.txt': 'text', '.rst': 'text',
  '.proto': 'protobuf', '.graphql': 'graphql', '.gql': 'graphql',
  '.dockerfile': 'dockerfile',
};

export function getLanguage(filePath: string): string | null {
  const base = basename(filePath).toLowerCase();
  if (base === 'dockerfile') return 'dockerfile';
  if (base === 'makefile') return 'makefile';
  if (base === 'gemfile') return 'ruby';
  const ext = extname(filePath).toLowerCase();
  return EXTENSION_MAP[ext] ?? null;
}

export function isBinary(filePath: string): boolean {
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.tar', '.gz', '.tgz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib', '.a', '.lib',
    '.o', '.obj', '.class', '.pyc', '.pyo',
    '.wasm', '.map', '.mp3', '.mp4', '.wav', '.avi', '.mov',
    '.woff', '.woff2', '.ttf', '.eot', '.lock',
  ]);
  const ext = extname(filePath).toLowerCase();
  if (binaryExtensions.has(ext)) return true;
  try {
    const stat = statSync(filePath);
    if (stat.size === 0) return false;
    const buffer = readFileSync(filePath);
    const sample = buffer.subarray(0, 8192);
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) return true;
    }
    return false;
  } catch { return true; }
}

export interface FileEntry {
  path: string; relativePath: string; language: string | null;
  size: number; content?: string; isBinary: boolean;
}

export function scanDirectory(dirPath: string, excludes: string[] = []): FileEntry[] {
  const results: FileEntry[] = [];
  const resolvedDir = resolve(dirPath);
  const ignoreRules = excludes.map(compileIgnoreRule).filter(rule => rule !== null);
  const hasNegations = ignoreRules.some(rule => rule.negated);
  function scan(currentPath: string) {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = fullPath.replace(resolvedDir + '/', '');
      const excluded = shouldExclude(relativePath, entry.isDirectory(), ignoreRules);
      if (entry.isDirectory()) {
        // A later negation may restore a descendant of an ignored directory.
        if (!excluded || hasNegations) scan(fullPath);
      }
      else if (entry.isFile()) {
        if (excluded) continue;
        const binary = isBinary(fullPath);
        const language = getLanguage(fullPath);
        let content: string | undefined; let size = 0;
        try {
          const stat = statSync(fullPath); size = stat.size;
          if (!binary) { content = readFileSync(fullPath, 'utf-8'); }
        } catch { continue; }
        results.push({ path: fullPath, relativePath, language, size, content, isBinary: binary });
      }
    }
  }
  scan(resolvedDir);
  return results;
}

interface IgnoreRule {
  negated: boolean;
  regex: RegExp;
}

function shouldExclude(relativePath: string, isDirectory: boolean, rules: IgnoreRule[]): boolean {
  let excluded = false;
  const candidate = isDirectory ? `${relativePath}/` : relativePath;
  for (const rule of rules) {
    if (rule.regex.test(candidate)) excluded = !rule.negated;
  }
  return excluded;
}

function compileIgnoreRule(rawPattern: string): IgnoreRule | null {
  let pattern = rawPattern;
  let negated = false;
  if (pattern.startsWith('\\!')) pattern = pattern.slice(1);
  else if (pattern.startsWith('!')) {
    negated = true;
    pattern = pattern.slice(1);
  }
  if (pattern.length === 0) return null;

  const anchored = pattern.startsWith('/');
  if (anchored) pattern = pattern.slice(1);
  const directoryOnly = pattern.endsWith('/');
  if (directoryOnly) pattern = pattern.slice(0, -1);
  const hasSlash = pattern.includes('/');
  const prefix = anchored || hasSlash ? '^' : '(?:^|/)';
  const suffix = directoryOnly ? '/(?:.*)?$' : '(?:/.*)?$';
  return { negated, regex: new RegExp(prefix + globToRegex(pattern) + suffix) };
}

function globToRegex(pattern: string): string {
  let result = '';
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === '*') {
      if (pattern[index + 1] === '*') {
        while (pattern[index + 1] === '*') index++;
        result += '.*';
      } else {
        result += '[^/]*';
      }
    } else if (character === '?') {
      result += '[^/]';
    } else {
      result += character.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  return result;
}

export function loadGitignore(dirPath: string): string[] {
  try {
    const content = readFileSync(join(dirPath, '.gitignore'), 'utf-8');
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .map(line => line.startsWith('\\#') ? line.slice(1) : line);
  } catch { return []; }
}

export const DEFAULT_EXCLUDES = [
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.output', '__pycache__', '.pytest_cache',
  '.mypy_cache', '.tox', '.venv', 'venv', 'env', '.DS_Store',
  '*.lock', '*.lockb', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock',
  '*.min.js', '*.min.css', '*.map',
];
