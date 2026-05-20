#!/usr/bin/env node
import { scanDirectory, loadGitignore, DEFAULT_EXCLUDES } from './utils/file-scanner.js';
import { approximateTokens, countTokensForLanguage } from './core/token-counter.js';

// Stub for now — will be expanded in later commits
async function countCommand(path: string, json = false) {
  const files = scanDirectory(path, [...DEFAULT_EXCLUDES, ...(loadGitignore(path))]);
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
    console.log(`Scanned: ${textFiles.length} files (${files.filter(f=>f.isBinary).length} binary, skipped)`);
    console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
    console.log('\nTop files by token usage:');
    for (const f of fileTokens.slice(0, 5)) {
      const pct = totalTokens > 0 ? ((f.tokens / totalTokens) * 100).toFixed(1) : '0.0';
      console.log(`  ${f.path.padEnd(50)} ${f.tokens} tokens (${pct}%)`);
    }
    console.log(`\nTip: run 'contextmeter analyze ${path}' to find redundancy.`);
  }
  return totalTokens;
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

if (command === 'count') {
  const pathArg = args[1] || '.';
  const jsonFlag = args.includes('--json');
  countCommand(pathArg, jsonFlag).catch(console.error);
} else {
  console.log(`Usage: contextmeter <command> [args]

Commands:
  count <path>      Count tokens in a file or directory
  analyze <path>    Analyze content for redundancy
  simulate <path>   Simulate context window overflow

Flags:
  --json            Output results as JSON
  --limit <tokens>  Set token limit for simulation
  --model <name>    Use preset model context window
  --help            Show this help
  --version         Show version`);
}
