#!/usr/bin/env node

/**
 * pre-tool-use.js — PreToolUse hook
 * Validates tool actions against CLAUDE.md rules before execution.
 * Halts on violation (exits non-zero) or logs warning.
 *
 * Checks:
 * - Prevents writing to protected files (CLAUDE.md rules, settings.json)
 * - Validates Bash commands against safety rules
 * - Logs all pre-tool validations
 */

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    if (!tool_name) process.exit(0);

    const root = findProjectRoot();
    const now = new Date().toISOString();
    const role = getRole(root);
    const branch = getBranch(root);
    const startTime = Date.now();

    // Protected files — block direct writes
    const protectedFiles = [
      'CLAUDE.md',
      '.claude/settings.json',
      '.claude/settings.local.json'
    ];

    if (['Write', 'Edit'].includes(tool_name) && tool_input && tool_input.file_path) {
      const relPath = path.relative(root, tool_input.file_path);
      if (protectedFiles.includes(relPath)) {
        const duration = Date.now() - startTime;
        logToAudit(root, `${now}|${role}|${branch}|BLOCKED|Attempted write to protected file: ${relPath}|blocked|${duration}ms`);
        console.error(`BLOCKED: Cannot directly overwrite protected file: ${relPath}`);
        process.exit(1); // Halt — do not silently pass
      }
    }

    // Bash safety — block dangerous commands
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command;
      const dangerous = [
        /rm\s+-rf\b/, // rm -rf (any target)
        /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/, // fork bomb
        /curl\s+.*\|\s*(?:ba)?sh/, // curl | bash / curl | sh
        /wget\s+.*\|\s*(?:ba)?sh/, // wget | bash / wget | sh
        /\bmkfs\b/, // mkfs — format filesystem
      ];
      for (const pattern of dangerous) {
        if (pattern.test(cmd)) {
          const duration = Date.now() - startTime;
          logToAudit(root, `${now}|${role}|${branch}|BLOCKED|Dangerous command: ${cmd.substring(0, 60)}|blocked|${duration}ms`);
          console.error(`BLOCKED: Dangerous command detected`);
          process.exit(1);
        }
      }
    }

    // Log validation pass
    const detail = getDetail(tool_name, tool_input);
    const duration = Date.now() - startTime;
    logToAudit(root, `${now}|${role}|${branch}|VALIDATED|${tool_name}: ${detail}|ok|${duration}ms`);

    process.exit(0);
  } catch (e) {
    // On error, log but do NOT silently pass — log the failure
    try {
      const root = findProjectRoot();
      const now = new Date().toISOString();
      const role = getRole(root);
      const branch = getBranch(root);
      logToAudit(root, `${now}|${role}|${branch}|HOOK_ERROR|pre-tool-use: ${e.message}|error|0ms`);
    } catch (_) {}
    // Exit 0 to not block on hook internal errors, but error is logged
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
    return execSync('git branch --show-current', { cwd: root, timeout: 3000 })
      .toString().trim() || 'detached';
  } catch (_) { return 'detached'; }
}

function logToAudit(root, line) {
  try {
    const { execSync } = require('child_process');
    let branch = 'detached';
    try {
      branch = execSync('git branch --show-current', { cwd: root, timeout: 3000 })
        .toString().trim() || 'detached';
    } catch (_) {}
    const auditDir = path.join(root, '.claude', 'reports', 'audit');
    fs.mkdirSync(auditDir, { recursive: true });
    const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
    fs.appendFileSync(path.join(auditDir, `audit-${safeBranch}.log`), line + '\n');
  } catch (_) {}
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

function truncate(str, max) {
  str = str.replace(/\n/g, ' ').trim();
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}
