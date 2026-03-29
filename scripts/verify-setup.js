#!/usr/bin/env node
// Cross-platform verification of Claude Code environment — replaces verify-setup.sh
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let PASS = 0, FAIL = 0, WARN = 0;

function check(label, condition) {
  if (condition) { console.log(`  ${GREEN}[PASS]${RESET} ${label}`); PASS++; }
  else { console.log(`  ${RED}[FAIL]${RESET} ${label}`); FAIL++; }
}

function warn(label, condition) {
  if (condition) { console.log(`  ${GREEN}[OK]  ${RESET} ${label}`); }
  else { console.log(`  ${YELLOW}[WARN]${RESET} ${label}`); WARN++; }
}

function lineCount(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8').split('\n').length; } catch { return 999; }
}

function fileContains(filePath, text) {
  try { return fs.readFileSync(filePath, 'utf-8').includes(text); } catch { return false; }
}

function fileMatchesRegex(filePath, regex) {
  try { return regex.test(fs.readFileSync(filePath, 'utf-8')); } catch { return false; }
}

function isValidJSON(filePath) {
  try { JSON.parse(fs.readFileSync(filePath, 'utf-8')); return true; } catch { return false; }
}

function globDir(dir, ext) {
  try { return fs.readdirSync(dir).filter(f => f.endsWith(ext)).map(f => path.join(dir, f)); } catch { return []; }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return ''; }
}

const cwd = process.cwd();

console.log('=== Claude Code Environment Verification ===\n');

// --- CLAUDE.md ---
console.log('--- CLAUDE.md ---');
const claudeMd = path.join(cwd, 'CLAUDE.md');
check('Exists', fs.existsSync(claudeMd));
check('Under 200 lines (recommended)', fs.existsSync(claudeMd) && lineCount(claudeMd) <= 200);
warn('Under 150 lines (optimal)', fs.existsSync(claudeMd) && lineCount(claudeMd) <= 150);
warn('No placeholders', fs.existsSync(claudeMd) && !fileMatchesRegex(claudeMd, /\{[^}]+\}/));

// --- Rules ---
console.log('--- Rules ---');
const rulesDir = path.join(cwd, '.claude', 'rules');
check('Directory exists', fs.existsSync(rulesDir));
for (const f of globDir(rulesDir, '.md')) {
  const name = path.basename(f);
  check(`${name} under 50 lines`, lineCount(f) <= 50);
  check(`${name} has paths:`, fileContains(f, 'paths:'));
}

// --- Agents (23 required) ---
console.log('--- Agents ---');
const agentsDir = path.join(cwd, '.claude', 'agents');
const requiredAgents = [
  'team-lead', 'architect', 'product-owner', 'qa-lead',
  'explorer', 'reviewer', 'security', 'debugger', 'tester',
  'frontend', 'api-builder', 'infra', 'mobile',
  'ideator', 'strategist', 'scaffolder', 'ux-designer',
  'code-quality', 'database', 'docs-writer', 'gatekeeper',
  'process-coach', 'qa-automation'
];
const sdlcRoleAgents = ['team-lead', 'architect', 'product-owner', 'qa-lead'];
const readOnlyAgents = ['explorer', 'reviewer', 'security', 'architect', 'product-owner', 'qa-lead', 'ideator', 'ux-designer', 'code-quality', 'gatekeeper'];
const worktreeAgents = ['frontend', 'api-builder', 'scaffolder', 'mobile'];

for (const agentName of requiredAgents) {
  const agentFile = path.join(agentsDir, `${agentName}.md`);
  check(`${agentName}.md exists`, fs.existsSync(agentFile));
}

for (const f of globDir(agentsDir, '.md')) {
  const name = path.basename(f, '.md');
  const content = readFile(f);
  check(`${name} has name:`, fileMatchesRegex(f, /^name:/m));
  check(`${name} has description:`, fileMatchesRegex(f, /^description:/m));
  check(`${name} has memory: project`, content.includes('memory: project'));
  check(`${name} has HANDOFF block`, content.includes('HANDOFF'));
  check(`${name} has Limitations section`, content.includes('Limitations') || content.includes('limitations'));

  if (readOnlyAgents.includes(name)) {
    check(`${name} has permissionMode: plan`, content.includes('permissionMode: plan'));
    check(`${name} has disallowedTools`, content.includes('disallowedTools:'));
  }

  if (worktreeAgents.includes(name)) {
    warn(`${name} has isolation: worktree`, content.includes('isolation: worktree'));
  }
}

// --- Skills ---
console.log('--- Skills ---');
const skillsDir = path.join(cwd, '.claude', 'skills');
if (fs.existsSync(skillsDir)) {
  for (const d of fs.readdirSync(skillsDir, { withFileTypes: true }).filter(e => e.isDirectory())) {
    const skillMd = path.join(skillsDir, d.name, 'SKILL.md');
    check(`${d.name} has SKILL.md`, fs.existsSync(skillMd));
    if (fs.existsSync(skillMd)) {
      const content = readFile(skillMd);
      check(`${d.name} has name:`, fileMatchesRegex(skillMd, /^name:/m));
      check(`${d.name} has description:`, fileMatchesRegex(skillMd, /^description:/m));
    }
  }
}

