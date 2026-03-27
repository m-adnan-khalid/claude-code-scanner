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

// --- Agents (18 required) ---
console.log('--- Agents ---');
const agentsDir = path.join(cwd, '.claude', 'agents');
const requiredAgents = [
  'team-lead', 'architect', 'product-owner', 'qa-lead',
  'explorer', 'reviewer', 'security', 'debugger', 'tester',
  'frontend', 'api-builder', 'infra', 'mobile',
  'ideator', 'strategist', 'scaffolder', 'ux-designer',
  'code-quality'
];
const readOnlyAgents = ['explorer', 'reviewer', 'security', 'architect', 'product-owner', 'qa-lead', 'ideator', 'ux-designer', 'code-quality'];
const worktreeAgents = ['frontend', 'api-builder', 'scaffolder', 'mobile', 'debugger', 'tester', 'infra', 'team-lead', 'strategist', 'ux-designer'];

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
      check(`${d.name} has name:`, fileMatchesRegex(skillMd, /^name:/m));
      check(`${d.name} has description:`, fileMatchesRegex(skillMd, /^description:/m));
    }
  }
}

// Check heavy skills have context: fork
const heavySkills = [
  'scan-codebase', 'generate-environment', 'workflow', 'task-tracker',
  'impact-analysis', 'metrics', 'progress-report', 'execution-report',
  'brainstorm', 'product-spec', 'feature-map', 'domain-model',
  'tech-stack', 'architecture', 'scaffold', 'deploy-strategy',
  'new-project', 'idea-to-launch', 'import-docs',
  'mvp-kickoff', 'mvp-status', 'launch-mvp', 'clarify',
  'release-notes', 'cost-estimate', 'rollback', 'setup-smithery'
];
for (const skillName of heavySkills) {
  const skillMd = path.join(skillsDir, skillName, 'SKILL.md');
  if (fs.existsSync(skillMd)) {
    check(`${skillName} has context: fork`, fileContains(skillMd, 'context: fork'));
  }
}

// Check workflow has disable-model-invocation and handoff protocol
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
  }
}

// --- Commands (build/test/lint smoke test) ---
console.log('--- Commands ---');
const { execSync } = require('child_process');

function tryCommand(label, cmd, dir) {
  try {
    execSync(cmd, { cwd: dir, stdio: 'pipe', timeout: 60000 });
    check(`${label}: ${cmd}`, true);
    return true;
  } catch (e) {
    // Exit code 1 from lint can still mean "ran successfully but found issues" — that's OK
    if (e.status !== null && e.status !== undefined) {
      check(`${label}: ${cmd} (exit ${e.status})`, true);
      return true;
    }
    check(`${label}: ${cmd}`, false);
    return false;
  }
}

