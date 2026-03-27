#!/usr/bin/env node
// Pre-tool hook: block edits to protected files
const path = require('path');

// ── Protection logic ────────────────────────────────────────────────
function check(raw) {
  try {
    const data = JSON.parse(raw);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) return 0;

    const normalized = path.resolve(file).split(path.sep).join('/');

    const PROTECTED_DIRS = ['.github/workflows/'];
    for (const p of PROTECTED_DIRS) {
      if (normalized.includes(p)) {
        process.stderr.write(`BLOCKED: ${file} is protected.\n`);
        return 2;
      }
    }

    const basename = path.basename(normalized);
    const PROTECTED_EXACT = ['.env', '.env.local', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    for (const p of PROTECTED_EXACT) {
      if (basename === p) {
        process.stderr.write(`BLOCKED: ${file} is protected.\n`);
        return 2;
      }
    }
  } catch {
    // Malformed input — allow rather than block all operations
  }
  return 0;
}

// ── Robust stdin reader (4-layer) ───────────────────────────────────
let done = false;
let buf = '';

function finish(code) {
  if (done) return;
  done = true;
  process.exit(code);
}

// Layer 4: absolute hard cap — NEVER hang longer than 5s, always allow
setTimeout(() => finish(0), 5000).unref();

// Layer 3: if no data arrives within 300ms, stdin isn't coming — allow
const graceTimer = setTimeout(() => {
  if (!buf) finish(0);
}, 300);

process.stdin.setEncoding('utf-8');

process.stdin.on('data', chunk => {
  clearTimeout(graceTimer);
  buf += chunk;

  // Layer 1: eagerly try to parse — Claude Code sends a single JSON object,
  // so the moment we can parse it, we have everything. No need to wait for 'end'.
  try {
    JSON.parse(buf);
    // Valid JSON — run the check immediately
    finish(check(buf));
  } catch {
    // Incomplete JSON — keep buffering
  }
});

// Layer 2: normal 'end' event (fast path for well-behaved pipes)
process.stdin.on('end', () => {
  clearTimeout(graceTimer);
  finish(buf ? check(buf) : 0);
});

// Handle broken pipes, closed fds, etc.
process.stdin.on('error', () => finish(0));

// Ensure stdin is in flowing mode
process.stdin.resume();
