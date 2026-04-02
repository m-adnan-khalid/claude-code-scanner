#!/usr/bin/env node

/**
 * git-checkout-warn.js — PreToolUse hook for git checkout/switch
 * Warns when switching branches if active DEVELOPING/DEV_TESTING tasks exist
 * on the current branch. Prevents silent task abandonment.
 * Exit 0 = allow (with warning), Exit 2 = block (never — advisory only).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Read stdin
let input = '';
try { input = fs.readFileSync('/dev/stdin', 'utf-8'); } catch (e) { /* ok */ }

let cmd = '';
try { cmd = JSON.parse(input).tool_input?.command || ''; } catch { cmd = ''; }

// Only trigger on git checkout or git switch
if (!/git\s+(checkout|switch)\s/.test(cmd)) {
  process.exit(0);
}

// Skip if it's checking out a file (not a branch)
if (/git\s+checkout\s+--\s/.test(cmd) || /git\s+checkout\s+HEAD\s/.test(cmd)) {
  process.exit(0);
}

// Get current branch
let currentBranch = '';
try {
  currentBranch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim();
} catch (e) {
  process.exit(0); // Can't determine branch, let it through
}

// Check for active tasks on current branch
const tasksDir = path.join(ROOT, '.claude', 'tasks');
const activeStates = ['DEVELOPING', 'DEV_TESTING', 'REVIEWING', 'CI_PENDING', 'QA_TESTING'];
const warnings = [];

if (fs.existsSync(tasksDir)) {
  try {
    const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(tasksDir, f), 'utf8');
      // Check if task is on this branch and in active state
      const branchMatch = content.match(/branch:\s*(\S+)/i);
      const statusMatch = content.match(/status:\s*(\S+)/i);
      if (branchMatch && statusMatch) {
        const taskBranch = branchMatch[1];
        const taskStatus = statusMatch[1];
        if (taskBranch === currentBranch && activeStates.some(s => taskStatus.includes(s))) {
          warnings.push(`  ${f.replace('.md', '')}: ${taskStatus} on ${currentBranch}`);
        }
      }
    }
  } catch (e) { /* best effort */ }
}

// Check for uncommitted changes
let dirtyFiles = 0;
try {
  const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim();
  dirtyFiles = status ? status.split('\n').length : 0;
} catch (e) { /* ignore */ }

// Warn but don't block
if (warnings.length > 0) {
  process.stderr.write(`\n⚠️  ACTIVE TASKS on branch "${currentBranch}":\n`);
  process.stderr.write(warnings.join('\n') + '\n');
  process.stderr.write(`   Switching branches may orphan this work.\n`);
  process.stderr.write(`   Consider: /workflow pause TASK-id before switching.\n\n`);
}

if (dirtyFiles > 0) {
  process.stderr.write(`⚠️  ${dirtyFiles} uncommitted file(s) on "${currentBranch}". Consider stashing or committing first.\n`);
}

// Advisory only — never block checkout
process.exit(0);
