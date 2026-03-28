#!/usr/bin/env node
// SubagentStop hook: track agent completion for execution metrics
// Logs agent name, duration, and result to reports and active task

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
    const agentName = data.agent_name || data.name || 'unknown';
    const status = data.status || data.result || 'completed';
    const turns = data.turns_used || data.turns || 0;

    // Log to agent completions file
    const reportsDir = path.join(_projectRoot, '.claude', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const logPath = path.join(reportsDir, 'agent-completions.log');
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const entry = `| ${timestamp} | ${agentName} | ${status} | turns:${turns} |\n`;
    fs.appendFileSync(logPath, entry);

    // Also log to active task if one exists
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const content = fs.readFileSync(taskPath, 'utf-8');
        if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
          const taskLogPath = taskPath.replace(/\.md$/, '_changes.log');
          fs.appendFileSync(taskLogPath, `| ${timestamp} | AGENT_COMPLETE | ${agentName}: ${status} (${turns} turns) |\n`);
          break;
        }
      }
    }

    process.stderr.write(`Agent completed: ${agentName} — ${status} (${turns} turns)\n`);
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
