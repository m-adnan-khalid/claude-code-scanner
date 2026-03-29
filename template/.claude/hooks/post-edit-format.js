#!/usr/bin/env node
// Post-tool hook: auto-format edited files
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  } catch (e) { logHookFailure("post-edit-format", e.message); }
}


// ── Formatting logic ────────────────────────────────────────────────
function format(raw) {
  try {
    const data = JSON.parse(raw);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file || !fs.existsSync(file)) return;

    const resolved = path.resolve(file);
    if (!resolved.startsWith(_projectRoot)) return;

    const ext = path.extname(file).toLowerCase();
    const formatters = {
      '.ts': ['npx', ['prettier', '--write']],
      '.tsx': ['npx', ['prettier', '--write']],
      '.js': ['npx', ['prettier', '--write']],
      '.jsx': ['npx', ['prettier', '--write']],
      '.json': ['npx', ['prettier', '--write']],
      '.css': ['npx', ['prettier', '--write']],
      '.py': ['black', []],
      '.go': ['gofmt', ['-w']],
      '.rs': ['rustfmt', []],
    };

    const formatter = formatters[ext];
    if (formatter) {
      const [cmd, args] = formatter;
      try { execFileSync(cmd, [...args, resolved], { stdio: 'ignore', timeout: 10000 }); } catch {}
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

// Layer 4: absolute hard cap — NEVER hang longer than 5s
setTimeout(() => finish(), 5000).unref();

// Layer 3: if no data arrives within 300ms, stdin isn't coming
const graceTimer = setTimeout(() => {
  if (!buf) finish();
}, 300);

process.stdin.setEncoding('utf-8');

process.stdin.on('data', chunk => {
  clearTimeout(graceTimer);
  buf += chunk;

  // Layer 1: eagerly try to parse — process immediately once JSON is complete
  try {
    JSON.parse(buf);
    format(buf);
    finish();
  } catch {
    // Incomplete JSON — keep buffering
  }
});

// Layer 2: normal 'end' event
process.stdin.on('end', () => {
  clearTimeout(graceTimer);
  if (buf) format(buf);
  finish();
});

// Handle broken pipes, closed fds, etc.
process.stdin.on('error', () => finish());

// Ensure stdin is in flowing mode
process.stdin.resume();
