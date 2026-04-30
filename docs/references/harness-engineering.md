# Harness Engineering Notes

Source: https://openai.com/index/harness-engineering/

## Useful Principles

- Humans steer; agents execute.
- The repo should be the system of record.
- Give agents a map, not a giant instruction manual.
- Make app behavior, logs, checks, and docs legible to agents.
- Treat plans as first-class artifacts.
- Enforce stable architecture and taste with checks where possible.
- When documentation is insufficient, promote the rule into tooling.
- Throughput increases the value of small, repeatable cleanup loops.

## Starter-Kit Translation

- `AGENTS.md` stays short and links outward.
- `docs/` holds the durable project memory.
- `.github/skills/` holds repeatable workflows.
- `.github/prompts/` holds single-task reusable prompts.
- `scripts/check-harness.sh` provides the first mechanical guardrail.

## Anti-Patterns To Avoid

- One huge instruction file.
- Chat-only architecture decisions.
- Unchecked assumptions about data shapes.
- Repeating the same review comment without adding a rule, doc, or check.
- Adding framework machinery before the project brief requires it.