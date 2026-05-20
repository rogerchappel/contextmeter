# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] — 2026-05-21

### Added
- **Token Counter** — tiktoken-compatible token estimation for 20+ languages
  - `approximateTokens()`: ~1 token per 3.6 characters (cl100k_base)
  - `countTokens()`: BPE-style word splitting for better accuracy
  - Language-aware estimation ratios (TypeScript, Python, Go, Rust, etc.)
- **File Scanner** — recursive directory traversal with `.gitignore` support
  - Binary file detection and skipping
  - Extension-based language detection (30+ file types)
  - Exclusion patterns for `node_modules`, `.git`, lockfiles, minified files
- **Content Analyzer** — identify redundancy across your codebase
  - Duplicate content detection across files
  - Boilerplate identification (licenses, auto-generated comments)
  - Verbose content detection (long comment blocks ≥10 lines)
  - Stale reference detection (empty TODOs, workarounds, dated markers)
  - Per-file token breakdown with percentage calculations
- **Overflow Simulator** — simulate context window overflows
  - 18 model presets (OpenAI, Anthropic, Google, Meta, Mistral)
  - Pruning strategies: combined, truncate, remove-boilerplate, remove-low-value, deduplicate
  - Detailed optimization suggestions
- **CLI** — four commands for analysis workflow
  - `count <path>` — count tokens in files/directories
  - `analyze <path>` — analyze content for redundancy
  - `simulate <path>` — simulate context window overflow (`--limit`, `--model`)
  - `report <path>` — combined token count + analysis + simulation
  - JSON output with `--json` flag
- **Documentation** — README, CONTRIBUTING, AGENTS, PRD, ROADMAP, SECURITY
- **Test fixtures** — sample codebase with TypeScript, config, README, and prompt files

### Technical
- TypeScript with `node:test` framework
- ESM modules with `tsx` for transpilation
- 80+ unit and integration tests
