#!/usr/bin/env node

/**
 * version-check.js — PreToolUse hook (runs on first tool call)
 * Compares FRAMEWORK VERSION in local CLAUDE.md vs git HEAD:CLAUDE.md
 * Warns if versions mismatch (CLAUDE.md drift detection).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const root = findProjectRoot();
    const claudePath = path.join(root, 'CLAUDE.md');

    if (!fs.existsSync(claudePath)) {
      process.exit(0);
    }

    // Read local version
    const localContent = fs.readFileSync(claudePath, 'utf8');
    const localMatch = localContent.match(/^## FRAMEWORK VERSION:\s*(.+)$/m);
    const localVer = localMatch ? localMatch[1].trim() : 'MISSING';

    // Read git HEAD version
    let repoVer = 'MISSING';
    try {
      const gitContent = execSync('git show HEAD:CLAUDE.md', { cwd: root, encoding: 'utf8' });
      const repoMatch = gitContent.match(/^## FRAMEWORK VERSION:\s*(.+)$/m);
      repoVer = repoMatch ? repoMatch[1].trim() : 'MISSING';
    } catch (_) {
      // Not in git or no commits yet
      process.exit(0);
    }

    if (localVer !== repoVer) {
      process.stderr.write(`\n⚠️  CLAUDE.md DRIFT DETECTED\n`);
      process.stderr.write(`   Repo version:  ${repoVer}\n`);
      process.stderr.write(`   Local version: ${localVer}\n`);
      process.stderr.write(`   Fix: git pull origin main && restart session\n\n`);

      // Log to branch-scoped audit log
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
        `${now}|System|${branch}|VERSION_DRIFT|Repo: ${repoVer} Local: ${localVer}|warn|0ms\n`
      );
    }

    process.exit(0);
  } catch (e) {
    process.exit(0); // Never block on hook errors
  }
});

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
