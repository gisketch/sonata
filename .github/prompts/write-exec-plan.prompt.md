---
description: "Create or update a checked-in execution plan for multi-step work. Use before larger features, refactors, or risky fixes."
name: "Write Exec Plan"
argument-hint: "Feature, refactor, bug, or project milestone"
agent: "agent"
---

Create an execution plan under `docs/exec-plans/active/` using the harness skill template. Keep output caveman-terse unless clarity requires normal prose.

Include:

- Goal.
- Acceptance criteria.
- Context links.
- Step-by-step plan.
- Validation commands.
- Decision log.
- Progress log.

Read only the docs needed for the task. Keep the plan specific enough that another agent can continue without chat history. Do not stray from harness engineering.