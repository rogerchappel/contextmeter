#!/usr/bin/env node
import { scanDirectory, loadGitignore, DEFAULT_EXCLUDES } from './utils/file-scanner.js';
import { approximateTokens, countTokensForLanguage } from './core/token-counter.js';
import { analyzeContent } from './core/content-analyzer.js';
import { simulateOverflow, CONTEXT_PRESETS } from './core/overflow-simulator.js';
import { getLanguage } from './utils/file-scanner.js';
import fs from 'node:fs';

const VERSION = '0.1.0';
type FileEntry = import('./utils/file-scanner.js').FileEntry;

function formatError(error: unknown): string {
  return error instanceof Error ? `Error: ${error.message}` : String(error);
}

function scanPath(path: string): FileEntry[] {
  const stat = fs.statSync(path);
  if (stat.isFile()) {
    const content = fs.readFileSync(path, 'utf-8');
    return [{
      path,
      relativePath: path,
      language: getLanguage(path),
      content,
      isBinary: false,
      size: content.length,
    }];
  }
  return scanDirectory(path, [...DEFAULT_EXCLUDES, ...loadGitignore(path)]);
}

async function countCommand(path: string, json = false) {
  const files = scanPath(path);
  const textFiles = files.filter(f => !f.isBinary && f.content !== undefined);
  let totalTokens = 0;
  const fileTokens = textFiles.map(f => {
    const tokens = f.language ? countTokensForLanguage(f.content!, f.language) : approximateTokens(f.content!);
    totalTokens += tokens;
    return { path: f.relativePath, tokens };
  });
  fileTokens.sort((a, b) => b.tokens - a.tokens);
  if (json) {
    console.log(JSON.stringify({ totalTokens, files: fileTokens }, null, 2));
  } else {
    console.log(`\nContextMeter - Token Count\n${'-'.repeat(50)}`);
    console.log(`Scanned: ${textFiles.length} files (${files.filter(f => f.isBinary).length} binary, skipped)`);
    console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
    console.log('\nTop files by token usage:');
    for (const f of fileTokens.slice(0, 5)) {
      const pct = totalTokens > 0 ? ((f.tokens / totalTokens) * 100).toFixed(1) : '0.0';
      console.log(`  ${f.path.padEnd(50)} ${f.tokens} tokens (${pct}%)`);
    }
    console.log(`\nTip: run 'contextmeter analyze ${path}' to find redundancy.`);
  }
}

