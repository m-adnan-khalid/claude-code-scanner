#!/usr/bin/env node
// StopFailure hook: handle rate limits, auth failures, max tokens, and other session-ending errors
// Now: marks task as INTERRUPTED in timeline, preserves full loop state, saves recovery manifest

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
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

function extractLoopState(content) {
  const match = content.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
  if (!match) return null;
  const lines = match[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
  return lines.map(l => l.trim()).join('; ');
}

function extractLastHandoff(content) {
  const lines = content.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
  return lines ? lines[lines.length - 1].trim() : null;
}

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const errorType = data.stop_failure_error_type || data.error_type || 'unknown';
    const sessionId = data.session_id || 'unknown';
    const timestamp = new Date().toISOString();

    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    // Log the failure
    const logPath = path.join(reportsDir, 'session-failures.log');
    fs.appendFileSync(logPath, `| ${timestamp} | ${sessionId} | ${errorType} | ${JSON.stringify(data).substring(0, 500)} |\n`);

    // Find and update active task
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        let content = fs.readFileSync(taskPath, 'utf-8');
        if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING)/.test(content)) {
          continue;
        }

        const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
        const status = (content.match(/^status:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
        const loopState = extractLoopState(content);
        const lastHandoff = extractLastHandoff(content);

        // Mark interruption in task timeline (append, don't modify status — let user decide)
        const timelineEntry = `| ${timestamp} | INTERRUPTED | session-failure:${errorType} | — | — | ${getRecoveryAction(errorType)} |`;
        if (content.includes('## Timeline')) {
          content = content.replace(/(## Timeline\n[\s\S]*?)(\n## |\n$|$)/, (m, before, after) => {
            return before + '\n' + timelineEntry + after;
          });
          // Atomic write: write to temp, then rename
          const tmpPath = taskPath + '.tmp';
          fs.writeFileSync(tmpPath, content);
          fs.renameSync(tmpPath, taskPath);
        }

        // Update the changes log
        const changesLogPath = taskPath.replace(/\.md$/, '_changes.log');
        fs.appendFileSync(changesLogPath, `| ${timestamp} | SESSION_FAILURE | ${errorType}: ${getRecoveryAction(errorType)} |\n`);

        // Save comprehensive recovery manifest
        const snapshotDir = path.join(reportsDir, 'executions');
        if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });

        const manifest = {
          event: 'session_failure',
          timestamp,
          session_id: sessionId,
          task_id: id.trim(),
          status_at_failure: status.trim(),
          error_type: errorType,
          recovery_action: getRecoveryAction(errorType),
          preserved: {
            loop_state: loopState,
            last_handoff: lastHandoff,
            full_handoff_block: (() => {
              const blocks = content.match(/```[\s\S]*?HANDOFF:[\s\S]*?```/g);
              return blocks ? blocks[blocks.length - 1].replace(/```/g, '').trim() : null;
            })(),
            next_agent_needs: (() => {
              const m = content.match(/next_agent_needs:\s*([\s\S]*?)(?=\n\s{2,}\w+:|\n```|$)/);
              return m ? m[1].trim() : null;
            })(),
            decisions_made: (() => {
              const m = content.match(/## (?:Key )?Decisions\n([\s\S]*?)(?=\n##|$)/);
              return m ? m[1].trim().split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim()).join('; ') : null;
            })(),
            open_bugs: (content.match(/BUG-\S+\s*\(P[0-4]\)/g) || []).join(', ') || null,
            blocked: /blocked:\s*Y/i.test(content)
          },
          task_file: `.claude/tasks/${tf}`,
          changes_log: fs.existsSync(changesLogPath) ? `.claude/tasks/${tf.replace('.md', '_changes.log')}` : null
        };

        const manifestPath = path.join(snapshotDir, `${id.trim()}_interrupted_${Date.now()}.json`);
        const tmpManifest = manifestPath + '.tmp';
        fs.writeFileSync(tmpManifest, JSON.stringify(manifest, null, 2));
        fs.renameSync(tmpManifest, manifestPath);

        console.log(`\nSESSION FAILURE: ${errorType}`);
        console.log(`TASK ${id.trim()} state preserved at ${status.trim()}`);
        if (loopState) console.log(`LOOPS: ${loopState}`);
        console.log(`Recovery: ${getRecoveryAction(errorType)}`);
        console.log(`Manifest: ${manifestPath}`);
        break;
      }
    }
  } catch (e) {
    logHookFailure('stop-failure-handler', e.message);
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
