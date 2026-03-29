#!/usr/bin/env node

/**
 * branch-conflict-check.js — PreToolUse hook
 * Checks if a file being edited was modified by another branch in the last 24h.
 * Warns (does not block) to prevent merge conflicts at scale.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    if (!['Edit', 'Write'].includes(tool_name)) {
      process.exit(0);
    }

    const filePath = tool_input && tool_input.file_path;
    if (!filePath) process.exit(0);

    const root = findProjectRoot();
    const relPath = path.relative(root, path.resolve(filePath));

    if (relPath.startsWith('..')) process.exit(0);

    // Get current branch
    let currentBranch = '';
    try {
      currentBranch = execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
    } catch (_) {
      process.exit(0);
    }

    // Check if file was touched by other branches in last 24h
    try {
      const recentChanges = execSync(
        `git log --all --since="24 hours ago" --oneline -- "${relPath}"`,
        { cwd: root, encoding: 'utf8' }
      ).trim();

      if (recentChanges) {
        // Filter out current branch commits
        const lines = recentChanges.split('\n').filter(l => l.trim());
        const otherBranchChanges = [];

        for (const line of lines) {
          const hash = line.split(' ')[0];
          try {
            const branches = execSync(
              `git branch --contains ${hash} --format="%(refname:short)"`,
              { cwd: root, encoding: 'utf8' }
            ).trim();
            if (!branches.includes(currentBranch)) {
              otherBranchChanges.push(line);
            }
          } catch (_) {}
        }

        if (otherBranchChanges.length > 0) {
          process.stderr.write(`\n⚠️  CONFLICT RISK: ${relPath} was modified by another branch recently\n`);
          for (const change of otherBranchChanges.slice(0, 3)) {
            process.stderr.write(`   ${change}\n`);
          }
          process.stderr.write(`   Coordinate with the other developer before editing.\n\n`);

          // Log to branch-scoped audit log
          const now = new Date().toISOString();
          const auditDir = path.join(root, '.claude', 'reports', 'audit');
          fs.mkdirSync(auditDir, { recursive: true });
          const safeBranch = currentBranch.replace(/[/\\:*?"<>|]/g, '-');
          fs.appendFileSync(
            path.join(auditDir, `audit-${safeBranch}.log`),
            `${now}|System|${currentBranch}|CONFLICT_RISK|${relPath} touched by other branch|warn|0ms\n`
          );
        }
      }
    } catch (_) {
      // Git command failed — skip silently
    }

    process.exit(0); // Always allow — this is advisory only
  } catch (e) {
    process.exit(0);
  }
});

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
