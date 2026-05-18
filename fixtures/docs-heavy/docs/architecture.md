# Architecture Notes

The example service is intentionally described with enough prose to behave like
a real agent handoff document. It explains boundaries, tradeoffs, and operational
constraints so ContextMeter can show how documentation consumes context budget.

## Components

- A command entrypoint receives local file paths.
- A scanner walks configured globs without contacting external services.
- A reporter renders stable Markdown or JSON for downstream automation.

## Decisions

The service keeps token estimates deterministic. Exact tokenizer parity is less
important than a stable local ruler that developers can run before assembling a
prompt pack.

## Risks

Large architecture notes can crowd out source files. Teams should split durable
reference material from transient investigation notes when budgets are tight.