// Check heavy skills have context: fork
const heavySkills = ['scan-codebase', 'generate-environment', 'workflow', 'task-tracker', 'impact-analysis', 'metrics', 'progress-report', 'execution-report'];
for (const skillName of heavySkills) {
  const skillMd = path.join(skillsDir, skillName, 'SKILL.md');
  if (fs.existsSync(skillMd)) {
    check(`${skillName} has context: fork`, fileContains(skillMd, 'context: fork'));
  }
}

// Check workflow has disable-model-invocation
const workflowSkill = path.join(skillsDir, 'workflow', 'SKILL.md');
if (fs.existsSync(workflowSkill)) {
  check('workflow has disable-model-invocation', fileContains(workflowSkill, 'disable-model-invocation: true'));
  check('workflow has handoff protocol', fileContains(workflowSkill, 'HANDOFF'));
}

// --- Settings ---
console.log('--- Settings ---');
const settingsPath = path.join(cwd, '.claude', 'settings.json');
check('settings.json valid JSON', fs.existsSync(settingsPath) && isValidJSON(settingsPath));

if (fs.existsSync(settingsPath) && isValidJSON(settingsPath)) {
  const settings = JSON.parse(readFile(settingsPath));
  check('has permissions.defaultMode', settings.permissions && settings.permissions.defaultMode);
  check('has permissions.allow', settings.permissions && Array.isArray(settings.permissions.allow));
  check('has permissions.deny', settings.permissions && Array.isArray(settings.permissions.deny));
  check('has env section', settings.hasOwnProperty('env'));
  check('has hooks section', settings.hasOwnProperty('hooks'));

  // Check all hook scripts referenced in settings actually exist
  if (settings.hooks) {
    const hooksDir = path.join(cwd, '.claude', 'hooks');
    for (const [event, matchers] of Object.entries(settings.hooks)) {
      for (const matcher of matchers) {
        for (const hook of (matcher.hooks || [])) {
          if (hook.type === 'command' && hook.command) {
            const match = hook.command.match(/node\s+(.+\.js)/);
            if (match) {
              const hookFile = path.join(cwd, match[1]);
              check(`${event} hook ${path.basename(match[1])} exists`, fs.existsSync(hookFile));
            }
          }
        }
      }
    }
  }
}

const gitignorePath = path.join(cwd, '.gitignore');
warn('settings.local.json in .gitignore', fs.existsSync(gitignorePath) && fileContains(gitignorePath, 'settings.local.json'));

// --- Hooks ---
console.log('--- Hooks ---');
const hooksDir = path.join(cwd, '.claude', 'hooks');
if (fs.existsSync(hooksDir)) {
  for (const f of fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'))) {
    const hookPath = path.join(hooksDir, f);
    check(`${f} exists`, fs.existsSync(hookPath));
    // Verify it's valid JS by checking for syntax errors
    try {
      require(hookPath);
      check(`${f} valid JS`, true);
    } catch (e) {
      // Hook may use stdin/process — just check it doesn't have syntax errors
      if (e instanceof SyntaxError) {
        check(`${f} valid JS`, false);
      } else {
        check(`${f} valid JS`, true);
      }
    }
  }
}

// --- Task Record Schema ---
console.log('--- Task Record Schema ---');
const taskSchema = path.join(cwd, '.claude', 'docs', 'task-record-schema.md');
if (fs.existsSync(taskSchema)) {
  check('Has Loop State section', fileContains(taskSchema, 'Loop State'));
  check('Has Handoff Log section', fileContains(taskSchema, 'Handoff Log'));
}

// --- Flow Engine ---
console.log('--- Flow Engine ---');
const flowEngine = path.join(cwd, '.claude', 'docs', 'flow-engine.md');
if (fs.existsSync(flowEngine)) {
  check('Has Handoff Protocol', fileContains(flowEngine, 'Handoff Protocol'));
  check('Has Orchestration Model', fileContains(flowEngine, 'Orchestration Model'));
  check('Documents subagent limitation', fileContains(flowEngine, 'cannot spawn other subagents'));
}

// --- Context Budget ---
console.log('--- Context Budget ---');
const clLines = fs.existsSync(claudeMd) ? lineCount(claudeMd) : 999;
let rlLines = 0;
for (const f of globDir(rulesDir, '.md')) {
  rlLines += lineCount(f);
}
console.log(`  CLAUDE.md: ${clLines} lines | Rules: ${rlLines} lines | Total: ${clLines + rlLines}`);
check('Combined under 200 lines', (clLines + rlLines) <= 200);

// --- Summary ---
const total = PASS + FAIL + WARN;
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTS: ${PASS}/${total} passed | ${FAIL} failed | ${WARN} warnings`);
console.log(`${'='.repeat(50)}`);
if (FAIL === 0 && WARN === 0) {
  console.log(`${GREEN}STATUS: ALL CHECKS PASSED ✓${RESET}`);
  console.log('Your Claude Code environment is ready to use.');
} else if (FAIL === 0) {
  console.log(`${YELLOW}STATUS: PASSED WITH ${WARN} WARNINGS${RESET}`);
  console.log('Environment is usable but has minor issues. Run /sync --fix to resolve.');
} else {
  console.log(`${RED}STATUS: ${FAIL} FAILURES — fix before using${RESET}`);
  console.log('Run: npx claude-code-scanner init --force');
  process.exit(1);
}
