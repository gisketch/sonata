# Agent Map

This repository is the Sonata CLI package. It generates Codex-first agent harness starter projects. Keep this file short. Treat it as a map, not the manual.

## Default Behavior

- Read [docs/index.md](docs/index.md) before large changes.
- Default to caveman-compatible progress: terse, exact, no filler.
- Drop compression for safety warnings, irreversible actions, confusing multi-step instructions, or when the user asks for clarity.
- Preserve the `bunx github:gisketch/sonata init` use case when changing package metadata or CLI behavior.
- Keep Codex as the default generated agent; Copilot and Claude Code remain optional compatibility targets.
- For tasks with design uncertainty, create or update an execution plan in [docs/exec-plans/active](docs/exec-plans/active).
- When a missing rule causes friction, update docs or scripts so future agents inherit the lesson.

## Knowledge Map

- [docs/core-beliefs.md](docs/core-beliefs.md): operating principles.
- [docs/project-brief.md](docs/project-brief.md): product intent, users, constraints, milestones.
- [docs/architecture/index.md](docs/architecture/index.md): domain map and layer rules.
- [docs/quality.md](docs/quality.md): verification commands and quality bars.
- [docs/exec-plans/README.md](docs/exec-plans/README.md): planning workflow.
- [docs/references/harness-engineering.md](docs/references/harness-engineering.md): source ideas from OpenAI harness engineering.
- [docs/references/caveman.md](docs/references/caveman.md): compressed communication rules.
- [templates/default](templates/default): generated project scaffold.
- [bin/sonata.js](bin/sonata.js): dependency-free CLI entrypoint.

## Work Loop

1. Clarify goal and acceptance criteria.
2. Read only the docs needed for the task.
3. Plan at the smallest useful level.
4. Implement within existing boundaries.
5. Run relevant checks from [docs/quality.md](docs/quality.md).
6. Update docs when behavior, decisions, or constraints change.

## Package Constraint

The CLI should stay dependency-free unless a clear feature requires otherwise. Generated projects should stay framework-neutral unless the init answers or future template options choose a stack.