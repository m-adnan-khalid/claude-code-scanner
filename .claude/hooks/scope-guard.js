#!/usr/bin/env node

/**
 * scope-guard.js — PreToolUse hook
 * Enforces role-based path scope. Reads CURRENT_ROLE from .claude/session.env
 * and blocks file edits outside the role's allowed paths.
 * Exit code 2 = BLOCK, 0 = ALLOW.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROLE_PATHS = {
  'CTO':          ['*'], // Full access — full audit, framework upgrades via PR
  'Architect':    ['docs/', '.claude/agents/', '.claude/rules/'], // Approve CLAUDE.md PRs, define agents, modify hooks via PR (CLAUDE.md changes go through PR process, not direct write)
  'TechLead':     ['.claude/agents/', '.claude/hooks/', '.claude/rules/', 'docs/adr/', 'docs/'], // Owns .claude/agents/, .claude/hooks/, docs/adr/ — cannot write feature code (src/), bypass QA gate, or deploy directly
  'BackendDev':   ['src/api/', 'src/services/', 'src/db/', 'src/models/', 'tests/api/', 'tests/services/', 'tests/db/', 'migrations/'], // Feature branches only — src + tests + migrations
  'FrontendDev':  ['src/ui/', 'src/components/', 'src/styles/', 'src/pages/'], // Feature branches only — src/ui/, src/components/, src/styles/, src/pages/
  'FullStackDev': ['src/', 'tests/', 'docs/adr/'], // src/ full access + tests/ + docs/adr/, feature branches only
  'QA':           ['tests/'], // tests/ full, src/ read-only
  'DevOps':       ['infra/', '.github/', 'scripts/', 'Dockerfile', 'docker-compose.yml', '.claude/CLAUDE.ci.md'], // infra/, .github/, scripts/, Dockerfile, docker-compose.yml
  'PM':           ['docs/requirements/'], // WRITE docs/requirements/ only
  'Designer':     ['src/styles/', 'docs/design/'] // src/styles/ full, docs/design/ WRITE
};

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    // Only check write operations
    if (!['Edit', 'Write'].includes(tool_name)) {
      process.exit(0);
    }

    const filePath = tool_input && tool_input.file_path;
    if (!filePath) process.exit(0);

    const root = findProjectRoot();
    const sessionEnvPath = path.join(root, '.claude', 'session.env');

    // If no session.env, allow (not yet set up) but warn
    if (!fs.existsSync(sessionEnvPath)) {
      process.stderr.write('[scope-guard] Warning: .claude/session.env not found. Run /setup-workspace to set your role.\n');
      process.exit(0);
    }

    const envContent = fs.readFileSync(sessionEnvPath, 'utf8');
    const roleMatch = envContent.match(/^CURRENT_ROLE=(.+)$/m);
    if (!roleMatch) process.exit(0);

    const role = roleMatch[1].trim();
    const allowedPaths = ROLE_PATHS[role];

    // If role not recognized or has wildcard, allow
    if (!allowedPaths || allowedPaths.includes('*')) {
      process.exit(0);
    }

    const relPath = path.relative(root, path.resolve(filePath));

    // Check if file is in allowed paths
    const allowed = allowedPaths.some(ap => {
      if (ap.endsWith('/')) {
        return relPath.startsWith(ap) || relPath.startsWith(ap.slice(0, -1));
      }
      return relPath === ap || relPath.startsWith(ap);
    });

    if (!allowed) {
      process.stderr.write(`\n❌ SCOPE VIOLATION: Role "${role}" cannot edit ${relPath}\n`);
      process.stderr.write(`   Allowed paths: ${allowedPaths.join(', ')}\n`);
      process.stderr.write(`   Change your role with /setup-workspace or ask the appropriate role owner.\n\n`);

      // Log violation to branch-scoped audit log
      const now = new Date().toISOString();
      let branch = 'detached';
      try {
        branch = execSync('git branch --show-current', { cwd: root, timeout: 3000 })
          .toString().trim() || 'detached';
      } catch (_) {}
      const auditDir = path.join(root, '.claude', 'reports', 'audit');
      fs.mkdirSync(auditDir, { recursive: true });
      const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
      fs.appendFileSync(
        path.join(auditDir, `audit-${safeBranch}.log`),
        `${now}|${role}|${branch}|SCOPE_VIOLATION|Blocked edit to ${relPath}|blocked|0ms\n`
      );

      process.exit(2); // BLOCK
    }

    process.exit(0);
  } catch (e) {
    process.exit(0); // Fail-open on errors
  }
});

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
