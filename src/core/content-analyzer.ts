// Content analyzer — identifies redundant content, boilerplate, and stale references.

export interface Finding {
  type: 'duplicate' | 'boilerplate' | 'verbose' | 'stale-reference';
  severity: 'high' | 'medium' | 'low';
  file: string;
  message: string;
  suggestion: string;
}

export interface FileAnalysis {
  path: string;
  tokens: number;
  findings: Finding[];
}

export interface AnalysisReport {
  totalTokens: number;
  duplicateGroups: { content: string; files: string[]; tokenCount: number }[];
  boilerplateCount: number;
  redundantTokenCount: number;
  findings: Finding[];
  suggestions: string[];
  fileBreakdown: { path: string; tokens: number; percentage: number; language: string | null }[];
}

const BOILERPLATE_PATTERNS = [
  { regex: /copyright\s*\d{4}/i, type: 'License header' },
  { regex: /mit\s+license/i, type: 'MIT License text' },
  { regex: /apache.*license/i, type: 'Apache License text' },
  { regex: /auto[-_\s]generated/i, type: 'Auto-generated comment' },
  { regex: /do not edit.*generated/i, type: 'Generated file warning' },
];

export function detectBoilerplate(content: string, filePath: string): Finding[] {
  if (!content) return [];
  const lines = content.split('\n');
  const boilerplateLines: number[] = [];
  
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    for (const pattern of BOILERPLATE_PATTERNS) {
      if (pattern.regex.test(line)) {
        boilerplateLines.push(i);
        break;
      }
    }
  }
  
  if (boilerplateLines.length === 0) return [];
  
  const types = new Set<string>();
  for (const idx of boilerplateLines) {
    for (const pattern of BOILERPLATE_PATTERNS) {
      if (pattern.regex.test(lines[idx])) types.add(pattern.type);
    }
  }
  
  return [...types].map(type => ({
    type: 'boilerplate',
    severity: 'low',
    file: filePath,
    message: `Found ${type}: "${lines[boilerplateLines[0]].trim()}"`,
    suggestion: `Consider minimizing ${type} or moving it to a separate file.`,
  }));
}

const TODO_PATTERN = /\b(TODO|FIXME|HACK|WORKAROUND|XXX|NOTE)\b/gi;
const DATED_PATTERN = /(?:before\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i;

export function detectStaleReferences(content: string, filePath: string): Finding[] {
  if (!content) return [];
  const findings: Finding[] = [];
  
  for (const match of content.matchAll(/\/\/.*$/gm)) {
    const line = match[0];
    if (TODO_PATTERN.test(line)) {
      const todoMatch = line.match(TODO_PATTERN);
      const trimmed = line.trim();
      
      if (!trimmed.slice(2).trim() || trimmed.slice(2).trim().length <= 5) {
        findings.push({
          type: 'stale-reference', severity: 'medium', file: filePath,
          message: `Empty ${todoMatch![0].toUpperCase()}: "${trimmed}"`,
          suggestion: 'Either add description or remove this marker.',
        });
      } else if (/\bworkaround\b/i.test(trimmed)) {
        findings.push({
          type: 'stale-reference', severity: 'high', file: filePath,
          message: `Found Workaround: "${trimmed}"`,
          suggestion: 'Review and either resolve or remove this TODO.',
        });
      } else if (DATED_PATTERN.test(trimmed)) {
        findings.push({
          type: 'stale-reference', severity: 'high', file: filePath,
          message: `Found Dated TODO: "${trimmed}"`,
          suggestion: 'Review and either resolve or remove this TODO.',
        });
      }
      TODO_PATTERN.lastIndex = 0;
    }
  }
  
  return findings;
}

export function detectVerboseContent(content: string, filePath: string): Finding[] {
  if (!content) return [];
  const findings: Finding[] = [];
  const lines = content.split('\n');
  let commentStart = -1;
  let commentCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      if (commentStart === -1) commentStart = i;
      commentCount++;
    } else {
      if (commentCount >= 10) {
        findings.push({
          type: 'verbose', severity: 'medium', file: filePath,
          message: `Long comment block (${commentCount} lines) at line ${commentStart + 1}`,
          suggestion: 'Consider whether the entire comment block is necessary.',
        });
      }
      commentCount = 0;
      commentStart = -1;
    }
  }
  
  // Check trailing comment block at end of file
  if (commentCount >= 10) {
    findings.push({
      type: 'verbose', severity: 'medium', file: filePath,
      message: `Long comment block (${commentCount} lines) at line ${commentStart + 1}`,
      suggestion: 'Consider whether the entire comment block is necessary.',
    });
  }
  
  return findings;
}