async function analyzeCommand(path: string, json = false) {
  const files = scanPath(path);
  const textFiles = files.filter(f => !f.isBinary && f.content !== undefined);
  const fileData = textFiles.map(f => ({
    path: f.relativePath,
    content: f.content!,
    tokens: f.language ? countTokensForLanguage(f.content!, f.language) : approximateTokens(f.content!),
    language: f.language,
  }));
  const totalTokens = fileData.reduce((sum, f) => sum + f.tokens, 0);
  const report = analyzeContent(fileData, totalTokens);
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\nContextMeter - Content Analysis\n${'-'.repeat(50)}`);
    console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`Files analyzed: ${fileData.length}`);
    console.log(`Findings: ${report.findings.length}`);
    console.log(`  Boilerplate patterns: ${report.boilerplateCount}`);
    console.log(`  Duplicate groups: ${report.duplicateGroups.length}`);
    console.log(`  Redundant tokens: ${report.redundantTokenCount}`);
    console.log('\nFindings:');
    for (const f of report.findings) {
      const icon = f.severity === 'high' ? '[!]' : f.severity === 'medium' ? '[~]' : '[.]';
      console.log(`  ${icon} [${f.type}] ${f.file} - ${f.message}`);
      console.log(`     -> ${f.suggestion}`);
    }
    if (report.suggestions.length > 0) {
      console.log('\nSuggestions:');
      for (const s of report.suggestions) console.log(`  - ${s}`);
    }
    console.log('\nToken breakdown (top 15):');
    for (const f of report.fileBreakdown.slice(0, 15)) {
      const bar = '#'.repeat(Math.max(1, Math.floor(f.percentage / 2)));
      console.log(`  ${bar.padEnd(14)} ${f.path.padEnd(45)} ${f.tokens} (${f.percentage}%)`);
    }
    if (report.findings.length > 0) {
      console.log(`\nTip: run 'contextmeter simulate ${path} --limit 8192' to check overflow.`);
    }
  }
}

async function simulateCommand(path: string, limitOrModel: string | number | undefined, json = false) {
  const files = scanPath(path);
  const textFiles = files.filter(f => !f.isBinary && f.content !== undefined);
  const fileData = textFiles.map(f => ({
    path: f.relativePath,
    content: f.content!,
    tokens: f.language ? countTokensForLanguage(f.content!, f.language) : approximateTokens(f.content!),
    language: f.language,
  }));
  const totalTokens = fileData.reduce((sum, f) => sum + f.tokens, 0);
  let limit: number;
  if (typeof limitOrModel === 'string' && CONTEXT_PRESETS[limitOrModel]) {
    limit = CONTEXT_PRESETS[limitOrModel];
  } else if (typeof limitOrModel === 'number') {
    limit = limitOrModel;
  } else {
    limit = 8192;
  }
  const result = simulateOverflow(fileData, limit, 'combined');
  if (json) {
    console.log(JSON.stringify({ ...result, limit }, null, 2));
  } else {
    console.log(`\nContextMeter - Overflow Simulation\n${'-'.repeat(50)}`);
    console.log(`Context limit: ${limit.toLocaleString()} tokens`);
    console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`\nResult: ${result.fits ? 'FITS' : 'OVERFLOW'}`);
    console.log(`Saved: ${result.saved} tokens`);
    console.log(`After pruning: ${result.afterPruning.toLocaleString()} tokens`);
    console.log(`Can fit: ${result.fits ? 'Yes' : 'No'}`);
    if (result.suggestions.length > 0) {
      console.log('\nSuggestions:');
      for (const s of result.suggestions) console.log(`  - ${s}`);
    }
  }
}

async function reportCommand(path: string, json = false) {
  const files = scanPath(path);
  const textFiles = files.filter(f => !f.isBinary && f.content !== undefined);
  const fileData = textFiles.map(f => ({
    path: f.relativePath,
    content: f.content!,
    tokens: f.language ? countTokensForLanguage(f.content!, f.language) : approximateTokens(f.content!),
    language: f.language,
  }));
  const totalTokens = fileData.reduce((sum, f) => sum + f.tokens, 0);
  const analyzeResult = analyzeContent(fileData, totalTokens);
  const simResult = simulateOverflow(fileData, 8192, 'combined');
  if (json) {
    console.log(JSON.stringify({ totalTokens, tokenCount: totalTokens, analysis: analyzeResult, simulation: simResult }, null, 2));
  } else {
    console.log(`\nContextMeter - Report\n${'='.repeat(50)}`);
    console.log(`Token Count: ${totalTokens.toLocaleString()}`);
    console.log(`Files: ${fileData.length} (${files.filter(f => f.isBinary).length} binary skipped)`);
    console.log(`Findings: ${analyzeResult.findings.length}`);
    console.log(`Overflow (${simResult.limit.toLocaleString()} tokens): ${simResult.fits ? 'FITS' : 'EXCEEDS'}`);
  }
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

function pathArg(defaultPath = '.'): string {
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' || arg === '--model') {
      i++;
      continue;
    }
    if (arg !== '--json' && !arg.startsWith('-')) return arg;
  }
  return defaultPath;
}

function flagValue(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx < 0) return undefined;

  const value = args[idx + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function parseSimulationLimit(): string | number | undefined {
  const rawLimit = flagValue('--limit');
  const rawModel = flagValue('--model');

  if (rawLimit && rawModel) {
    throw new Error('Use either --limit or --model, not both.');
  }

  if (rawLimit) {
    const parsed = Number(rawLimit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error('--limit must be a positive integer.');
    }
    return parsed;
  }

  if (rawModel) {
    if (!CONTEXT_PRESETS[rawModel]) {
      throw new Error(`Unknown model preset: ${rawModel}. Available presets: ${Object.keys(CONTEXT_PRESETS).join(', ')}`);
    }
    return rawModel;
  }

  return undefined;
}

function showHelp() {
  console.log(`Usage: contextmeter <command> [args]

Commands:
  count <path>              Count tokens in a file or directory
  analyze <path>            Analyze a file or directory for redundancy
  simulate <path> [--limit N|--model name]  Simulate file or directory context overflow
  report <path>             Report on a file or directory

Flags:
  --json            Output results as JSON
  --limit <tokens>  Set token limit for simulation
  --model <name>    Use preset model context window (gpt-4, claude-3-sonnet, etc.)

${VERSION}`);
}

async function main() {
  if (command === 'count') {
    await countCommand(pathArg(), args.includes('--json'));
  } else if (command === 'analyze') {
    await analyzeCommand(pathArg(), args.includes('--json'));
  } else if (command === 'simulate') {
    await simulateCommand(pathArg(), parseSimulationLimit(), args.includes('--json'));
  } else if (command === 'report') {
    await reportCommand(pathArg(), args.includes('--json'));
  } else if (command === '--version' || command === '-V' || command === '-v') {
    console.log(`contextmeter v${VERSION}`);
  } else if (command === '--help' || command === '-h' || command === 'help') {
    showHelp();
  } else {
    throw new Error(`Unknown command: ${command}. Run contextmeter --help for usage information.`);
  }
}

main().catch(error => {
  console.error(formatError(error));
  process.exitCode = 1;
});
