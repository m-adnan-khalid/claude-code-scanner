#!/usr/bin/env node
// StopFailure hook: handle rate limits, auth failures, max tokens, and other session-ending errors
// Preserves task state and provides recovery instructions

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

function getRecoveryAction(errorType) {
  const actions = {
    'rate_limit': 'Wait 60 seconds, then resume: claude --continue',
    'authentication_failed': 'Re-authenticate: check API key or run claude auth login',
    'billing_error': 'Check billing at console.anthropic.com, then resume',
    'invalid_request': 'Review last action — may need to reduce context. Resume with /compact first',
    'server_error': 'Transient error — retry: claude --continue',
    'max_output_tokens': 'Output was truncated. Resume to continue generation: claude --continue'
  };
  return actions[errorType] || 'Resume session: claude --continue';
}

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const errorType = data.stop_failure_error_type || data.error_type || 'unknown';

    // Log the failure
    const reportsDir = path.join(_projectRoot, '.claude', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logPath = path.join(reportsDir, 'session-failures.log');
    fs.appendFileSync(logPath, `| ${timestamp} | ${errorType} | ${JSON.stringify(data).substring(0, 500)} |\n`);

    // Save task state snapshot for recovery
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const content = fs.readFileSync(taskPath, 'utf-8');
        if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
          const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
          const snapshotDir = path.join(reportsDir, 'executions');
          if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir, { recursive: true });
          }
          const snapshot = {
            timestamp,
            task_id: id.trim(),
            error_type: errorType,
            recovery_action: getRecoveryAction(errorType),
            state_preserved: true
          };
          const snapshotPath = path.join(snapshotDir, `${id.trim()}_interrupted_${Date.now()}.json`);
          fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
          break;
        }
      }
    }

    // Output recovery instructions
    console.log(`\nSESSION FAILURE: ${errorType}`);
    console.log(`Recovery: ${getRecoveryAction(errorType)}`);
    console.log('Task state has been preserved. Resume with: claude --continue');
  } catch (e) {
    console.log('Session ended unexpectedly. Resume with: claude --continue');
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
