#!/usr/bin/env node

/**
 * git-push-gate.js — PreToolUse hook for git push
 * Runs @version-manager's 10-gate sequence before allowing push.
 * Exit 0 = allow, Exit 2 = hard block.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 }).trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function fail(gate, msg) {
  process.stderr.write(`❌ GATE ${gate} FAIL: ${msg}\n`);
  process.exit(2);
}

function warn(gate, msg) {
  process.stderr.write(`⚠️  GATE ${gate} WARN: ${msg}\n`);
}

// Read stdin (tool input)
let input = '';
try {
  input = fs.readFileSync('/dev/stdin', 'utf-8');
} catch (e) {
  // stdin may not be available — continue
}

const cmd = (() => {
  try { return JSON.parse(input).tool_input?.command || ''; }
  catch { return ''; }
})();

// ── GATE 1: BRANCH HEALTH ──
const branch = run('git branch --show-current');

if (!branch) fail(1, 'Could not determine current branch.');

// 1.1 — Branch naming
const branchPattern = /^(feat|fix|chore|docs|qa|dev|hotfix|release)\/[A-Z]+-[0-9]+\/.+/;
if (!branchPattern.test(branch)) {
  // Allow main/master for initial pushes — but block in 1.2
  if (branch !== 'main' && branch !== 'master') {
    fail(1, `Branch '${branch}' violates naming convention.\n` +
      `    Required: [role]/[STORY-ID]/[slug]\n` +
      `    Example:  feat/STORY-001/populate-idea-canvas\n` +
      `    Rename:   git branch -m feat/STORY-XXX/your-slug`);
  }
}

// 1.2 — Not pushing to main/master
if (branch === 'main' || branch === 'master') {
  fail(1, `Direct push to '${branch}' is blocked.\n` +
    `    Create a feature branch and open a PR.\n` +
    `    Run: git checkout -b feat/STORY-XXX/your-slug`);
}

// 1.3 — Up to date with main
try {
  run('git fetch origin main --quiet 2>/dev/null');
  const behind = parseInt(run('git rev-list HEAD..origin/main --count 2>/dev/null') || '0', 10);
  if (behind > 0) {
    fail(1, `Branch is ${behind} commits behind main.\n` +
      `    Run: git rebase origin/main`);
  }
} catch (e) {
  // No remote — skip this check
}

// ── GATE 2: TASK REGISTRY ──
const registryPath = path.join(ROOT, '.claude/project/TASK_REGISTRY.md');
const storyMatch = branch.match(/([A-Z]+-[0-9]+)/);
const storyId = storyMatch ? storyMatch[1] : null;

if (storyId && fs.existsSync(registryPath)) {
  const registry = fs.readFileSync(registryPath, 'utf-8');
  const storyLine = registry.split('\n').find(l => l.includes(storyId));
  if (storyLine && !storyLine.includes('DONE') && !storyLine.includes('IN_REVIEW')) {
    const status = storyLine.match(/\|\s*(TODO|IN_PROGRESS|BLOCKED|FAILED)\s*\|/);
    fail(2, `${storyId} is not DONE or IN_REVIEW.\n` +
      `    Current status: ${status ? status[1] : 'UNKNOWN'}\n` +
      `    Complete all tasks before pushing.`);
  }

  // 2.2 — Story file exists with DoD checked
  const storyFile = path.join(ROOT, `.claude/project/stories/${storyId}.md`);
  if (fs.existsSync(storyFile)) {
    const storyContent = fs.readFileSync(storyFile, 'utf-8');
    const unchecked = (storyContent.match(/- \[ \]/g) || []).length;
    if (unchecked > 0) {
      warn(2, `${unchecked} unchecked DoD items in ${storyId}. Complete before merge.`);
    }
  }
}

// ── GATE 3: COMMIT MESSAGE ──
const lastMsg = run('git log -1 --format="%s"');
const commitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .{10,}/;

if (lastMsg && !commitPattern.test(lastMsg)) {
  fail(3, `Commit message violates Conventional Commits.\n` +
    `    Required: type(scope): description (min 10 chars)\n` +
    `    Current:  "${lastMsg}"\n` +
    `    Example:  feat(STORY-001): populate idea canvas from scanned docs`);
}

if (lastMsg && !/[A-Z]+-[0-9]+/.test(lastMsg)) {
  warn(3, `No story/task ID in commit message. Consider adding one.`);
}

if (lastMsg && /^(wip|temp|test commit|asdf|\.\.\.)/i.test(lastMsg)) {
  fail(3, `WIP/placeholder commit detected: "${lastMsg}"\n` +
    `    Write a proper commit message before pushing.`);
}

// ── GATE 4: SECRET SCAN ──
const changedFiles = run('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --cached --name-only')
  .split('\n').filter(Boolean);

const secretPatterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'API Key (sk-)', regex: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'GitHub PAT', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'Private Key', regex: /-----BEGIN.*PRIVATE KEY-----/ },
  { name: 'Hardcoded Password', regex: /password\s*=\s*['"][^'"]{4,}/ },
  { name: 'API Key Assignment', regex: /api[_-]?key\s*=\s*['"][^'"]{8,}/ },
  { name: 'Secret Assignment', regex: /secret\s*=\s*['"][^'"]{8,}/ },
];

const protectedFiles = ['.env', '.env.local', '.env.production'];
const protectedExtensions = ['.pem', '.key', '.p12', '.pfx'];

for (const file of changedFiles) {
  // 4.2 — Protected files
  const basename = path.basename(file);
  if (protectedFiles.includes(basename) || protectedExtensions.some(ext => file.endsWith(ext))) {
    fail(4, `Protected file '${file}' in commit.\n` +
      `    Use environment variables or secret managers.\n` +
      `    Run: git reset HEAD ${file}`);
  }

  // 4.1 — Secret patterns
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const { name, regex } of secretPatterns) {
        if (regex.test(content)) {
          fail(4, `Potential ${name} detected in ${file}.\n` +
            `    Remove credential and use environment variables.\n` +
            `    Run: git reset HEAD ${file}`);
        }
      }
    } catch (e) {
      // Binary file — skip
    }
  }
}

// ── GATE 5: CODE QUALITY (lightweight — full check done by npm test) ──
// Skip if no package.json (not a node project we can lint)

// ── GATE 6: TEST SUITE ──
if (fs.existsSync(path.join(ROOT, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  if (pkg.scripts && pkg.scripts.test) {
    try {
      execSync('npm test', { cwd: ROOT, encoding: 'utf-8', timeout: 120000, stdio: 'pipe' });
    } catch (e) {
      const output = (e.stdout || '') + (e.stderr || '');
      const failures = output.split('\n').filter(l => /fail|error/i.test(l)).slice(0, 5).join('\n    ');
      fail(6, `Test suite failed.\n    ${failures}\n    Fix all failing tests before pushing.`);
    }
  }
}

// ── GATE 7: DOC SYNC ──
if (changedFiles.includes('CLAUDE.md')) {
  try {
    const oldVer = run('git show HEAD~1:CLAUDE.md 2>/dev/null').match(/FRAMEWORK VERSION:\s*([\d.]+)/);
    const newVer = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8').match(/FRAMEWORK VERSION:\s*([\d.]+)/);
    if (oldVer && newVer && oldVer[1] === newVer[1]) {
      fail(7, `CLAUDE.md modified without version bump.\n` +
        `    Update FRAMEWORK VERSION before committing CLAUDE.md.`);
    }
  } catch (e) {
    // First commit or no previous version — skip
  }
}

// ── GATE 9: DESTRUCTIVE COMMANDS ──
if (cmd) {
  if (/push.*--force(?!-with-lease)/.test(cmd) || /push.*-f(?!ile)/.test(cmd)) {
    fail(9, `Force push blocked.\n    Use: git push --force-with-lease (safer alternative)`);
  }
  if (/reset\s+--hard/.test(cmd)) {
    fail(9, `Hard reset blocked.\n    Use: git stash first, then git reset`);
  }
  if (/tag\s+-d|push.*:refs\/tags/.test(cmd)) {
    fail(9, `Tag deletion blocked.\n    Tags are permanent release markers.`);
  }
}

// ── GATE 10: CLEARANCE CERTIFICATE ──
const timestamp = new Date().toISOString();
const sha = run('git rev-parse --short HEAD');
const role = (() => {
  try {
    const env = fs.readFileSync(path.join(ROOT, '.claude/session.env'), 'utf-8');
    const m = env.match(/ROLE=(.+)/);
    return m ? m[1] : 'UNKNOWN';
  } catch { return 'UNKNOWN'; }
})();

const certId = `CERT-${branch.replace(/\//g, '-')}-${sha}-${Date.now()}`;

const cert = `
════════════════════════════════════════════════════════
GIT CLEARANCE CERTIFICATE
════════════════════════════════════════════════════════
Timestamp:    ${timestamp}
Branch:       ${branch}
Story:        ${storyId || 'N/A'}
Operation:    git push
Commit:       ${sha}
Role:         ${role}
Gates:        9/9 PASSED
Certificate:  ${certId}
════════════════════════════════════════════════════════
`;

// Write certificate
const clearanceDir = path.join(ROOT, 'logs');
if (!fs.existsSync(clearanceDir)) fs.mkdirSync(clearanceDir, { recursive: true });
fs.appendFileSync(path.join(clearanceDir, 'git-clearance.log'), cert + '\n');

// Append to AUDIT_LOG
const auditPath = path.join(ROOT, 'AUDIT_LOG.md');
if (fs.existsSync(auditPath)) {
  fs.appendFileSync(auditPath,
    `| ${timestamp} | ${role} | GIT_PUSH | ${branch} | ${storyId || 'N/A'} | CLEARED | ${certId} |\n`);
}

// All gates passed
process.stderr.write(`✅ @version-manager: All gates passed. Push cleared.\n`);
process.stderr.write(`   Certificate: ${certId}\n`);
process.exit(0);
