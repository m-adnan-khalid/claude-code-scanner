#!/usr/bin/env node
// Stop hook: persist memory_update from active task HANDOFF to MEMORY.md
// and warn about uncommitted changes before session ends.
// Addresses CRITICAL gap: agents produce memory_update but nothing auto-persists it.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse stdin for session_id
let _sessionId = 'unknown';
let _input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { _input += chunk; });
process.stdin.on('end', () => {
  try { _sessionId = JSON.parse(_input).session_id || 'unknown'; } catch (_) {}
});
setTimeout(() => {
  try { if (_input && _sessionId === 'unknown') _sessionId = JSON.parse(_input).session_id || 'unknown'; } catch (_) {}
}, 300);

let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
const memPath = path.join(_projectRoot, 'MEMORY.md');

// 1. Persist memory_update from active task to MEMORY.md
if (fs.existsSync(tasksDir)) {
  try {
    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const content = fs.readFileSync(path.join(tasksDir, tf), 'utf-8');
      if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|DONE)/.test(content)) continue;

      const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';

      // Extract memory_update from the last HANDOFF block
      const blocks = content.match(/```[\s\S]*?HANDOFF:[\s\S]*?```/g);
      if (!blocks) continue;

      const lastBlock = blocks[blocks.length - 1];
      const memMatch = lastBlock.match(/memory_update:\s*\n([\s\S]*?)(?=\n\s{2}\w+:|\n```|$)/);
      if (!memMatch) continue;

      const memUpdate = memMatch[1].split('\n').map(l => l.trim()).filter(l => l).join('\n');
      if (!memUpdate) continue;

      // Check if this update was already written
      let existingMem = '';
      if (fs.existsSync(memPath)) {
        existingMem = fs.readFileSync(memPath, 'utf-8');
      }

      if (existingMem.includes(id.trim()) && existingMem.includes(memUpdate.split('\n')[0])) {
        continue; // Already persisted
      }

      // Append to MEMORY.md with session_id
      const entry = `\n## ${id.trim()} — ${new Date().toISOString().split('T')[0]} (session: ${_sessionId})\n${memUpdate}\n`;
      fs.appendFileSync(memPath, entry);
      console.log(`MEMORY: Persisted memory_update from ${id.trim()} to MEMORY.md`);
      break;
    }
  } catch (_) { /* best-effort */ }
}

// 1b. Log session end to sessions.log
setTimeout(() => {
  try {
    const reportsDir = path.join(_projectRoot, '.claude', 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const sessionLogPath = path.join(reportsDir, 'sessions.log');
    const ts = new Date().toISOString();
    const branch = (() => { try { return execSync('git branch --show-current', { cwd: _projectRoot, encoding: 'utf8', timeout: 2000 }).trim(); } catch (_) { return 'unknown'; } })();
    fs.appendFileSync(sessionLogPath, `| ${ts} | ${_sessionId} | ${branch} | stop |\n`);
  } catch (_) {}
}, 400);

// 2. Warn about uncommitted changes
try {
  const diff = execSync('git diff --stat', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim();
  const untracked = execSync('git ls-files --others --exclude-standard', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim();

  if (diff || untracked) {
    console.log('');
    console.log('WARNING: SESSION ENDING WITH UNCOMMITTED WORK');
    if (diff) {
      const fileCount = diff.split('\n').length - 1;
      console.log(`  Modified files: ${fileCount}`);
    }
    if (untracked) {
      const untrackedCount = untracked.split('\n').filter(l => l.trim()).length;
      console.log(`  Untracked files: ${untrackedCount}`);
    }
    console.log('  Consider committing before ending session to avoid losing work.');
  }
} catch (_) { /* git not available */ }

// 3. Warn about orphaned worktrees
try {
  const worktrees = execSync('git worktree list', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim();
  const wtLines = worktrees.split('\n').filter(l => l.trim());
  if (wtLines.length > 1) {
    console.log(`\nWARNING: ${wtLines.length - 1} active git worktree(s) detected. Clean up with 'git worktree remove <path>' if no longer needed.`);
  }
} catch (_) { /* git not available */ }

process.exit(0);
