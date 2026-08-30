export const CONTEXT_PRESETS: Record<string, number> = {
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16385,
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'claude-3-haiku': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-5-sonnet': 200000,
  'claude-3-opus': 200000,
  'gemini-pro': 32768,
  'gemini-1.5-pro': 2000000,
  'gemini-1.5-flash': 1000000,
  'llama-3-8b': 8192,
  'llama-3-70b': 8192,
  'llama-3.1-405b': 128000,
  'mistral-large': 32768,
};

export type PruningStrategy = 'combined' | 'truncate' | 'remove-boilerplate' | 'remove-low-value' | 'deduplicate';

export interface SimulationResult {
  totalTokens: number;
  limit: number;
  overflows: boolean;
  fits: boolean;
  strategy: PruningStrategy;
  saved: number;
  afterPruning: number;
  prunedFiles: { path: string; originalTokens: number; savedTokens: number }[];
  suggestions: string[];
}

export function simulateOverflow(
  files: { path: string; tokens: number; content?: string }[],
  limit: number,
  strategy: PruningStrategy = 'combined',
): SimulationResult {
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);
  const overflows = totalTokens > limit;
  
  if (!overflows) {
    return {
      totalTokens, limit, overflows, fits: true, strategy,
      saved: 0, afterPruning: totalTokens, prunedFiles: [],
      suggestions: ['All files fit within the context window.', 'Content fits within the context window.'],
    };
  }
  
  let remaining = limit;
  const prunedFiles: SimulationResult['prunedFiles'] = [];
  
  if (strategy === 'truncate' || strategy === 'combined') {
    for (const file of files) {
      const kept = Math.min(file.tokens, Math.max(remaining, 0));
      const saved = file.tokens - kept;
      prunedFiles.push({ path: file.path, originalTokens: file.tokens, savedTokens: saved });
      remaining -= kept;
    }
  }
  
  if (strategy === 'remove-low-value' || (strategy === 'combined' && remaining > 0)) {
    const sorted = [...files].sort((a, b) => a.tokens - b.tokens);
    let afterPruning = totalTokens;
    for (const file of sorted) {
      if (afterPruning > limit) {
        prunedFiles.push({ path: file.path, originalTokens: file.tokens, savedTokens: file.tokens });
        afterPruning -= file.tokens;
      } else {
        prunedFiles.push({ path: file.path, originalTokens: file.tokens, savedTokens: 0 });
      }
    }
  }
  
  if (strategy === 'remove-boilerplate') {
    prunedFiles.length = 0;
    for (const file of files) {
      const boilerplate = removableBoilerplate(file.content || '');
      const boilerplateTokens = Math.min(file.tokens, Math.ceil(boilerplate.length / 3.6));
      prunedFiles.push({ path: file.path, originalTokens: file.tokens, savedTokens: boilerplateTokens });
    }
  }
  
  if (strategy === 'deduplicate') {
    prunedFiles.length = 0;
    const seen = new Set<string>();
    for (const file of files) {
      const content = file.content || '';
      const duplicate = content.length > 0 && seen.has(content);
      if (content.length > 0) seen.add(content);
      prunedFiles.push({ path: file.path, originalTokens: file.tokens, savedTokens: duplicate ? file.tokens : 0 });
    }
  }
  
  const saved = Math.min(totalTokens, prunedFiles.reduce((sum, f) => sum + f.savedTokens, 0));
  const afterPruning = Math.max(0, totalTokens - saved);
  const fits = afterPruning <= limit;
  
  const suggestions = generateOptimizationSuggestions(files, totalTokens, limit, strategy, saved);
  
  return { totalTokens, limit, overflows, fits, strategy, saved, afterPruning, prunedFiles, suggestions };
}

function removableBoilerplate(content: string): string {
  const lines = content.split('\n').slice(0, 10);
  const marker = /(?:copyright|license|spdx-license-identifier|generated file|auto-?generated|do not edit)/i;
  const lastMarkedLine = lines.reduce((last, line, index) => marker.test(line) ? index : last, -1);
  if (lastMarkedLine < 0) return '';

  const prefix = lines.slice(0, lastMarkedLine + 1);
  const commentOnly = prefix.every(line => /^\s*(?:\/\/|\/\*|\*|#|<!--|$)/.test(line));
  return commentOnly ? prefix.join('\n') : '';
}

export function generateOptimizationSuggestions(
  files: { path: string; tokens: number; content?: string }[],
  totalTokens: number,
  limit: number,
  strategy: PruningStrategy,
  saved: number,
): string[] {
  const suggestions: string[] = [];
  
  if (totalTokens <= limit) {
    suggestions.push(`All ${files.length} files fit within the ${limit}-token limit.`);
    return suggestions;
  }
  
  const excess = totalTokens - limit;
  suggestions.push(`Context overflow: ${totalTokens} tokens exceed ${limit}-token limit by ${excess} tokens.`);
  
  if (strategy === 'truncate') {
    suggestions.push(`Truncation strategy could save ${saved} tokens across ${files.length} files.`);
  } else if (strategy === 'remove-low-value') {
    const removable = files.filter(f => f.tokens <= 50);
    suggestions.push(`Removing ${removable.length} small files (<50 tokens) would save tokens.`);
  } else if (strategy === 'remove-boilerplate') {
    suggestions.push(`Removing recognized leading license or generated-file comments could save ${saved} tokens.`);
  } else if (strategy === 'deduplicate') {
    suggestions.push(`Removing exact duplicate file content could save ${saved} tokens.`);
  }
  
  if (saved > 0 && saved < excess) {
    suggestions.push(`Even after pruning, you still need to reduce ${excess - saved} more tokens. Consider reducing scope or using a model with a larger context window.`);
  }
  
  return suggestions;
}
