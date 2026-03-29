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

  // Update MEMORY.md
  if (fs.existsSync(memoryPath)) {
    let content = fs.readFileSync(memoryPath, 'utf8');

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
  }

  // Log to audit
  const auditPath = path.join(root, 'AUDIT_LOG.md');
  if (fs.existsSync(auditPath)) {
    fs.appendFileSync(auditPath, `${now} | System | SESSION_STOP | Last: ${lastCommit} | Next: ${nextStep}\n`);
  }

} catch (e) {
  // Never block session close
}

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
