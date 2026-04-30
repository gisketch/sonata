#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
cd "$repo_root"

required_files=(
  "AGENTS.md"
  "README.md"
  "package.json"
  "bin/sonata.js"
  "docs/index.md"
  "docs/core-beliefs.md"
  "docs/project-brief.md"
  "docs/quality.md"
  "docs/architecture/index.md"
  "docs/exec-plans/README.md"
  "docs/references/harness-engineering.md"
  "docs/references/caveman.md"
  ".github/skills/harness/SKILL.md"
  ".github/skills/caveman/SKILL.md"
  ".github/prompts/kickoff-project.prompt.md"
  ".github/prompts/write-exec-plan.prompt.md"
  ".github/prompts/review-harness.prompt.md"
  "templates/default/AGENTS.md"
  "templates/default/docs/agent-targets.md"
  "templates/default/docs/project-brief.md"
  "templates/default/.codex/prompts/init-sonata.md"
  "templates/default/.codex/prompts/caveman-sonata.md"
  "templates/default/.codex/prompts/retrofit-sonata.md"
  "templates/default/.codex/skills/init-sonata/SKILL.md"
  "templates/default/.codex/skills/caveman-sonata/SKILL.md"
  "templates/default/.codex/skills/retrofit-sonata/SKILL.md"
  ".codex/skills/init-sonata/SKILL.md"
  ".codex/skills/caveman-sonata/SKILL.md"
  ".codex/skills/retrofit-sonata/SKILL.md"
  "templates/default/.github/skills/init-sonata/SKILL.md"
  "templates/default/.github/skills/caveman-sonata/SKILL.md"
  "templates/default/.github/skills/retrofit-sonata/SKILL.md"
  "templates/default/.github/copilot-instructions.md"
  "templates/default/CLAUDE.md"
  "templates/default/.claude/skills/init-sonata/SKILL.md"
  "templates/default/.claude/skills/caveman-sonata/SKILL.md"
  "templates/default/.claude/skills/retrofit-sonata/SKILL.md"
  "templates/default/scripts/check-sonata.sh"
)

missing=0

for file in "${required_files[@]}"; do
  if [[ ! -s "$file" ]]; then
    printf 'missing or empty: %s\n' "$file"
    missing=1
  fi
done

if [[ $missing -ne 0 ]]; then
  exit 1
fi

if grep -R "TODO\|TBD" AGENTS.md docs .github/skills .github/prompts >/dev/null 2>&1; then
  printf 'warning: placeholder markers found\n'
fi

node --check bin/sonata.js >/dev/null

printf 'harness ok\n'