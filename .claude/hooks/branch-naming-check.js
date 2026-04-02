#!/usr/bin/env node

/**
 * branch-naming-check.js — PreToolUse hook
 * Validates branch naming follows role-prefixed convention:
 * [role]/[TICKET-ID]/[description]
 * Warns on first tool use if branch name doesn't match pattern.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Only check once per session
const CHECKED_FILE = path.join(process.env.TMPDIR || '/tmp', '.claude-branch-naming-checked');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    // Skip if already checked this session
    if (fs.existsSync(CHECKED_FILE)) {
      const age = Date.now() - fs.statSync(CHECKED_FILE).mtimeMs;
      if (age < 3600000) {
        // 1 hour
        process.exit(0);
      }
    }

    const root = findProjectRoot();

    let branch = '';
    try {
      branch = execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
    } catch (_) {
      process.exit(0);
    }

    // Skip main/master/develop branches
    if (['main', 'master', 'develop', 'dev', 'staging', 'production'].includes(branch)) {
      fs.writeFileSync(CHECKED_FILE, 'main');
      process.exit(0);
    }

    // Valid patterns: role/ticket/description or role/description
    const validRoles = [
      'cto',
      'architect',
      'techlead',
      'backend',
      'frontend',
      'fullstack',
      'qa',
      'devops',
      'pm',
      'designer',
      'feature',
      'fix',
      'hotfix',
      'chore',
      'docs',
      'test',
      'refactor',
    ];
    const parts = branch.split('/');

    // Read CURRENT_ROLE to validate prefix matches session role
    let currentRole = '';
    try {
      const envPath = path.join(root, '.claude', 'session.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^CURRENT_ROLE=(.+)$/m);
        if (match) currentRole = match[1].trim();
      }
    } catch (_) {}

    // Role name → branch prefix mapping
    const roleToBranchPrefix = {
      CTO: 'cto',
      Architect: 'architect',
      TechLead: 'techlead',
      BackendDev: 'backend',
      FrontendDev: 'frontend',
      FullStackDev: 'fullstack',
      QA: 'qa',
      DevOps: 'devops',
      PM: 'pm',
      Designer: 'designer',
    };

    if (parts.length < 2) {
      process.stderr.write(`\n⚠️  BRANCH NAMING: "${branch}" doesn't follow convention\n`);
      process.stderr.write(`   Expected: [role]/[ticket-id]/[description]\n`);
      process.stderr.write(`   Example:  backend/PROJ-42/auth-service\n`);
      process.stderr.write(`   Valid roles: ${validRoles.join(', ')}\n\n`);
    } else {
      const branchRole = parts[0].toLowerCase();
      if (!validRoles.includes(branchRole)) {
        process.stderr.write(
          `\n⚠️  BRANCH NAMING: "${parts[0]}" is not a recognized role prefix\n`
        );
        process.stderr.write(`   Valid: ${validRoles.join(', ')}\n\n`);
      } else if (currentRole && roleToBranchPrefix[currentRole]) {
        const expectedPrefix = roleToBranchPrefix[currentRole];
        // Only warn for role-specific prefixes, not generic ones (feature, fix, etc.)
        const genericPrefixes = ['feature', 'fix', 'hotfix', 'chore', 'docs', 'test', 'refactor'];
        if (!genericPrefixes.includes(branchRole) && branchRole !== expectedPrefix) {
          process.stderr.write(
            `\n⚠️  BRANCH PREFIX MISMATCH: You are "${currentRole}" but branch uses "${branchRole}/"\n`
          );
          process.stderr.write(`   Expected prefix for your role: ${expectedPrefix}/\n`);
          process.stderr.write(`   Change role with /setup-workspace or rename branch.\n\n`);
        }
      }
    }

    // Log to branch-scoped audit log
    logToAudit(root, branch);

    // Mark as checked
    fs.writeFileSync(CHECKED_FILE, branch);
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

function logToAudit(root, branch) {
  try {
    const now = new Date().toISOString();
    let role = 'Unknown';
    try {
      const envPath = path.join(root, '.claude', 'session.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^CURRENT_ROLE=(.+)$/m);
        if (match) role = match[1].trim();
      }
    } catch (_) {}
    const auditDir = path.join(root, '.claude', 'reports', 'audit');
    fs.mkdirSync(auditDir, { recursive: true });
    const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
    fs.appendFileSync(
      path.join(auditDir, `audit-${safeBranch}.log`),
      `${now}|${role}|${branch}|BRANCH_NAMING_CHECK|Validated branch name|ok|0ms\n`
    );
  } catch (_) {}
}

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
