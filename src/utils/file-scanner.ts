import { extname, basename } from 'node:path';

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
