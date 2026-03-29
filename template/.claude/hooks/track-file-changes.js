#!/usr/bin/env node
// Post-tool hook: track file changes for active task
// Now: logs file state before edit (git hash) for undo capability

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
}

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) return;

    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Read CURRENT_ROLE from session.env
    let role = 'unknown';
    try {
      const sessionEnvPath = path.join(_projectRoot, '.claude', 'session.env');
      if (fs.existsSync(sessionEnvPath)) {
        const envContent = fs.readFileSync(sessionEnvPath, 'utf-8');
        const roleMatch = envContent.match(/^CURRENT_ROLE=(.+)$/m);
        if (roleMatch) role = roleMatch[1].trim();
      }
    } catch (_) { /* ignore */ }

    // Get git hash of file before change (for undo capability)
    let gitHash = 'new-file';
    try {
      gitHash = execSync(`git hash-object "${file}" 2>/dev/null`, { cwd: _projectRoot, timeout: 2000 })
        .toString().trim().substring(0, 8) || 'untracked';
    } catch (_) {
      gitHash = 'untracked';
    }

    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (!fs.existsSync(tasksDir)) return;

    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf-8');
      if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
        const logPath = taskPath.replace(/\.md$/, '_changes.log');
        // Rotate log if over 5000 lines (keep last 3000)
        if (fs.existsSync(logPath)) {
          const lines = fs.readFileSync(logPath, 'utf-8').split('\n');
          if (lines.length > 5000) {
            const rotated = lines.slice(-3000).join('\n');
            fs.writeFileSync(logPath, rotated + '\n');
          }
        }
        // Include git hash for undo: `git show {hash}` recovers the pre-edit version
        fs.appendFileSync(logPath, `| ${timestamp} | ${role} | file_changed | ${file} | pre:${gitHash} |\n`);
        break;
      }
    }
  } catch (e) {
    logHookFailure('track-file-changes', e.message);
  }
}

// ── Robust stdin reader (4-layer) ───────────────────────────────────
let done = false;
let buf = '';

function finish() {
  if (done) return;
  done = true;
  process.exit(0);
}

setTimeout(() => finish(), 5000).unref();

const graceTimer = setTimeout(() => {
  if (!buf) finish();
}, 300);

process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => {
  clearTimeout(graceTimer);
  buf += chunk;
  try {
    JSON.parse(buf);
    processInput(buf);
    finish();
  } catch {}
});
process.stdin.on('end', () => {
  clearTimeout(graceTimer);
  if (buf) processInput(buf);
  finish();
});
process.stdin.on('error', () => finish());
process.stdin.resume();
