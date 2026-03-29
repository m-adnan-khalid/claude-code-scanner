#!/usr/bin/env node

/**
 * stop.js — Stop hook
 * Fires BEFORE session closes.
 * Writes "Last Completed" and "Next Step" to MEMORY.md on exit.
 * Reads the latest git log and TODO.md to determine current state.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const root = findProjectRoot();
  const memoryPath = path.join(root, 'MEMORY.md');
  const todoPath = path.join(root, 'TODO.md');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  // Get last git commit for "Last Completed"
  let lastCommit = 'unknown';
  try {
    lastCommit = execSync('git log --oneline -1', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {}

  // Get top TODO item for "Next Step"
  let nextStep = 'Check TODO.md for next task';
  if (fs.existsSync(todoPath)) {
    const todoContent = fs.readFileSync(todoPath, 'utf8');
    const match = todoContent.match(/- \[ \] (.+)/);
    if (match) nextStep = match[1];
  }

  // Update MEMORY.md — create with headers if missing
  let content = '';
  if (fs.existsSync(memoryPath)) {
    content = fs.readFileSync(memoryPath, 'utf8');
  }

  // Ensure headers exist before replacing
  if (!content.includes('## Last Completed')) {
    content += '\n\n## Last Completed\n(none)\n';
  }
  if (!content.includes('## Next Step')) {
    content += '\n\n## Next Step\n(none)\n';
  }

  // Update Last Completed
  content = content.replace(
    /## Last Completed\n.+/,
    `## Last Completed\n${now} — ${lastCommit}`
  );

  // Update Next Step
  content = content.replace(
    /## Next Step\n.+/,
    `## Next Step\n${nextStep}`
  );

  fs.writeFileSync(memoryPath, content);

  // Log to branch-scoped audit log
  const role = getRole(root);
  const branch = getBranch(root);
  const auditDir = path.join(root, '.claude', 'reports', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });
  const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
  const isoNow = new Date().toISOString();
  fs.appendFileSync(
    path.join(auditDir, `audit-${safeBranch}.log`),
    `${isoNow}|${role}|${branch}|SESSION_STOP|Last: ${lastCommit}|ok|0ms\n`
  );

} catch (e) {
  // Never block session close
}

function getRole(root) {
  try {
    const envPath = path.join(root, '.claude', 'session.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^CURRENT_ROLE=(.+)$/m);
      if (match) return match[1].trim();
    }
  } catch (_) {}
  return 'Unknown';
}

function getBranch(root) {
  try {
    return execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {
    return 'unknown';
  }
}

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
