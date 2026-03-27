#!/usr/bin/env node
// Post-tool hook: track file changes for active task
const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) return;

    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (!fs.existsSync(tasksDir)) return;

    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf-8');
      if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
        const logPath = taskPath.replace(/\.md$/, '_changes.log');
        const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
        fs.appendFileSync(logPath, `| ${timestamp} | file_changed | ${file} |\n`);
        break;
      }
    }
  } catch {}
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
