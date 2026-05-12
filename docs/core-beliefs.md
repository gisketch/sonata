# Core Beliefs

## Agent Legibility First

Agents can only use context they can inspect. Put product decisions, architecture, checks, and recurring lessons in the repo.

## Map, Then Details

Use short entry points that link to deeper docs. Large always-on instruction files waste context and go stale.

## Small Files, Clear Boundaries

Prefer small, focused files an agent can inspect in one pass. Aim for 100-200 lines when practical. Treat 500+ line files as a design smell unless they are generated, framework-required, data-heavy, or clearer as one file. Split by feature, responsibility, or interface boundary.

## Direction Over Verbosity

Use terse communication for routine progress, but keep acceptance criteria and execution plans explicit.

## Missing Capability Is A Design Signal

When an agent fails repeatedly, identify the missing capability: docs, script, fixture, lint, test, observability, or clearer boundary.

## Enforce What Must Stay True

Prefer mechanical checks for boundaries, commands, schemas, and quality bars. Docs guide behavior; checks prevent drift.

## Small Plans For Small Work

Use lightweight inline plans for narrow edits. Use checked-in execution plans for multi-step or high-risk changes.

## Garbage Collect Continuously

Stale docs, vague rules, duplicate helpers, and unverified assumptions compound. Schedule small cleanup work instead of heroic rewrites.
