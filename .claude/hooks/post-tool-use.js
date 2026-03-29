#!/usr/bin/env node

/**
 * post-tool-use.js — PostToolUse hook
 * Writes an entry to .claude/reports/audit/audit-{branch}.log on every tool call.
 * Entry format: timestamp | tool | action | result
 */

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input, tool_output } = data;

    if (!tool_name) process.exit(0);

    const root = findProjectRoot();
    const now = new Date().toISOString();

    const action = getAction(tool_name);
    const detail = getDetail(tool_name, tool_input);
    const result = getResult(tool_name, tool_output);

    // Get role and branch for structured logging
    const role = getRole(root);
    const branch = getBranch(root);
    const startTime = process.env.TOOL_START_TIME ? parseInt(process.env.TOOL_START_TIME) : Date.now();
    const duration = Date.now() - startTime;

    const logLine = `${now}|${role}|${branch}|${action}|${detail}|${result}|${duration}ms`;

    // Write to branch-scoped audit log
    const auditDir = path.join(root, '.claude', 'reports', 'audit');
    fs.mkdirSync(auditDir, { recursive: true });
    const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
    fs.appendFileSync(path.join(auditDir, `audit-${safeBranch}.log`), logLine + '\n');

    process.exit(0);
  } catch (e) {
    // Log error to audit if possible, never block
    try {
      const root = findProjectRoot();
      const now = new Date().toISOString();
      const auditDir = path.join(root, '.claude', 'reports', 'audit');
      fs.mkdirSync(auditDir, { recursive: true });
      fs.appendFileSync(path.join(auditDir, 'audit-errors.log'), `${now}|System|unknown|HOOK_ERROR|post-tool-use: ${e.message}|error|0ms\n`);
    } catch (_) {}
    process.exit(0);
  }
});

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}

function getAction(toolName) {
  const map = {
    'Read': 'READ_FILE', 'Edit': 'EDIT_FILE', 'Write': 'WRITE_FILE',
    'Bash': 'BASH_CMD', 'Grep': 'GREP', 'Glob': 'GLOB',
    'Agent': 'AGENT', 'Skill': 'SKILL',
  };
  return map[toolName] || toolName.toUpperCase();
}

function getDetail(toolName, input) {
  if (!input) return '—';
  if (toolName === 'Read') return truncate(input.file_path || '', 60);
  if (toolName === 'Edit') return truncate(input.file_path || '', 60);
  if (toolName === 'Write') return truncate(input.file_path || '', 60);
  if (toolName === 'Bash') return truncate(input.command || '', 60);
  if (toolName === 'Grep') return truncate(input.pattern || '', 40);
  if (toolName === 'Glob') return truncate(input.pattern || '', 40);
  return '—';
}

function getResult(toolName, output) {
  if (!output) return 'ok';
  const str = typeof output === 'string' ? output : JSON.stringify(output);
  if (str.length < 50) return truncate(str, 50);
  return 'ok';
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
    const { execSync } = require('child_process');
    return execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {
    return 'unknown';
  }
}

function truncate(str, max) {
  str = str.replace(/\n/g, ' ').trim();
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}