const COMMON_IMPORT_EXPORT = /^(?:import|export|from|require)\s/;

export function detectDuplicates(files: { path: string; content: string }[]): { content: string; files: string[]; tokenCount: number }[] {
  const lineGroups = new Map<string, string[]>();
  
  for (const file of files) {
    if (!file.content) continue;
    const lines = file.content.split('\n');
    const lineSet = new Set<string>();
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 20) continue;
      if (COMMON_IMPORT_EXPORT.test(trimmed)) continue;
      if (trimmed === '{' || trimmed === '}' || trimmed === '});') continue;
      if (lineSet.has(trimmed)) continue;
      lineSet.add(trimmed);
      if (!lineGroups.has(trimmed)) lineGroups.set(trimmed, []);
      lineGroups.get(trimmed)!.push(file.path);
    }
  }
  
  const groups: { content: string; files: string[]; tokenCount: number }[] = [];
  for (const [content, paths] of lineGroups) {
    if (paths.length >= 2) {
      groups.push({ content: `${content.slice(0, 50)}...`, files: paths, tokenCount: Math.ceil(content.length / 3.6) });
    }
  }
  
  return groups.sort((a, b) => b.tokenCount - a.tokenCount);
}

export function analyzeFile(filePath: string, content: string, tokens: number, language: string | null): FileAnalysis {
  const findings = [...detectBoilerplate(content, filePath), ...detectStaleReferences(content, filePath), ...detectVerboseContent(content, filePath)];
  return { path: filePath, tokens, findings };
}

export function analyzeContent(files: { path: string; content: string; tokens: number; language: string | null }[], totalTokens: number): AnalysisReport {
  const allFindings: Finding[] = [];
  const fileBreakdown = files.map(f => ({
    path: f.path,
    tokens: f.tokens,
    percentage: totalTokens > 0 ? +(f.tokens / totalTokens * 100).toFixed(1) : 0,
    language: f.language,
  }));
  
  const duplicateGroups = detectDuplicates(files.map(f => ({ path: f.path, content: f.content })));
  let boilerplateCount = 0;
  let redundantTokenCount = 0;
  
  for (const file of files) {
    const analysis = analyzeFile(file.path, file.content, file.tokens, file.language);
    allFindings.push(...analysis.findings);
    for (const f of analysis.findings) { if (f.type === 'boilerplate') boilerplateCount++; }
  }
  
  // Add duplicate findings
  for (const group of duplicateGroups) {
    allFindings.push({
      type: 'duplicate', severity: 'high', file: group.files[0],
      message: `Content duplicated across ${group.files.length} files: "${group.content}"`,
      suggestion: 'Shared content in multiple files. Consider extracting to a common module.',
    });
    redundantTokenCount += group.tokenCount * (group.files.length - 1);
  }
  
  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (duplicateGroups.length > 0) {
    suggestions.push(`Found ${duplicateGroups.length} duplicate content groups. Deduplication could save tokens.`);
  }
  if (boilerplateCount > 0) {
    suggestions.push(`Found ${boilerplateCount} boilerplate patterns. Consider minimizing or externalizing.`);
  }
  
  fileBreakdown.sort((a, b) => b.tokens - a.tokens);
  
  return {
    totalTokens, duplicateGroups, boilerplateCount, redundantTokenCount,
    findings: allFindings, suggestions, fileBreakdown,
  };
}
