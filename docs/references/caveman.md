# Caveman Notes

Source: https://github.com/JuliusBrussee/caveman

## Purpose

Caveman mode compresses agent responses while preserving technical accuracy. It is useful for routine progress, reviews, commits, and low-risk implementation loops.

## Activation

- `/caveman`
- `/caveman lite`
- `/caveman ultra`
- `caveman mode`
- `less tokens please`

Stop with `stop caveman` or `normal mode`.

## Local Rule

Use compressed output for conversation, not for code, commit bodies, user-facing copy, or documents that need normal prose.

## Clarity Escape Hatch

Use normal prose for:

- Security warnings.
- Irreversible operations.
- Ambiguous multi-step instructions.
- User confusion or repeated clarification requests.

## Starter-Kit Role

Caveman saves output tokens. Harness docs preserve direction. Use both together: terse chat, explicit repo knowledge.