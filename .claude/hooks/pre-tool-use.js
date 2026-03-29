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
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Protected files — block direct writes
    const protectedFiles = [
      'CLAUDE.md',
      '.claude/settings.json',
      '.claude/settings.local.json'
    ];

    if (tool_name === 'Write' && tool_input && tool_input.file_path) {
      const relPath = path.relative(root, tool_input.file_path);
      if (protectedFiles.includes(relPath)) {
        const msg = `${now} BLOCKED | ${tool_name} | Attempted write to protected file: ${relPath}`;
        logToAudit(root, msg);
        console.error(`BLOCKED: Cannot directly overwrite protected file: ${relPath}`);
        process.exit(1); // Halt — do not silently pass
      }
    }

    // Bash safety — block dangerous commands
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command;
      const dangerous = [
        /rm\s+-rf\s+\/(?!\S)/, // rm -rf /
        /rm\s+-rf\s+~/, // rm -rf ~
        /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/, // fork bomb
      ];
      for (const pattern of dangerous) {
        if (pattern.test(cmd)) {
          const msg = `${now} BLOCKED | ${tool_name} | Dangerous command: ${cmd.substring(0, 60)}`;
          logToAudit(root, msg);
          console.error(`BLOCKED: Dangerous command detected`);
          process.exit(1);
        }
      }
    }

    // Log validation pass
    const detail = getDetail(tool_name, tool_input);
    const msg = `${now} VALIDATED | ${tool_name} | ${detail}`;
    logToAudit(root, msg);

    process.exit(0);
  } catch (e) {
    // On error, log but do NOT silently pass — log the failure
    try {
      const root = findProjectRoot();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      logToAudit(root, `${now} HOOK_ERROR | pre-tool-use | ${e.message}`);
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

function logToAudit(root, line) {
  const auditPath = path.join(root, 'AUDIT_LOG.md');
  if (fs.existsSync(auditPath)) {
    fs.appendFileSync(auditPath, line + '\n');
  }
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
