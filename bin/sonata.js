#!/usr/bin/env node
import { access, chmod, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = path.join(rootDir, 'templates', 'default');
const agentChoices = [
  { id: 'codex', label: 'Codex' },
  { id: 'copilot', label: 'Copilot' },
  { id: 'claude', label: 'Claude Code' }
];

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'init') {
  await initProject(args.slice(1));
} else if (command === 'retrofit') {
  await retrofitProject(args.slice(1));
} else if (command === 'update') {
  await updateProject(args.slice(1));
} else if (command === 'version' || command === '--version' || command === '-v') {
  const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));
  console.log(packageJson.version);
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

async function retrofitProject(rawArgs) {
  const options = parseArgs(rawArgs);
  const interactive = !options.yes && process.stdin.isTTY;
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;

  try {
    const targetDir = process.cwd();
    const projectName = options.name || path.basename(targetDir);
    const agents = normalizeAgents(options.agents || options.agent || 'codex');
    const values = {
      projectName,
      projectSlug: slugify(projectName) || projectName,
      projectDescription: options.description || `Retrofitted Sonata harness for ${projectName}`,
      projectKind: options.kind || 'existing project',
      stack: options.stack || 'unknown',
      packageManager: options.packageManager || 'unknown',
      firstMilestone: options.milestone || 'Normalize existing project into Sonata harness',
      cavemanMode: options.cavemanMode || 'full',
      agentTargets: agents.map((agent) => labelForAgent(agent)).join(', '),
      primaryAgent: labelForAgent(agents[0] || 'codex'),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const conflicts = await collectExistingTemplateFiles(templateDir, targetDir, agents);
    const overwrite = options.force || await confirmOverwrite(rl, conflicts);

    await copyTemplate(templateDir, targetDir, values, {
      agents,
      overwrite
    });
    await chmod(path.join(targetDir, 'scripts', 'check-sonata.sh'), 0o755);

    if (conflicts.length && !overwrite) {
      console.log(`Preserved ${conflicts.length} existing file(s). Use --force to overwrite Sonata-managed files.`);
    }

    console.log('Retrofitted current project');
    console.log(`Agents: ${values.agentTargets}`);
    console.log('Check: ./scripts/check-sonata.sh');
  } finally {
    rl?.close();
  }
}

async function updateProject(rawArgs) {
  const options = parseArgs(rawArgs);

  if (options.force) {
    throw new Error('sonata update never overwrites files. Use retrofit --force only when replacement is intentional.');
  }

  const targetDir = process.cwd();
  if (!await isLikelySonataProject(targetDir)) {
    throw new Error('sonata update only runs inside an existing Sonata project. Use retrofit for non-Sonata projects.');
  }

  const agents = await detectAgents(targetDir, options.agents || options.agent);
  const values = await buildExistingProjectValues(targetDir, options, agents);
  const result = await copyTemplate(templateDir, targetDir, values, {
    agents,
    overwrite: false
  });
  const checkScript = path.join(targetDir, 'scripts', 'check-sonata.sh');

  if (await exists(checkScript)) {
    await chmod(checkScript, 0o755);
  }

  console.log('Updated current project');
  console.log(`Added: ${result.written} file(s)`);
  console.log(`Preserved: ${result.skipped} existing file(s)`);
  console.log(`Agents: ${values.agentTargets}`);
  console.log('Check: ./scripts/check-sonata.sh');
}

async function isLikelySonataProject(targetDir) {
  return await exists(path.join(targetDir, 'scripts', 'check-sonata.sh')) ||
    await exists(path.join(targetDir, '.codex', 'skills', 'init-sonata', 'SKILL.md')) ||
    (await readIfExists(path.join(targetDir, 'AGENTS.md'))).includes('Sonata');
}

async function detectAgents(targetDir, value) {
  if (typeof value === 'string' && value.trim()) {
    return normalizeAgents(value);
  }

  const detected = ['codex'];

  if (await exists(path.join(targetDir, '.github', 'copilot-instructions.md'))) detected.push('copilot');
  if (await exists(path.join(targetDir, 'CLAUDE.md')) || await exists(path.join(targetDir, '.claude'))) detected.push('claude');

  return normalizeAgents(detected.join(','));
}

async function buildExistingProjectValues(targetDir, options, agents) {
  const facts = await readGeneratedFacts(targetDir);
  const projectName = options.name || facts.projectName || path.basename(targetDir);

  return {
    projectName,
    projectSlug: slugify(projectName) || projectName,
    projectDescription: options.description || `Updated Sonata harness for ${projectName}`,
    projectKind: options.kind || facts.projectKind || 'existing project',
    stack: options.stack || facts.stack || 'unknown',
    packageManager: options.packageManager || facts.packageManager || 'unknown',
    firstMilestone: options.milestone || 'Keep Sonata harness current without overwriting project work',
    cavemanMode: options.cavemanMode || facts.cavemanMode || 'full',
    agentTargets: agents.map((agent) => labelForAgent(agent)).join(', '),
    primaryAgent: facts.primaryAgent || labelForAgent(agents[0] || 'codex'),
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

async function readGeneratedFacts(targetDir) {
  const content = await readIfExists(path.join(targetDir, 'AGENTS.md'));

  return {
    projectName: matchLine(content, /^Project:\s*(.+)$/m),
    primaryAgent: matchLine(content, /^Primary agent:\s*(.+)$/m),
    projectKind: matchLine(content, /^-\s*Kind:\s*(.+)$/m),
    stack: matchLine(content, /^-\s*Stack:\s*(.+)$/m),
    packageManager: matchLine(content, /^-\s*Package manager:\s*(.+)$/m),
    cavemanMode: matchLine(content, /^-\s*Default caveman mode:\s*(.+)$/m)
  };
}

async function initProject(rawArgs) {
  const options = parseArgs(rawArgs);
  const interactive = !options.yes && process.stdin.isTTY;
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;

  try {
    const targetInput = options.positionals[0] || options.target;
    const inPlace = targetInput === '.' || targetInput === './';
    const fallbackName = inPlace ? path.basename(process.cwd()) : 'my-sonata-project';
    const projectName = await valueOrAsk(rl, inPlace ? options.name : targetInput || options.name, 'project-name', fallbackName);
    const projectSlug = inPlace ? '.' : slugify(projectName);

    if (!projectSlug) {
      throw new Error('Project name must contain letters or numbers.');
    }

    const agents = await selectAgents(rl, options.agents || options.agent);
    const description = await valueOrAsk(rl, options.description, 'what are we building?', 'Agent-legible project built with Sonata');
    const kind = await valueOrAsk(rl, options.kind, 'project kind', 'generic app');
    const stack = await valueOrAsk(rl, options.stack, 'stack/runtime', 'undecided');
    const packageManager = await valueOrAsk(rl, options.packageManager, 'package manager', 'bun');
    const milestone = await valueOrAsk(rl, options.milestone, 'first useful milestone', 'Create first useful version');
    const cavemanMode = await valueOrAsk(rl, options.cavemanMode, 'default caveman mode', 'full');
    const targetDir = path.resolve(process.cwd(), projectSlug);

    if (await exists(targetDir)) {
      const targetStats = await stat(targetDir);
      if (!targetStats.isDirectory()) {
        throw new Error(`Target exists and is not a directory: ${targetDir}`);
      }

      if (!options.force && !options.retrofit) {
        throw new Error(`Target directory already exists: ${targetDir}. Re-run with --force to overwrite or --retrofit to merge missing harness files.`);
      }
    }

    const values = {
      projectName,
      projectSlug: inPlace ? path.basename(targetDir) : projectSlug,
      projectDescription: description,
      projectKind: kind,
      stack,
      packageManager,
      firstMilestone: milestone,
      cavemanMode,
      agentTargets: agents.map((agent) => labelForAgent(agent)).join(', '),
      primaryAgent: labelForAgent(agents[0] || 'codex'),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    await mkdir(targetDir, { recursive: true });
    await copyTemplate(templateDir, targetDir, values, {
      agents,
      overwrite: !options.retrofit
    });
    await chmod(path.join(targetDir, 'scripts', 'check-sonata.sh'), 0o755);

    console.log(`Created ${projectSlug}`);
    console.log(`Next: cd ${projectSlug}`);
    console.log(`Agents: ${values.agentTargets}`);
    console.log('Check: ./scripts/check-sonata.sh');
  } finally {
    rl?.close();
  }
}

function parseArgs(rawArgs) {
  const options = { positionals: [] };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg.startsWith('--')) {
      const key = toCamelCase(arg.slice(2));
      const next = rawArgs[index + 1];
      if (!next || next.startsWith('--')) {
        options[key] = true;
      } else {
        options[key] = next;
        index += 1;
      }
    } else {
      options.positionals.push(arg);
    }
  }

  return options;
}

async function valueOrAsk(rl, value, label, fallback) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (!rl) {
    return fallback;
  }

  const answer = await rl.question(`${label} (${fallback}): `);
  return answer.trim() || fallback;
}

async function selectAgents(rl, value) {
  if (typeof value === 'string' && value.trim()) {
    return normalizeAgents(value);
  }

  if (!rl) {
    return ['codex'];
  }

  console.log('Agent targets:');
  agentChoices.forEach((agent, index) => {
    const marker = agent.id === 'codex' ? 'default' : 'optional';
    console.log(`  ${index + 1}. ${agent.label} (${marker})`);
  });

  const answer = await rl.question('select agents, comma-separated (1): ');
  return normalizeAgents(answer || '1');
}

function normalizeAgents(value) {
  const tokens = value
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const selected = new Set();

  for (const token of tokens.length ? tokens : ['codex']) {
    if (token === 'all' || token === '*') {
      agentChoices.forEach((agent) => selected.add(agent.id));
    } else if (token === '1' || token === 'codex') {
      selected.add('codex');
    } else if (token === '2' || token === 'copilot' || token === 'github-copilot') {
      selected.add('copilot');
    } else if (token === '3' || token === 'claude' || token === 'claude-code') {
      selected.add('claude');
    } else {
      throw new Error(`Unknown agent target: ${token}. Use codex, copilot, claude, or all.`);
    }
  }

  selected.add('codex');
  return agentChoices.map((agent) => agent.id).filter((agent) => selected.has(agent));
}

function labelForAgent(agentId) {
  return agentChoices.find((agent) => agent.id === agentId)?.label || agentId;
}

async function collectExistingTemplateFiles(sourceDir, targetDir, agents) {
  const files = [];
  await collectExistingTemplateFilesInDir(sourceDir, sourceDir, targetDir, agents, files);
  return files;
}

async function collectExistingTemplateFilesInDir(sourceRoot, currentSourceDir, currentTargetDir, agents, files) {
  const entries = await readdir(currentSourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const sourcePath = path.join(currentSourceDir, entry.name);
    const relativeSourcePath = path.relative(sourceRoot, sourcePath);

    if (shouldSkipAgentFile(relativeSourcePath, agents)) {
      continue;
    }

    const targetName = entry.name === '_gitignore' ? '.gitignore' : entry.name;
    const targetPath = path.join(currentTargetDir, targetName);

    if (entry.isDirectory()) {
      await collectExistingTemplateFilesInDir(sourceRoot, sourcePath, targetPath, agents, files);
    } else if (await exists(targetPath)) {
      files.push(path.relative(process.cwd(), targetPath) || path.basename(targetPath));
    }
  }
}

async function confirmOverwrite(rl, conflicts) {
  if (!conflicts.length) {
    return false;
  }

  if (!rl) {
    return false;
  }

  console.log('Existing files would be overwritten if allowed:');
  conflicts.slice(0, 20).forEach((file) => console.log(`  ${file}`));
  if (conflicts.length > 20) {
    console.log(`  ...and ${conflicts.length - 20} more`);
  }

  const answer = await rl.question('Danger: overwrite these files? Type "overwrite" to replace, Enter to preserve: ');
  return answer.trim().toLowerCase() === 'overwrite';
}

async function copyTemplate(sourceDir, targetDir, values, options) {
  return renderDirectory(sourceDir, sourceDir, targetDir, values, options);
}

async function renderDirectory(sourceRoot, currentSourceDir, currentTargetDir, values, options) {
  const entries = await readdir(currentSourceDir, { withFileTypes: true });
  const stats = { written: 0, skipped: 0 };

  for (const entry of entries) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const sourcePath = path.join(currentSourceDir, entry.name);
    const relativeSourcePath = path.relative(sourceRoot, sourcePath);

    if (shouldSkipAgentFile(relativeSourcePath, options.agents)) {
      continue;
    }

    const targetName = entry.name === '_gitignore' ? '.gitignore' : render(entry.name, values);
    const targetPath = path.join(currentTargetDir, targetName);

    if (entry.isDirectory()) {
      await mkdir(targetPath, { recursive: true });
      const childStats = await renderDirectory(sourceRoot, sourcePath, targetPath, values, options);
      stats.written += childStats.written;
      stats.skipped += childStats.skipped;
    } else if (isTextFile(sourcePath)) {
      if (!options.overwrite && await exists(targetPath)) {
        stats.skipped += 1;
        continue;
      }

      const content = await readFile(sourcePath, 'utf8');
      await writeFile(targetPath, render(content, values));
      stats.written += 1;
    }
  }

  return stats;
}