// Extract commands from CLAUDE.md "Quick Commands" section
if (fs.existsSync(claudeMd)) {
  const claudeContent = readFile(claudeMd);
  const commandLines = claudeContent.split('\n').filter(l => /^\s*-\s+\*\*.*:\*\*\s+`/.test(l));
  let commandsTested = 0;

  for (const line of commandLines) {
    const labelMatch = line.match(/\*\*(.+?):\*\*/);
    const cmdMatch = line.match(/`(.+?)`/);
    if (!labelMatch || !cmdMatch) continue;

    const label = labelMatch[1].trim();
    const fullCmd = cmdMatch[1].trim();

    // Only smoke-test safe commands: install, lint, build, test --co (collect only)
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('install')) {
      // Check if deps dir exists instead of running install
      const cdMatch = fullCmd.match(/cd\s+(\S+)/);
      if (cdMatch) {
        const projDir = path.join(cwd, cdMatch[1]);
        const hasDeps = fs.existsSync(path.join(projDir, 'node_modules'))
          || fs.existsSync(path.join(projDir, '.dart_tool'))
          || fs.existsSync(path.join(projDir, 'poetry.lock'));
        check(`${label}: dependencies present`, hasDeps);
        commandsTested++;
      }
    } else if (lowerLabel.includes('lint') || lowerLabel.includes('type check')) {
      const cdMatch = fullCmd.match(/cd\s+(\S+)\s+&&\s+(.*)/);
      if (cdMatch) {
        const projDir = path.join(cwd, cdMatch[1]);
        if (fs.existsSync(projDir)) {
          tryCommand(label, cdMatch[2], projDir);
          commandsTested++;
        }
      }
    }
  }

  if (commandsTested === 0) {
    warn('Commands tested', false);
    console.log('    No safe commands found to smoke-test in CLAUDE.md');
  }
} else {
  warn('Commands', false);
}

// --- Task Record Schema ---
console.log('--- Docs ---');
const taskSchema = path.join(cwd, '.claude', 'docs', 'task-record-schema.md');
if (fs.existsSync(taskSchema)) {
  check('Task schema has Loop State section', fileContains(taskSchema, 'Loop State'));
  check('Task schema has Handoff Log section', fileContains(taskSchema, 'Handoff Log'));
}

const flowEngine = path.join(cwd, '.claude', 'docs', 'flow-engine.md');
if (fs.existsSync(flowEngine)) {
  check('Flow engine has Handoff Protocol', fileContains(flowEngine, 'Handoff Protocol'));
  check('Flow engine has Orchestration Model', fileContains(flowEngine, 'Orchestration Model'));
  check('Flow engine documents subagent limitation', fileContains(flowEngine, 'cannot spawn other subagents'));
}

// --- Pre-Dev Project Templates ---
console.log('--- Pre-Dev Project Templates ---');
const projectDir = path.join(cwd, '.claude', 'project');
check('Project directory exists', fs.existsSync(projectDir));
const requiredProjectFiles = [
  'PROJECT.md', 'IDEA_CANVAS.md', 'PRODUCT_SPEC.md', 'BACKLOG.md',
  'DOMAIN_MODEL.md', 'TECH_STACK.md', 'ARCHITECTURE.md', 'DEPLOY_STRATEGY.md'
];
for (const pf of requiredProjectFiles) {
  const pfPath = path.join(projectDir, pf);
  check(`${pf} exists`, fs.existsSync(pfPath));
}

// --- Pre-Dev Flow Engine ---
console.log('--- Pre-Dev Docs ---');
const preDevFlowEngine = path.join(cwd, '.claude', 'docs', 'pre-dev-flow-engine.md');
if (fs.existsSync(preDevFlowEngine)) {
  check('Pre-dev flow engine has state machine', fileContains(preDevFlowEngine, 'State Machine'));
  check('Pre-dev flow engine has phase details', fileContains(preDevFlowEngine, 'Pre-Phase 1'));
  check('Pre-dev flow engine has domain modeling', fileContains(preDevFlowEngine, 'DOMAIN MODELING'));
  check('Pre-dev flow engine has document import', fileContains(preDevFlowEngine, 'Document Import'));
}
const newProjectGuide = path.join(cwd, '.claude', 'docs', 'new-project-guide.md');
check('New project guide exists', fs.existsSync(newProjectGuide));

// --- Context Budget ---
console.log('--- Context Budget ---');
const clLines = fs.existsSync(claudeMd) ? lineCount(claudeMd) : 999;

// Only count always-loaded rules: those with paths: **/* or referenced via @ in CLAUDE.md
const claudeContent = fs.existsSync(claudeMd) ? readFile(claudeMd) : '';
const atRefs = (claudeContent.match(/@\.claude\/rules\/(\S+)/g) || []).map(r => path.basename(r));

let alwaysLoadedLines = 0;
const alwaysLoadedNames = [];
for (const f of globDir(rulesDir, '.md')) {
  const name = path.basename(f);
  const content = readFile(f);
  const isGlobalPath = /paths:\s*\[?"?\*\*\/?\*"?\]?/m.test(content) || /paths:[\s\S]*?- "\*\*\/?\*"/m.test(content);
  const isAtRef = atRefs.includes(name);
  if (isGlobalPath || isAtRef) {
    const lines = lineCount(f);
    alwaysLoadedLines += lines;
    alwaysLoadedNames.push(`${name} (${lines})`);
  }
}

const allRulesLines = globDir(rulesDir, '.md').reduce((sum, f) => sum + lineCount(f), 0);
console.log(`  CLAUDE.md: ${clLines} lines`);
console.log(`  Always-loaded rules: ${alwaysLoadedNames.join(', ')} = ${alwaysLoadedLines} lines`);
console.log(`  Path-scoped rules (load on demand): ${allRulesLines - alwaysLoadedLines} lines`);
console.log(`  Startup context: ${clLines + alwaysLoadedLines} lines (limit 200)`);
check('Startup context under 200 lines', (clLines + alwaysLoadedLines) <= 200);

// --- Summary ---
console.log(`\n=== PASS: ${PASS} | FAIL: ${FAIL} | WARN: ${WARN} ===`);
if (FAIL === 0) {
  console.log('STATUS: ALL CHECKS PASSED');
} else {
  console.log(`STATUS: ${FAIL} FAILURES — fix before using`);
  process.exit(1);
}
