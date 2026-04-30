# Architecture

This starter is framework-neutral. Replace this with the real system map once the project brief chooses a stack.

## Default Layer Direction

Use this simple direction until the project needs something more specific:

```text
types -> config -> data -> service -> runtime -> interface
```

Cross-cutting concerns such as auth, telemetry, feature flags, and external integrations should enter through explicit provider interfaces.

## Domain Template

For each domain, document:

- Purpose.
- Owned data shapes.
- Public interfaces.
- Allowed dependencies.
- Verification commands.
- Known risks.

## Boundary Rule

If a dependency direction matters, document it here first, then enforce it with lint, tests, or scripts when possible.