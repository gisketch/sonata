# Quality

This file is the agent's verification menu. Keep it current as the project gains tooling.

## Current Checks

| Check | Command | When To Run |
|---|---|---|
| Package and harness structure | `npm run check` | Before handoff |
| Harness structure only | `bash scripts/check-harness.sh` | After scaffold or doc changes |
| Init smoke test | `npm run smoke:init` | After CLI or template changes |

## Add Later

When a concrete app stack exists, add commands for:

- Install dependencies.
- Format.
- Lint.
- Typecheck.
- Unit tests.
- Integration tests.
- Build.
- Local run or smoke test.

## Quality Bar

- Changes should include validation appropriate to risk.
- Documentation should change when behavior or decisions change.
- Repeated mistakes should become checks, templates, or clearer docs.
- Generated files should be easy for future agents to inspect and update.
- Codex-first behavior should stay intact: `bunx github:gisketch/sonata init` must work without extra flags.