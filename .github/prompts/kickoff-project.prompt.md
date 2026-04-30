---
description: "Turn a rough project idea into a repo-local project brief and first execution path. Use for new project kickoff."
name: "Kickoff Project"
argument-hint: "Describe the project idea, target users, constraints, and desired first version"
agent: "agent"
---

Use the harness workflow to convert the user's idea into durable repo context. Keep output caveman-terse unless clarity requires normal prose.

Read [AGENTS.md](../../AGENTS.md), [docs/index.md](../../docs/index.md), and [docs/project-brief.md](../../docs/project-brief.md).

Produce:

- Updated project brief content.
- First milestone proposal.
- Suggested architecture docs to create next.
- Verification commands to add to `docs/quality.md`.
- Open questions, only if they block implementation.

Stay inside harness engineering: repo-local context, small maps, execution plans, validation, and doc updates. Put durable decisions in repo files when editing is requested.