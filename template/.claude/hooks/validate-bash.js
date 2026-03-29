#!/usr/bin/env node
// Pre-tool hook: block dangerous bash commands

// ── Protection logic ────────────────────────────────────────────────
function check(raw) {
  try {
    const data = JSON.parse(raw);
    const cmd = (data.tool_input && data.tool_input.command) || '';
    if (!cmd) return 0;

    const DANGEROUS_STRINGS = [':(){ :|:& };:', '> /dev/sda', 'mkfs', 'dd if='];
    const DANGEROUS_PATTERNS_EXTRA = [/rm\s+-rf\b/];
    const DANGEROUS_PATTERNS = [/curl\s.*\|\s*bash/, /wget\s.*\|\s*bash/];

    for (const p of DANGEROUS_STRINGS) {
      if (cmd.includes(p)) {
        process.stderr.write('BLOCKED: Dangerous command.\n');
        return 1;
      }
    }
    for (const rx of [...DANGEROUS_PATTERNS, ...DANGEROUS_PATTERNS_EXTRA]) {
      if (rx.test(cmd)) {
        process.stderr.write('BLOCKED: Dangerous command.\n');
        return 1;
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
