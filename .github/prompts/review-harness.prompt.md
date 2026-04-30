---
description: "Review the repository for agent-legibility gaps, stale docs, missing checks, and overgrown instructions."
name: "Review Harness"
argument-hint: "Optional focus area, such as docs, architecture, tests, or prompts"
agent: "agent"
---

Review the repo as a Codex-first agent harness. Keep output caveman-terse unless clarity requires normal prose.

Prioritize findings in this order:

- Missing system-of-record docs.
- Instructions that are too broad, duplicated, stale, or always-on without need.
- Missing validation commands.
- Architecture boundaries that are documented but not enforced.
- Repeated manual judgment that should become a rule, template, or check.

Output findings first, then a short fix plan. Do not stray from harness engineering.