function shouldSkipAgentFile(relativePath, agents) {
  if (!agents.includes('copilot') && relativePath === path.join('.github', 'copilot-instructions.md')) {
    return true;
  }

  if (!agents.includes('claude') && (relativePath === 'CLAUDE.md' || relativePath === '.claude' || relativePath.startsWith(`.claude${path.sep}`))) {
    return true;
  }

  return false;
}

function render(input, values) {
  return input.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key) => values[key] ?? '');
}

function isTextFile(filePath) {
  return /\.(md|txt|json|sh|js|ts|yml|yaml|toml|gitignore)$/i.test(filePath) || path.basename(filePath) === 'AGENTS.md';
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

function matchLine(content, pattern) {
  return content.match(pattern)?.[1]?.trim() || '';
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function printHelp() {
  console.log(`sonata

Usage:
  sonata init [project-name] [options]
  sonata retrofit [options]
  sonata update [options]

Options:
  --description <text>       Project intent
  --kind <text>              Project kind, e.g. neoforge mod, web app, CLI
  --stack <text>             Runtime or stack
  --package-manager <name>   bun, npm, pnpm, gradle, etc.
  --milestone <text>         First useful milestone
  --caveman-mode <mode>      lite, full, ultra, wenyan-lite, wenyan-full, wenyan-ultra
  --agents <list>            codex, copilot, claude, or all. Codex always included
  --yes, -y                  Use defaults for missing values
  --force, -f                Overwrite template-managed files in an existing directory
                             Not supported by update; update never overwrites files

Examples:
  bunx github:gisketch/sonata init
  bunx github:gisketch/sonata init trade-mod
  bunx github:gisketch/sonata retrofit
  bunx github:gisketch/sonata update
  bunx github:gisketch/sonata init trade-mod --agents all`);
}
