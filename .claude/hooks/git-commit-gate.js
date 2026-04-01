#!/usr/bin/env node

/**
 * git-commit-gate.js — PreToolUse hook for git commit
 * Runs Gate 3 (commit message) and Gate 4 (secrets) before allowing commit.
 * Exit 0 = allow, Exit 2 = hard block.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 10000 }).trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function fail(gate, msg) {
  process.stderr.write(`❌ GATE ${gate} FAIL: ${msg}\n`);
  process.exit(2);
}

// Read stdin for tool input
let input = '';
try {
  input = fs.readFileSync('/dev/stdin', 'utf-8');
} catch (e) { /* ok */ }

const cmd = (() => {
  try { return JSON.parse(input).tool_input?.command || ''; }
  catch { return ''; }
})();

// Extract commit message from command
const msgMatch = cmd.match(/-m\s+["']([^"']+)["']/) || cmd.match(/-m\s+"([^"]+)"/);
const msg = msgMatch ? msgMatch[1] : '';

if (!msg) {
  // No -m flag — might be using editor, or heredoc. Let git handle it.
  process.exit(0);
}

// ── GATE 3: COMMIT MESSAGE QUALITY ──

// 3.1 — Conventional Commits
const commitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .{10,}/;
if (!commitPattern.test(msg)) {
  fail(3, `Commit message violates Conventional Commits format.\n` +
    `    Required: type(scope): description (min 10 chars)\n` +
    `    Types:    feat|fix|docs|style|refactor|test|chore|perf|ci\n` +
    `    Current:  "${msg}"\n` +
    `    Example:  feat(STORY-001): populate idea canvas from scanned docs`);
}

// 3.2 — Story/Task ID (warn only for commits, block on push)
if (!/[A-Z]+-[0-9]+/.test(msg)) {
  process.stderr.write(`⚠️  GATE 3 WARN: No story/task ID in commit message. Add one before pushing.\n`);
}

// 3.3 — WIP/placeholder
if (/^(wip|temp|test commit|asdf|\.\.\.)/i.test(msg)) {
  fail(3, `WIP/placeholder commit message detected: "${msg}"\n` +
    `    Write a descriptive commit message.`);
}

// ── GATE 4: SECRET SCAN (on staged files) ──
const stagedFiles = run('git diff --cached --name-only').split('\n').filter(Boolean);

const secretPatterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'API Key (sk-)', regex: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'GitHub PAT', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'Private Key', regex: /-----BEGIN.*PRIVATE KEY-----/ },
  { name: 'Hardcoded Password', regex: /password\s*=\s*['"][^'"]{4,}/ },
];

const protectedFiles = ['.env', '.env.local', '.env.production'];

for (const file of stagedFiles) {
  const basename = path.basename(file);
  if (protectedFiles.includes(basename) || /\.(pem|key|p12|pfx)$/.test(file)) {
    fail(4, `Protected file '${file}' staged for commit.\n` +
      `    Run: git reset HEAD ${file}`);
  }

  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const { name, regex } of secretPatterns) {
        if (regex.test(content)) {
          fail(4, `Potential ${name} in ${file}.\n` +
            `    Remove credential and use environment variables.\n` +
            `    Run: git reset HEAD ${file}`);
        }
      }
    } catch (e) { /* binary — skip */ }
  }
}

process.stderr.write(`✅ Commit gate passed.\n`);
process.exit(0);
