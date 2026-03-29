#!/usr/bin/env node
// PostToolUseFailure hook: track tool failures for debugging and execution reports
// Now: counts consecutive failures, escalates after 3, logs to hook-failures.log

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

const reportsDir = path.join(_projectRoot, '.claude', 'reports');
const failureCountFile = path.join(reportsDir, '.consecutive-failures.json');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
}

function getConsecutiveFailures() {
  try {
    if (fs.existsSync(failureCountFile)) {
      const data = JSON.parse(fs.readFileSync(failureCountFile, 'utf-8'));
      // Reset if last failure was more than 5 minutes ago (different operation)
      if (Date.now() - new Date(data.last_failure).getTime() > 5 * 60 * 1000) {
        return { count: 0, tool: null, last_failure: null };
      }
      return data;
    }
  } catch (_) {}
  return { count: 0, tool: null, last_failure: null };
}

function saveConsecutiveFailures(data) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(failureCountFile, JSON.stringify(data));
  } catch (_) {}
}

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const toolName = data.tool_name || 'unknown';
    const error = data.tool_error || data.error || 'unknown error';
    const toolInput = data.tool_input || {};
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Log to failure tracking file
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const logPath = path.join(reportsDir, 'tool-failures.log');
    const entry = `| ${timestamp} | ${toolName} | ${String(error).substring(0, 200).replace(/\n/g, ' ')} | ${JSON.stringify(toolInput).substring(0, 200)} |\n`;
    fs.appendFileSync(logPath, entry);

    // Track consecutive failures
    const failures = getConsecutiveFailures();
    failures.count = (failures.tool === toolName) ? failures.count + 1 : 1;
    failures.tool = toolName;
    failures.last_failure = timestamp;
    saveConsecutiveFailures(failures);

    // Also log to active task's changes log
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const content = fs.readFileSync(taskPath, 'utf-8');
        if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
          const taskLogPath = taskPath.replace(/\.md$/, '_changes.log');
          fs.appendFileSync(taskLogPath, `| ${timestamp} | TOOL_FAILURE | ${toolName}: ${String(error).substring(0, 100)} |\n`);
          break;
        }
      }
    }

    // Escalate after 3 consecutive failures of the same tool
    if (failures.count >= 3) {
      console.log(`\nTOOL FAILURE ESCALATION: ${toolName} has failed ${failures.count} times consecutively`);
      console.log(`Last error: ${String(error).substring(0, 150)}`);
      console.log('Consider: different approach, check permissions, or ask user for guidance');
      // Reset counter after escalation
      saveConsecutiveFailures({ count: 0, tool: null, last_failure: null });
    } else {
      process.stderr.write(`Tool failure tracked: ${toolName} (${failures.count}/3) — ${String(error).substring(0, 100)}\n`);
    }
  } catch (e) {
    logHookFailure('tool-failure-tracker', e.message);
  }
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
