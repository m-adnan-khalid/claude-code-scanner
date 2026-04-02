#!/usr/bin/env node

/**
 * audit-logger.js — PostToolUse hook
 * Auto-logs every tool call to the active Task Brief's Audit Log section.
 * Format: ISO-timestamp|session_id|ROLE|branch|ACTION|DETAIL|STATUS|duration_ms
 *
 * Logs are branch-scoped: .claude/reports/audit/audit-{branch}.log
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const startMs = Date.now();
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input, tool_output } = data;

    if (!tool_name) return;

    // Resolve project root
    let root = process.cwd();
    while (!fs.existsSync(path.join(root, '.claude', 'hooks')) && root !== path.dirname(root)) {
      root = path.dirname(root);
    }

    const now = new Date();
    const timestamp = now.toISOString();

    // Extract session_id from hook input
    const sessionId = data.session_id || 'unknown';

    // Read CURRENT_ROLE from session.env
    let role = 'UNKNOWN';
    try {
      const envPath = path.join(root, '.claude', 'session.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/CURRENT_ROLE=(\S+)/);
        if (match) role = match[1];
      }
    } catch (_) {}

    // Read current git branch
    let branch = 'detached';
    try {
      branch = execSync('git branch --show-current', { cwd: root, timeout: 3000 })
        .toString().trim() || 'detached';
    } catch (_) {}

    // Build log line — pipe-delimited for structured parsing
    const action = getAction(tool_name);
    const detail = getDetail(tool_name, tool_input);
    const status = getStatus(tool_name, tool_output);
    const durationMs = Date.now() - startMs;
    const logLine = `${timestamp}|${sessionId}|${role}|${branch}|${action}|${detail}|${status}|${durationMs}ms`;

    // 1. Append to branch-scoped audit log
    const auditDir = path.join(root, '.claude', 'reports', 'audit');
    fs.mkdirSync(auditDir, { recursive: true });
    const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
    const branchLog = path.join(auditDir, `audit-${safeBranch}.log`);
    fs.appendFileSync(branchLog, logLine + '\n');

    // 2. Find active Task Brief and append to its Audit Log
    const tasksDir = path.join(root, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const briefFiles = fs.readdirSync(tasksDir)
        .filter(f => f.startsWith('BRIEF-') && f.endsWith('.md'))
        .sort()
        .reverse(); // most recent first

      for (const bf of briefFiles) {
        const briefPath = path.join(tasksDir, bf);
        const content = fs.readFileSync(briefPath, 'utf-8');

        // Only append to briefs that are PENDING or IN_PROGRESS
        if (/Status:\s*(PENDING|IN_PROGRESS)/.test(content)) {
          // Find the Audit Log section and append
          if (content.includes('## 8. Audit Log')) {
            // Simple lockfile to prevent concurrent read-modify-write corruption
            const lockPath = briefPath + '.lock';
            try {
              fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' }); // exclusive create
            } catch (_) {
              // Lock exists — another hook is writing. Append to separate audit log instead.
              fs.appendFileSync(branchLog, logLine + '\n');
              break;
            }
            try {
              // Re-read to get latest (another hook may have written between our first read and lock)
              const freshContent = fs.readFileSync(briefPath, 'utf-8');
              const completionIdx = freshContent.indexOf('# Completion Report');
              if (completionIdx > 0) {
                const before = freshContent.substring(0, completionIdx).trimEnd();
                const after = freshContent.substring(completionIdx);
                fs.writeFileSync(briefPath, before + '\n' + logLine + '\n\n' + after);
              } else {
                fs.appendFileSync(briefPath, logLine + '\n');
              }
            } finally {
              try { fs.unlinkSync(lockPath); } catch (_) {}
            }
          }
          break; // only update the most recent active brief
        }
      }
    }

  } catch (e) {
    // Silent — never block workflow
  }
});

function getAction(toolName) {
  const map = {
    'Read': 'READ_FILE',
    'Edit': 'EDIT_FILE',
    'Write': 'WRITE_FILE',
    'Bash': 'BASH_CMD',
    'Grep': 'GREP',
    'Glob': 'GLOB',
    'Agent': 'AGENT',
    'Skill': 'SKILL',
    'WebFetch': 'WEB_FETCH',
    'WebSearch': 'WEB_SEARCH',
  };
  return map[toolName] || toolName.toUpperCase();
}

function getDetail(toolName, input) {
  if (!input) return '—';
  try {
    if (toolName === 'Read') return truncate(input.file_path || '', 60);
    if (toolName === 'Edit') return truncate(input.file_path || '', 60);
    if (toolName === 'Write') return truncate(input.file_path || '', 60);
    if (toolName === 'Bash') return truncate(input.command || '', 60);
    if (toolName === 'Grep') return truncate(input.pattern || '', 40);
    if (toolName === 'Glob') return truncate(input.pattern || '', 40);
    if (toolName === 'Agent') return truncate(input.description || input.prompt?.substring(0, 40) || '', 40);
    if (toolName === 'Skill') return truncate(input.skill || '', 30);
    return '—';
  } catch (e) { return '—'; }
}

function getStatus(toolName, output) {
  if (!output) return 'ok';
  const str = typeof output === 'string' ? output : JSON.stringify(output);
  if (str.length < 50) return truncate(str, 50);
  if (toolName === 'Bash') {
    // Check exit code
    if (output.exit_code !== undefined) return output.exit_code === 0 ? 'exit:0' : `exit:${output.exit_code}`;
  }
  return `${Math.ceil(str.length / 4)} tokens`;
}

function truncate(str, max) {
  str = str.replace(/\n/g, ' ').trim();
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}
