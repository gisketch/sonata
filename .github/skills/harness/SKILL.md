---
name: harness
description: "Use when: starting a new Codex-first project, turning a rough idea into a repo-local plan, improving agent legibility, creating execution plans, or applying harness engineering workflows. Always keep caveman-terse output unless clarity requires normal prose."
argument-hint: "Project idea, feature, bug, or repo-legibility task"
---

# Harness Skill

Use this workflow to keep projects directional, inspectable, and token efficient.

## Procedure

1. Intake the user's goal, desired outcome, constraints, and acceptance criteria.
2. Read [AGENTS.md](../../../AGENTS.md), [docs/index.md](../../../docs/index.md), and only the linked docs needed for the task.
3. Choose the smallest useful planning level:
   - Tiny task: brief inline plan.
   - Multi-step work: execution plan in `docs/exec-plans/active/`.
   - New project: fill `docs/project-brief.md` first.
4. Identify missing agent capability: docs, scripts, tests, fixtures, logs, screenshots, examples, or stricter boundaries.
5. Implement the smallest durable improvement.
6. Run checks from [docs/quality.md](../../../docs/quality.md).
7. Update docs when new decisions or constraints appear.

## Communication Contract

- Routine status: caveman-terse by default.
- Plans and acceptance criteria: explicit enough for another agent to continue.
- Safety or irreversible operations: normal prose.
- Do not stray from harness engineering: repo-local context, small maps, execution plans, validation, and doc updates.

## Output Shape

For kickoff or planning, return:

```text
Goal:
Acceptance:
Plan:
Checks:
Docs to update:
Open questions:
```

## References

- [Execution plan template](./references/exec-plan-template.md)
- [Project map template](./references/project-map-template.md)
- [Quality checklist](./references/quality-checklist.md)