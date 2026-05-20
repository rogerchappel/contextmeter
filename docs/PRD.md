# PRD: contextmeter

Status: in-progress

## Summary

ContextMeter is a local-first TypeScript CLI that measures, analyzes, and optimizes LLM context window usage. It counts tokens in files, prompts, and conversation histories, identifies redundant or low-value content, simulates context window overflow scenarios, and suggests pruning strategies — all without calling any API.

Built for developers and agentic workflows managing large codebases, system prompts, and multi-file context injection.

## Inspiration

- `rohitg00/agentmemory` (15k+ stars in a week) shows huge demand for agent context management.
- `colbymchenry/codegraph` (9k+ stars) shows interest in reducing token waste through structured code knowledge.
- Context window waste is a real cost and quality problem for every AI developer tool.

Reframed: contextmeter is **disk usage analyzer for context windows** — see what's eating your tokens, find the waste, fix it.

## Scorecard

Total: 87/100
Band: build now

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Context overflow causes silent quality drops and cost waste; no local tool maps token usage. |
| Demand signal | 18/20 | Agent memory repos getting 15k+ stars/week proves massive, growing demand. |
| V1 buildability | 17/20 | Token counting (tiktoken-compatible) is well-documented; file scanning and analysis is straightforward. |
| Differentiation | 14/15 | First tool focused on *measurement and optimization* of context usage, not just storage. |
| Agentic workflow leverage | 13/15 | Agents need to manage their own context; this gives them the data. |
| Distribution potential | 7/10 | Clear name, practical problem, wide audience. |

## MVP

- Count tokens in files, directories, and prompt templates using local tokenizers
- Context usage breakdown: which files consume the most tokens?
- Detect: duplicate content across files, outdated references, verbose boilerplate
- Simulate overflow: "what gets cut if context window is N tokens?"
- Suggest pruning strategies
- Output: JSON report + human-readable breakdown
- CLI: `contextmeter count [path]`, `contextmeter analyze`, `contextmeter simulate`, `contextmeter report`

## Tech stack

TypeScript, Node.js CLI, local token counting (compatible with tiktoken encoding)

## Non-goals

- No model API calls or LLM inference
- No automatic context management or injection
- No conversation history replay
