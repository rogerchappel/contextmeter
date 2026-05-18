# ContextMeter PRD

Status: in-progress

## One-liner

ContextMeter measures repo prompt packs, docs, and source excerpts against configurable token budgets before an agent run wastes context.

## Problem

Agent workflows often assemble large context bundles from README files, docs, source files, and prompts. Without a local budget check, bundles become noisy, expensive, and brittle.

## Users

- Developers preparing agent handoff packs
- Maintainers keeping docs concise
- Agents selecting files for bounded context windows

## V1 Scope

- Scan configured globs from contextmeter.json.
- Estimate tokens with deterministic heuristics and byte/line counts.
- Group results by category.
- Flag files and categories over budget.
- Emit Markdown and JSON reports.
- Include fixtures for docs-heavy and source-heavy repos.

## Non-goals

- Provider-specific exact tokenizer parity.
- Uploading content to remote LLM APIs.
- Semantic summarization.

## CLI Sketch

    contextmeter scan .
    contextmeter scan . --config contextmeter.json --format json
    contextmeter budget 'docs/**/*.md' --max-tokens 12000

## Differentiation

ContextMeter is a local ruler for agent context. It does not decide what is important; it shows what is expensive and where the budget is going.

## Source attribution

Inspired by context-engineering pressure in agentic coding workflows and Roger's local-first OSS factory process.

