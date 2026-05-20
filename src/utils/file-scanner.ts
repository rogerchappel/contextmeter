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
  function scan(currentPath: string) {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = fullPath.replace(resolvedDir + '/', '');
      if (shouldExclude(relativePath, excludes)) continue;
      if (entry.isDirectory()) { scan(fullPath); }
      else if (entry.isFile()) {
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

function shouldExclude(relativePath: string, excludes: string[]): boolean {
  for (const pattern of excludes) {
    if (matchesGlob(relativePath, pattern)) return true;
  }
  return false;
}

function matchesGlob(path: string, pattern: string): boolean {
  if (!pattern.includes('/') && !pattern.includes('*')) {
    return path.split('/').includes(pattern);
  }
  const regexPattern = pattern
    .replace(/\*\*/g, '__DOUBLESTAR__').replace(/\*/g, '[^/]*')
    .replace(/__DOUBLESTAR__/g, '.*').replace(/\?/g, '[^/]');
  return new RegExp(`^${regexPattern}$`).test(path);
}

export function loadGitignore(dirPath: string): string[] {
  try {
    const content = readFileSync(join(dirPath, '.gitignore'), 'utf-8');
    return content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  } catch { return []; }
}

export const DEFAULT_EXCLUDES = [
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.output', '__pycache__', '.pytest_cache',
  '.mypy_cache', '.tox', '.venv', 'venv', 'env', '.DS_Store',
  '*.lock', '*.lockb', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock',
  '*.min.js', '*.min.css', '*.map',
];
