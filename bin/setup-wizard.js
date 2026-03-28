#!/usr/bin/env node

/**
 * Claude Code Scanner — Interactive Setup Wizard
 * Zero dependencies — uses only Node.js built-in readline
 *
 * Usage: npx claude-code-scanner setup
 *        npx claude-code-scanner init --interactive
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ─── Colors ────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
};

// ─── UI Helpers ────────────────────────────────────────────────────────
function banner() {
  console.log('');
  console.log(`${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║        Claude Code Scanner — Setup Wizard                ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}║   Configure your AI development environment interactively ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════╝${C.reset}`);
  console.log('');
  console.log(`${C.dim}  Use arrow keys / numbers to select, Enter to confirm${C.reset}`);
  console.log(`${C.dim}  Toggle items with Space, confirm selection with Enter${C.reset}`);
  console.log('');
}

function sectionHeader(num, title, desc) {
  console.log('');
  console.log(`${C.cyan}${C.bold}━━━ Step ${num} ━━━ ${title} ━━━${C.reset}`);
  if (desc) console.log(`${C.dim}  ${desc}${C.reset}`);
  console.log('');
}

function success(msg) { console.log(`  ${C.green}✓${C.reset} ${msg}`); }
function info(msg) { console.log(`  ${C.cyan}ℹ${C.reset} ${msg}`); }

// ─── Prompt Functions ──────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultVal) {
  return new Promise(resolve => {
    const def = defaultVal ? ` ${C.dim}(${defaultVal})${C.reset}` : '';
    rl.question(`  ${C.white}${question}${def}: ${C.reset}`, answer => {
      resolve(answer.trim() || defaultVal || '');
    });
  });
}

function select(question, options, defaultIdx = 0) {
  return new Promise(resolve => {
    console.log(`  ${C.white}${question}${C.reset}`);
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? `${C.green}▸${C.reset}` : ' ';
      const label = typeof opt === 'object' ? opt.label : opt;
      const desc = typeof opt === 'object' && opt.desc ? ` ${C.dim}— ${opt.desc}${C.reset}` : '';
      console.log(`  ${marker} ${C.cyan}${i + 1}${C.reset}) ${label}${desc}`);
    });
    rl.question(`\n  ${C.dim}Enter number [${defaultIdx + 1}]:${C.reset} `, answer => {
      const idx = answer.trim() ? parseInt(answer) - 1 : defaultIdx;
      const val = idx >= 0 && idx < options.length ? idx : defaultIdx;
      const chosen = typeof options[val] === 'object' ? options[val].value : options[val];
      success(`Selected: ${typeof options[val] === 'object' ? options[val].label : options[val]}`);
      resolve(chosen);
    });
  });
}

function multiSelect(question, options, defaultSelected = []) {
  return new Promise(resolve => {
    console.log(`  ${C.white}${question}${C.reset}`);
    console.log(`  ${C.dim}Enter numbers separated by commas (e.g., 1,3,5) or "all" for everything${C.reset}`);
    options.forEach((opt, i) => {
      const checked = defaultSelected.includes(i) ? `${C.green}[✓]${C.reset}` : `${C.dim}[ ]${C.reset}`;
      const label = typeof opt === 'object' ? opt.label : opt;
      const desc = typeof opt === 'object' && opt.desc ? ` ${C.dim}— ${opt.desc}${C.reset}` : '';
      console.log(`  ${checked} ${C.cyan}${i + 1}${C.reset}) ${label}${desc}`);
    });
    rl.question(`\n  ${C.dim}Selection:${C.reset} `, answer => {
      let selected;
      const input = answer.trim().toLowerCase();
      if (input === 'all' || input === '') {
        selected = options.map((_, i) => i);
      } else {
        selected = input.split(',').map(n => parseInt(n.trim()) - 1).filter(n => n >= 0 && n < options.length);
      }
      const names = selected.map(i => typeof options[i] === 'object' ? options[i].label : options[i]);
      success(`Selected: ${names.join(', ')}`);
      resolve(selected.map(i => typeof options[i] === 'object' ? options[i].value : options[i]));
    });
  });
}

function confirm(question, defaultYes = true) {
  return new Promise(resolve => {
    const hint = defaultYes ? 'Y/n' : 'y/N';
    rl.question(`  ${C.white}${question} ${C.dim}(${hint}):${C.reset} `, answer => {
      const val = answer.trim().toLowerCase();
      const result = val === '' ? defaultYes : val === 'y' || val === 'yes';
      resolve(result);
    });
  });
}

// ─── Project Scanner (Auto-detect) ─────────────────────────────────────

function scanProject(cwd) {
  const scan = {
    name: path.basename(cwd),
    desc: '',
    type: 'other',
    lang: [],
    frameworks: [],
    hasDocker: false,
    hasCi: false,
    hasTests: false,
    hasDb: false,
    hasFrontend: false,
    hasBackend: false,
    hasMobile: false,
    packageManager: null,
    gitBranch: null,
    gitDefaultBranch: null,
    gitRemote: null,
  };

  // ─── File existence checks ───
  const exists = f => fs.existsSync(path.join(cwd, f));
  const readJson = f => { try { return JSON.parse(fs.readFileSync(path.join(cwd, f), 'utf-8')); } catch { return null; } };
  const readFile = f => { try { return fs.readFileSync(path.join(cwd, f), 'utf-8'); } catch { return ''; } };

  // ─── Package managers & languages ───
  if (exists('package.json')) {
    scan.packageManager = exists('pnpm-lock.yaml') ? 'pnpm' : exists('yarn.lock') ? 'yarn' : 'npm';
    scan.lang.push('javascript');
    const pkg = readJson('package.json');
    if (pkg) {
      scan.name = pkg.name || scan.name;
      scan.desc = pkg.description || '';
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Frameworks
      if (allDeps['next']) { scan.frameworks.push('Next.js'); scan.hasFrontend = true; scan.hasBackend = true; }
      if (allDeps['react'] && !allDeps['next']) { scan.frameworks.push('React'); scan.hasFrontend = true; }
      if (allDeps['vue']) { scan.frameworks.push('Vue'); scan.hasFrontend = true; }
      if (allDeps['@angular/core']) { scan.frameworks.push('Angular'); scan.hasFrontend = true; }
      if (allDeps['svelte'] || allDeps['@sveltejs/kit']) { scan.frameworks.push('Svelte'); scan.hasFrontend = true; }
      if (allDeps['express']) { scan.frameworks.push('Express'); scan.hasBackend = true; }
      if (allDeps['fastify']) { scan.frameworks.push('Fastify'); scan.hasBackend = true; }
      if (allDeps['nestjs'] || allDeps['@nestjs/core']) { scan.frameworks.push('NestJS'); scan.hasBackend = true; }
      if (allDeps['hono']) { scan.frameworks.push('Hono'); scan.hasBackend = true; }
      if (allDeps['react-native']) { scan.frameworks.push('React Native'); scan.hasMobile = true; }
      if (allDeps['expo']) { scan.frameworks.push('Expo'); scan.hasMobile = true; }
      if (allDeps['electron']) { scan.frameworks.push('Electron'); }

      // DB
      if (allDeps['prisma'] || allDeps['@prisma/client']) { scan.hasDb = true; scan.frameworks.push('Prisma'); }
      if (allDeps['typeorm']) { scan.hasDb = true; scan.frameworks.push('TypeORM'); }
      if (allDeps['drizzle-orm']) { scan.hasDb = true; scan.frameworks.push('Drizzle'); }
      if (allDeps['mongoose'] || allDeps['mongodb']) { scan.hasDb = true; scan.frameworks.push('MongoDB'); }
      if (allDeps['pg'] || allDeps['mysql2'] || allDeps['better-sqlite3']) scan.hasDb = true;
      if (allDeps['knex'] || allDeps['sequelize']) scan.hasDb = true;

      // Testing
      if (allDeps['jest'] || allDeps['vitest'] || allDeps['mocha'] || allDeps['playwright'] || allDeps['cypress']) scan.hasTests = true;

      // TypeScript
      if (allDeps['typescript'] || exists('tsconfig.json')) scan.lang.push('typescript');
    }
  }
  if (exists('requirements.txt') || exists('pyproject.toml') || exists('setup.py') || exists('Pipfile')) {
    scan.lang.push('python');
    scan.hasBackend = true;
    const pyProject = readFile('pyproject.toml');
    if (pyProject.includes('django')) scan.frameworks.push('Django');
    if (pyProject.includes('fastapi')) scan.frameworks.push('FastAPI');
    if (pyProject.includes('flask')) scan.frameworks.push('Flask');
    const reqs = readFile('requirements.txt');
    if (reqs.includes('django')) scan.frameworks.push('Django');
    if (reqs.includes('fastapi')) scan.frameworks.push('FastAPI');
    if (reqs.includes('flask')) scan.frameworks.push('Flask');
    if (reqs.includes('pytest') || exists('tests/') || exists('test/')) scan.hasTests = true;
    if (reqs.includes('sqlalchemy') || reqs.includes('alembic') || pyProject.includes('sqlalchemy')) scan.hasDb = true;
  }
  if (exists('go.mod')) { scan.lang.push('go'); scan.hasBackend = true; }
  if (exists('Cargo.toml')) { scan.lang.push('rust'); scan.hasBackend = true; }
  if (exists('pom.xml') || exists('build.gradle') || exists('build.gradle.kts')) {
    scan.lang.push('java');
    scan.hasBackend = true;
    if (exists('android/') || exists('app/src/main/AndroidManifest.xml')) scan.hasMobile = true;
  }
  if (exists('pubspec.yaml')) { scan.lang.push('dart'); scan.hasMobile = true; scan.frameworks.push('Flutter'); }
  if (exists('Gemfile')) { scan.lang.push('ruby'); scan.hasBackend = true; const gemfile = readFile('Gemfile'); if (gemfile.includes('rails')) scan.frameworks.push('Rails'); }
  if (exists('*.csproj') || exists('*.sln')) { scan.lang.push('csharp'); scan.hasBackend = true; scan.frameworks.push('.NET'); }

  // ─── Infrastructure ───
  scan.hasDocker = exists('Dockerfile') || exists('docker-compose.yml') || exists('docker-compose.yaml');
  scan.hasCi = exists('.github/workflows') || exists('.gitlab-ci.yml') || exists('Jenkinsfile') || exists('.circleci/config.yml') || exists('bitbucket-pipelines.yml');

  // ─── Git info ───
  const { execSync } = require('child_process');
  try {
    scan.gitBranch = execSync('git branch --show-current', { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch { /* not a git repo */ }
  try {
    scan.gitRemote = execSync('git remote get-url origin', { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch { /* no remote */ }
  try {
    // Detect default branch
    const refs = execSync('git symbolic-ref refs/remotes/origin/HEAD', { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    scan.gitDefaultBranch = refs.replace('refs/remotes/origin/', '');
  } catch {
    // Fallback: check if main or master exists
    try {
      execSync('git rev-parse --verify main', { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      scan.gitDefaultBranch = 'main';
    } catch {
      try {
        execSync('git rev-parse --verify master', { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
        scan.gitDefaultBranch = 'master';
      } catch {
        scan.gitDefaultBranch = 'main';
      }
    }
  }

  // ─── Detect project type ───
  if (scan.hasMobile) scan.type = 'mobile';
  else if (scan.hasFrontend && scan.hasBackend) scan.type = 'fullstack';
  else if (scan.hasFrontend && !scan.hasBackend) scan.type = 'web';
  else if (scan.hasBackend && !scan.hasFrontend) scan.type = 'api';
  else if (exists('bin/') || (readJson('package.json') || {}).bin) scan.type = 'cli';

  // ─── Detect monorepo ───
  if (exists('lerna.json') || exists('pnpm-workspace.yaml') || exists('nx.json') || exists('turbo.json')) {
    scan.type = 'monorepo';
  }
  const pkg = readJson('package.json');
  if (pkg && pkg.workspaces) scan.type = 'monorepo';

  // De-duplicate
  scan.lang = [...new Set(scan.lang)];
  scan.frameworks = [...new Set(scan.frameworks)];

  return scan;
}

function displayScanResults(scan) {
  console.log(`${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║              Project Scan Results                         ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════╝${C.reset}`);
  console.log('');
  console.log(`  ${C.bold}Name:${C.reset}         ${scan.name}`);
  if (scan.desc) console.log(`  ${C.bold}Description:${C.reset}  ${scan.desc}`);
  console.log(`  ${C.bold}Type:${C.reset}         ${C.green}${scan.type}${C.reset} (auto-detected)`);
  if (scan.lang.length) console.log(`  ${C.bold}Languages:${C.reset}    ${scan.lang.join(', ')}`);
  if (scan.frameworks.length) console.log(`  ${C.bold}Frameworks:${C.reset}   ${scan.frameworks.join(', ')}`);
  if (scan.packageManager) console.log(`  ${C.bold}Pkg Manager:${C.reset}  ${scan.packageManager}`);

  const flags = [];
  if (scan.hasFrontend) flags.push(`${C.green}Frontend${C.reset}`);
  if (scan.hasBackend) flags.push(`${C.green}Backend${C.reset}`);
  if (scan.hasMobile) flags.push(`${C.green}Mobile${C.reset}`);
  if (scan.hasDb) flags.push(`${C.green}Database${C.reset}`);
  if (scan.hasDocker) flags.push(`${C.green}Docker${C.reset}`);
  if (scan.hasCi) flags.push(`${C.green}CI/CD${C.reset}`);
  if (scan.hasTests) flags.push(`${C.green}Tests${C.reset}`);
  if (flags.length) console.log(`  ${C.bold}Detected:${C.reset}     ${flags.join(' | ')}`);

  if (scan.gitDefaultBranch) console.log(`  ${C.bold}Git Branch:${C.reset}   ${scan.gitDefaultBranch}`);
  if (scan.gitRemote) console.log(`  ${C.bold}Git Remote:${C.reset}   ${scan.gitRemote}`);
  console.log('');
}

// ─── Configuration Sections ────────────────────────────────────────────

async function stepProjectInfo(scan) {
  sectionHeader(1, 'Project Info', 'Confirm or customize detected settings');
  const name = await ask('Project name', scan ? scan.name : path.basename(process.cwd()));
  const desc = await ask('Short description', scan ? scan.desc : '');

  const typeOptions = [
    { label: 'Web Application', value: 'web', desc: 'React, Next.js, Vue, Angular' },
    { label: 'API / Backend', value: 'api', desc: 'Express, Django, FastAPI, Go' },
    { label: 'Full-Stack', value: 'fullstack', desc: 'Frontend + Backend + DB' },
    { label: 'Mobile App', value: 'mobile', desc: 'React Native, Flutter, iOS, Android' },
    { label: 'CLI Tool', value: 'cli', desc: 'Command-line application' },
    { label: 'Library / Package', value: 'library', desc: 'Reusable module for npm/pip/cargo' },
    { label: 'Monorepo', value: 'monorepo', desc: 'Multiple packages/apps' },
    { label: 'Other', value: 'other', desc: 'Custom configuration' },
  ];

  // Auto-select detected type
  const typeMap = { web: 0, api: 1, fullstack: 2, mobile: 3, cli: 4, library: 5, monorepo: 6, other: 7 };
  const defaultIdx = scan ? (typeMap[scan.type] || 7) : 2;
  if (scan && scan.type !== 'other') {
    info(`Auto-detected: ${C.green}${typeOptions[defaultIdx].label}${C.reset} ${C.dim}(${scan.frameworks.join(', ') || scan.lang.join(', ')})${C.reset}`);
  }
  const type = await select('Project type?', typeOptions, defaultIdx);

  return { name, desc, type, scan };
}

async function stepAgents(projectType, scan) {
  sectionHeader(2, 'Agent Team', 'Choose which AI agents to activate');

  // Core agents always included
  info(`Core agents (always included): @team-lead, @explorer, @reviewer, @security, @tester, @debugger, @code-quality, @gatekeeper`);
  console.log('');

  const agentOptions = [
    { label: '@api-builder', value: 'api-builder', desc: 'Backend endpoints, services, APIs' },
    { label: '@frontend', value: 'frontend', desc: 'UI components, pages, client logic' },
    { label: '@mobile', value: 'mobile', desc: 'iOS, Android, React Native, Flutter' },
    { label: '@infra', value: 'infra', desc: 'Docker, CI/CD, deployment, monitoring' },
    { label: '@database', value: 'database', desc: 'Schema design, migrations, queries' },
    { label: '@architect', value: 'architect', desc: 'System design, architecture review' },
    { label: '@product-owner', value: 'product-owner', desc: 'Acceptance criteria, business sign-off' },
    { label: '@qa-lead', value: 'qa-lead', desc: 'QA planning, QA sign-off' },
    { label: '@qa-automation', value: 'qa-automation', desc: 'E2E testing, visual verification' },
    { label: '@ideator', value: 'ideator', desc: 'Brainstorming, idea refinement' },
    { label: '@strategist', value: 'strategist', desc: 'Product strategy, specs, features' },
    { label: '@scaffolder', value: 'scaffolder', desc: 'Project generation, boilerplate' },
    { label: '@ux-designer', value: 'ux-designer', desc: 'User flows, wireframes, IA' },
    { label: '@docs-writer', value: 'docs-writer', desc: 'READMEs, API docs, changelogs' },
    { label: '@process-coach', value: 'process-coach', desc: 'SDLC methodology configuration' },
  ];

  // Smart pre-selection based on scan results + project type
  let preSelected;
  if (scan) {
    preSelected = [];
    if (scan.hasBackend) preSelected.push(0);     // @api-builder
    if (scan.hasFrontend) preSelected.push(1);     // @frontend
    if (scan.hasMobile) preSelected.push(2);       // @mobile
    if (scan.hasDocker || scan.hasCi) preSelected.push(3); // @infra
    if (scan.hasDb) preSelected.push(4);           // @database
    preSelected.push(5);                           // @architect (always useful)
    preSelected.push(6);                           // @product-owner
    preSelected.push(7);                           // @qa-lead
    if (scan.hasTests) preSelected.push(8);        // @qa-automation
    preSelected.push(13);                          // @docs-writer
    info(`${C.green}Smart-selected based on scan${C.reset} — detected: ${[
      scan.hasBackend && 'backend',
      scan.hasFrontend && 'frontend',
      scan.hasMobile && 'mobile',
      scan.hasDb && 'database',
      scan.hasDocker && 'docker',
      scan.hasCi && 'CI/CD',
      scan.hasTests && 'tests',
    ].filter(Boolean).join(', ')}`);
  } else {
    // Fallback to type-based presets
    const presets = {
      web: [1, 3, 5, 7, 12, 13],
      api: [0, 3, 4, 5, 7, 13],
      fullstack: [0, 1, 3, 4, 5, 6, 7, 8, 13],
      mobile: [0, 2, 3, 4, 5, 7, 8, 13],
      cli: [0, 3, 5, 13],
      library: [0, 5, 13],
      monorepo: [0, 1, 3, 4, 5, 6, 7, 8, 13],
      other: [0, 1, 3, 5, 13],
    };
    preSelected = presets[projectType] || presets.other;
    info(`Pre-selected for "${projectType}" project (customize below):`);
  }

  const selected = await multiSelect('Which agents do you want?', agentOptions, preSelected);

  const coreAgents = ['team-lead', 'explorer', 'reviewer', 'security', 'tester', 'debugger', 'code-quality', 'gatekeeper'];
  return [...coreAgents, ...selected];
}

async function stepSkills(/* projectType */) {
  sectionHeader(3, 'Skill Packs', 'Choose which command groups to install');

  const skillPacks = [
    { label: 'Core Workflow', value: 'core', desc: '/workflow, /task-tracker, /execution-report, /context-check, /standup' },
    { label: 'Pre-Development', value: 'predev', desc: '/brainstorm, /product-spec, /feature-map, /domain-model, /tech-stack, /architecture' },
    { label: 'MVP Pipeline', value: 'mvp', desc: '/new-project, /idea-to-launch, /mvp-kickoff, /mvp-status, /launch-mvp' },
    { label: 'Code Scaffolding', value: 'scaffold', desc: '/scaffold, /add-endpoint, /add-component, /add-page' },
    { label: 'Review & Quality', value: 'quality', desc: '/review-pr, /design-review, /security-audit, /qa-plan, /impact-analysis' },
    { label: 'Deployment', value: 'deploy', desc: '/deploy, /signoff, /rollback, /deploy-strategy' },
    { label: 'Bug Fixing', value: 'bugfix', desc: '/fix-bug, /hotfix, /migrate' },
    { label: 'Reporting', value: 'reporting', desc: '/progress-report, /metrics, /standup, /cost-estimate' },
    { label: 'Documentation', value: 'docs', desc: '/api-docs, /changelog, /release-notes, /onboard' },
    { label: 'Maintenance', value: 'maintenance', desc: '/sync, /dependency-check, /refactor, /parallel-dev' },
    { label: 'Configuration', value: 'config', desc: '/methodology, /clarify, /import-docs, /scan-codebase, /validate-setup' },
    { label: 'Mobile', value: 'mobile', desc: '/mobile-audit' },
  ];

  info('Select skill packs to install (or "all" for everything):');
  return await multiSelect('Which skill packs?', skillPacks, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
}

async function stepGitWorkflow(scan) {
  sectionHeader(4, 'Git & Branching', 'Configure your Git workflow');

  // Auto-detect default branch
  const branchOptions = [
    { label: 'main', value: 'main', desc: 'Single main branch (GitHub default)' },
    { label: 'dev / develop', value: 'dev', desc: 'Separate dev branch (GitFlow style)' },
    { label: 'master', value: 'master', desc: 'Legacy naming convention' },
  ];
  let branchDefault = 0;
  if (scan && scan.gitDefaultBranch) {
    if (scan.gitDefaultBranch === 'master') branchDefault = 2;
    else if (scan.gitDefaultBranch.startsWith('dev')) branchDefault = 1;
    info(`Detected default branch: ${C.green}${scan.gitDefaultBranch}${C.reset}`);
  }

  const baseBranch = await select('Base branch for feature branches?', branchOptions, branchDefault);

  const branchPrefix = await select('Branch naming convention?', [
    { label: 'type/TASK-{id}/{slug}', value: 'task', desc: 'feature/TASK-042/user-auth (recommended)' },
    { label: 'type/{slug}', value: 'slug', desc: 'feature/user-auth (simpler)' },
    { label: 'type/{initials}/{slug}', value: 'initials', desc: 'feature/mk/user-auth (team ID)' },
    { label: '{ticket-id}/{slug}', value: 'ticket', desc: 'JIRA-123/user-auth (ticket-based)' },
    { label: 'Custom', value: 'custom', desc: 'Define your own pattern' },
  ], 0);

  let customPattern = '';
  if (branchPrefix === 'custom') {
    customPattern = await ask('Enter branch pattern (use {type}, {id}, {slug})', '{type}/{id}/{slug}');
  }

  const mergeStrategy = await select('PR merge strategy?', [
    { label: 'Squash and merge', value: 'squash', desc: 'Clean single commit per PR (recommended)' },
    { label: 'Merge commit', value: 'merge', desc: 'Preserve full commit history' },
    { label: 'Rebase and merge', value: 'rebase', desc: 'Linear history, no merge commits' },
  ], 0);

  const dualReview = await confirm('Require dual code review (2 reviewers must approve)?', true);

  const protectedFiles = await confirm('Protect CI/CD and lock files from direct edits?', true);

  return { baseBranch, branchPrefix, customPattern, mergeStrategy, dualReview, protectedFiles };
}

async function stepMethodology() {
  sectionHeader(5, 'SDLC Methodology', 'Choose your development workflow style');

  const methodology = await select('Development methodology?', [
    { label: 'Scrum', value: 'scrum', desc: 'Sprints, standups, retrospectives' },
    { label: 'Kanban', value: 'kanban', desc: 'Continuous flow, WIP limits, pull-based' },
    { label: 'Waterfall', value: 'waterfall', desc: 'Sequential phases, formal gates' },
    { label: 'XP (Extreme Programming)', value: 'xp', desc: 'Pair programming, TDD, continuous integration' },
    { label: 'DevOps / CI-CD', value: 'devops', desc: 'Automated pipelines, fast deploys' },
    { label: 'Lean', value: 'lean', desc: 'Eliminate waste, value stream mapping' },
    { label: 'RAD (Rapid Application Dev)', value: 'rad', desc: 'Prototyping, iterative, fast feedback' },
    { label: 'Custom / Hybrid', value: 'custom', desc: 'Mix and match from multiple models' },
  ], 0);

  const codeReviewRequired = await confirm('Require code review before merge?', true);
  const qaRequired = await confirm('Require QA sign-off before deploy?', true);
  const bizSignoff = await confirm('Require business/product sign-off?', false);

  return { methodology, codeReviewRequired, qaRequired, bizSignoff };
}

async function stepRulesAndHooks() {
  sectionHeader(6, 'Rules & Automation', 'Configure safety rules and automation hooks');

  const rules = await multiSelect('Which rules to enforce?', [
    { label: 'Context Budget', value: 'context-budget', desc: 'Enforce 60% context limit, auto-compact' },
    { label: 'Request Validation', value: 'request-validation', desc: 'Validate requests before coding (WHAT/WHY/WHERE)' },
    { label: 'Domain Terms', value: 'domain-terms', desc: 'Consistent domain vocabulary in code' },
    { label: 'Task Lifecycle', value: 'task-lifecycle', desc: 'Subtask decomposition, phase gates, evidence' },
  ], [0, 1, 2, 3]);

  const hooks = await multiSelect('Which automation hooks to enable?', [
    { label: 'Session start (context recovery)', value: 'session-start', desc: 'Restore task state on session start/resume' },
    { label: 'Drift detector', value: 'drift-detector', desc: 'Detect env drift on startup' },
    { label: 'Bash validator', value: 'validate-bash', desc: 'Block dangerous commands (rm -rf /, fork bomb)' },
    { label: 'File protector', value: 'protect-files', desc: 'Block edits to .env, lock files, CI configs' },
    { label: 'Post-edit formatter', value: 'post-edit-format', desc: 'Auto-format after edits (Prettier, Black, gofmt)' },
    { label: 'Gatekeeper check', value: 'gatekeeper-check', desc: 'Auto-check for secrets, TODOs, console.logs' },
    { label: 'File change tracker', value: 'track-file-changes', desc: 'Log all file changes for task tracking' },
    { label: 'Tool failure tracker', value: 'tool-failure-tracker', desc: 'Track tool failures for debugging' },
    { label: 'Agent tracker', value: 'subagent-tracker', desc: 'Track agent completions for metrics' },
    { label: 'Execution report', value: 'execution-report', desc: 'Generate report on session end' },
    { label: 'Compact state save/restore', value: 'compact-hooks', desc: 'Save/restore state during compaction' },
    { label: 'Desktop notification', value: 'notify-approval', desc: 'OS notification when approval needed' },
    { label: 'Stop failure handler', value: 'stop-failure-handler', desc: 'Preserve state on session errors' },
  ], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  return { rules, hooks };
}

async function stepProfile() {
  sectionHeader(7, 'Developer Profile', 'Your primary role (customizes defaults)');

  const profile = await select('Your primary role?', [
    { label: 'Full-Stack Developer', value: 'fullstack', desc: 'Frontend + Backend + everything' },
    { label: 'Backend Developer', value: 'backend', desc: 'APIs, services, databases' },
    { label: 'Frontend Developer', value: 'frontend', desc: 'UI, components, client-side' },
    { label: 'Mobile Developer', value: 'mobile', desc: 'iOS, Android, cross-platform' },
    { label: 'DevOps / SRE', value: 'devops', desc: 'Infrastructure, CI/CD, monitoring' },
    { label: 'QA Engineer', value: 'qa-engineer', desc: 'Testing, automation, quality' },
    { label: 'Data Engineer', value: 'data-engineer', desc: 'Pipelines, ETL, analytics' },
  ], 0);

  return { profile };
}

// ─── Config Generator ──────────────────────────────────────────────────

function generateConfig(answers, scan) {
  const config = {
    version: '2.1.1',
    generated: new Date().toISOString(),
    project: { name: answers.project.name, description: answers.project.desc, type: answers.project.type },
    agents: answers.agents,
    skillPacks: answers.skills,
    git: answers.git,
    methodology: answers.methodology,
    rules: answers.rulesAndHooks.rules,
    hooks: answers.rulesAndHooks.hooks,
    profile: answers.profile.profile,
  };
  if (scan) {
    config.detectedStack = {
      languages: scan.lang,
      frameworks: scan.frameworks,
      packageManager: scan.packageManager,
      features: {
        frontend: scan.hasFrontend,
        backend: scan.hasBackend,
        mobile: scan.hasMobile,
        database: scan.hasDb,
        docker: scan.hasDocker,
        ci: scan.hasCi,
        tests: scan.hasTests,
      },
    };
  }
  return config;
}

function displaySummary(config) {
  console.log('');
  console.log(`${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║                  Configuration Summary                   ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════╝${C.reset}`);
  console.log('');
  console.log(`  ${C.bold}Project:${C.reset}      ${config.project.name} (${config.project.type})`);
  console.log(`  ${C.bold}Agents:${C.reset}       ${config.agents.length} agents enabled`);
  console.log(`  ${C.bold}Skill Packs:${C.reset}  ${config.skillPacks.length} packs (${getSkillCount(config.skillPacks)} skills)`);
  console.log(`  ${C.bold}Base Branch:${C.reset}  ${config.git.baseBranch}`);
  console.log(`  ${C.bold}Branch Style:${C.reset} ${config.git.branchPrefix === 'custom' ? config.git.customPattern : config.git.branchPrefix}`);
  console.log(`  ${C.bold}Merge:${C.reset}        ${config.git.mergeStrategy}`);
  console.log(`  ${C.bold}Dual Review:${C.reset}  ${config.git.dualReview ? 'Yes (2 approvals required)' : 'No (single reviewer)'}`);
  console.log(`  ${C.bold}Methodology:${C.reset}  ${config.methodology.methodology}`);
  console.log(`  ${C.bold}Sign-offs:${C.reset}    Code Review: ${config.methodology.codeReviewRequired ? '✓' : '✗'} | QA: ${config.methodology.qaRequired ? '✓' : '✗'} | Business: ${config.methodology.bizSignoff ? '✓' : '✗'}`);
  console.log(`  ${C.bold}Rules:${C.reset}        ${config.rules.length} active`);
  console.log(`  ${C.bold}Hooks:${C.reset}        ${config.hooks.length} active`);
  console.log(`  ${C.bold}Profile:${C.reset}      ${config.profile}`);
  console.log('');
}

function getSkillCount(packs) {
  const counts = {
    core: 5, predev: 6, mvp: 5, scaffold: 4, quality: 5,
    deploy: 4, bugfix: 3, reporting: 4, docs: 4, maintenance: 4,
    config: 5, mobile: 1, setup: 1
  };
  return packs.reduce((sum, p) => sum + (counts[p] || 0), 0);
}

// ─── File Generation ───────────────────────────────────────────────────

function saveConfig(config, targetDir) {
  const configDir = path.join(targetDir, '.claude');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  // Save the full config
  const configPath = path.join(configDir, 'setup-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Generate customized settings.json based on selections
  const settings = generateSettings(config);
  const settingsPath = path.join(configDir, 'setup-settings-preview.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return { configPath, settingsPath };
}

function generateSettings(config) {
  const settings = {
    permissions: {
      defaultMode: 'default',
      allow: [
        'git log', 'git diff', 'git status', 'git branch',
        'git checkout -b', 'git add', 'git commit',
        'npm init', 'npm install', 'npm run', 'npm test',
        'mkdir -p',
      ],
      deny: [
        'rm -rf /', 'sudo', 'git push --force', 'git reset --hard'
      ]
    },
    hooks: {},
  };

  // Map hook selections to actual hook config
  const hookMap = {
    'session-start': { event: 'SessionStart', matcher: 'startup|resume|compact', file: 'session-start.js' },
    'drift-detector': { event: 'SessionStart', matcher: 'startup', file: 'drift-detector.js' },
    'validate-bash': { event: 'PreToolUse', matcher: 'Bash', file: 'validate-bash.js' },
    'protect-files': { event: 'PreToolUse', matcher: 'Edit|Write', file: 'protect-files.js' },
    'post-edit-format': { event: 'PostToolUse', matcher: 'Edit|Write', file: 'post-edit-format.js' },
    'gatekeeper-check': { event: 'PostToolUse', matcher: 'Edit|Write', file: 'gatekeeper-check.js' },
    'track-file-changes': { event: 'PostToolUse', matcher: 'Edit|Write', file: 'track-file-changes.js' },
    'tool-failure-tracker': { event: 'PostToolUseFailure', matcher: '', file: 'tool-failure-tracker.js' },
    'subagent-tracker': { event: 'SubagentStop', matcher: '', file: 'subagent-tracker.js' },
    'execution-report': { event: 'Stop', matcher: '', file: 'execution-report.js' },
    'compact-hooks': { event: 'PreCompact', matcher: '', file: 'pre-compact-save.js' },
    'notify-approval': { event: 'Notification', matcher: 'permission_prompt', file: 'notify-approval.js' },
    'stop-failure-handler': { event: 'StopFailure', matcher: 'rate_limit|authentication_failed|billing_error', file: 'stop-failure-handler.js' },
  };

  for (const hookName of config.hooks) {
    const hookDef = hookMap[hookName];
    if (!hookDef) continue;
    if (!settings.hooks[hookDef.event]) settings.hooks[hookDef.event] = [];
    const entry = {
      type: 'command',
      command: `node .claude/hooks/${hookDef.file}`,
    };
    if (hookDef.matcher) entry.matcher = hookDef.matcher;
    settings.hooks[hookDef.event].push(entry);
  }

  // Add compact restore hook if compact save is enabled
  if (config.hooks.includes('compact-hooks')) {
    if (!settings.hooks.PostCompact) settings.hooks.PostCompact = [];
    settings.hooks.PostCompact.push({
      type: 'command',
      command: 'node .claude/hooks/post-compact-recovery.js',
    });
  }

  return settings;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function runWizard() {
  banner();

  const answers = {};
  let scan = null;

  // Step 0: Scan existing project
  const cwd = process.cwd();
  const hasProjectFiles = fs.existsSync(path.join(cwd, 'package.json'))
    || fs.existsSync(path.join(cwd, 'go.mod'))
    || fs.existsSync(path.join(cwd, 'Cargo.toml'))
    || fs.existsSync(path.join(cwd, 'requirements.txt'))
    || fs.existsSync(path.join(cwd, 'pyproject.toml'))
    || fs.existsSync(path.join(cwd, 'pubspec.yaml'))
    || fs.existsSync(path.join(cwd, 'Gemfile'))
    || fs.existsSync(path.join(cwd, 'pom.xml'));

  if (hasProjectFiles) {
    sectionHeader(0, 'Project Scan', 'Scanning your codebase to suggest optimal settings...');
    console.log(`  ${C.cyan}⟳${C.reset} Scanning ${cwd}...\n`);
    scan = scanProject(cwd);
    displayScanResults(scan);

    const useScan = await confirm('Use these detected settings as defaults?', true);
    if (!useScan) {
      scan = null;
      info('Starting fresh — you can configure everything manually.');
    } else {
      success('Scan results will pre-fill your configuration. You can customize each step.');
    }
  } else {
    info('No existing project detected — starting with a blank configuration.');
    info('After setup, run /scan-codebase inside Claude to deep-scan your code.\n');
  }

  // Step 1: Project Info
  answers.project = await stepProjectInfo(scan);

  // Step 2: Agent Selection (with scan-based smart selection)
  answers.agents = await stepAgents(answers.project.type, scan);

  // Step 3: Skill Packs
  answers.skills = await stepSkills(answers.project.type);

  // Step 4: Git Workflow (with detected branch)
  answers.git = await stepGitWorkflow(scan);

  // Step 5: Methodology
  answers.methodology = await stepMethodology();

  // Step 6: Rules & Hooks
  answers.rulesAndHooks = await stepRulesAndHooks();

  // Step 7: Developer Profile
  answers.profile = await stepProfile();

  // Generate config
  const config = generateConfig(answers, scan);

  // Show summary
  displaySummary(config);

  // Confirm
  const proceed = await confirm('Apply this configuration and install Claude Code environment?', true);

  if (proceed) {
    const targetDir = process.cwd();
    saveConfig(config, targetDir);
    console.log('');
    success(`Configuration saved to: ${C.cyan}.claude/setup-config.json${C.reset}`);
    success(`Settings preview: ${C.cyan}.claude/setup-settings-preview.json${C.reset}`);
    console.log('');
    info('Now running installation with your configuration...');
    console.log('');

    // Return config so cli.js can use it
    rl.close();
    return config;
  } else {
    console.log('');
    info('Setup cancelled. Run again anytime with: npx claude-code-scanner setup');
    rl.close();
    return null;
  }
}

// Export for use by cli.js
module.exports = { runWizard };

// Run directly if called standalone
if (require.main === module) {
  runWizard().then(config => {
    if (config) {
      console.log(`${C.green}${C.bold}Configuration complete!${C.reset}`);
      console.log(`\nNext: run ${C.cyan}npx claude-code-scanner init${C.reset} to apply.`);
    }
    process.exit(0);
  }).catch(err => {
    console.error(`${C.red}Error:${C.reset} ${err.message}`);
    process.exit(1);
  });
}
