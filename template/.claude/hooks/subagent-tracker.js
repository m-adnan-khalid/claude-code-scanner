#!/usr/bin/env node
// SubagentStop hook: track agent completion for execution metrics
// Now: detects maxTurns timeout, saves checkpoint, escalates when agent work is incomplete

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

// ── Processing logic ────────────────────────────────────────────────
function processInput(raw) {
  try {
    const data = JSON.parse(raw);
    const agentName = data.agent_name || data.name || 'unknown';
    const status = data.status || data.result || 'completed';
    const turns = data.turns_used || data.turns || 0;
    const maxTurns = data.max_turns || data.maxTurns || 0;
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Detect timeout: agent used all turns or status indicates truncation
    const isTimeout = (maxTurns > 0 && turns >= maxTurns) || status === 'max_turns_reached' || status === 'truncated';

    // Log to agent completions file
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const logPath = path.join(reportsDir, 'agent-completions.log');
    const statusLabel = isTimeout ? `TIMEOUT(${turns}/${maxTurns})` : `${status}(${turns} turns)`;
    const entry = `| ${timestamp} | ${agentName} | ${statusLabel} |\n`;
    fs.appendFileSync(logPath, entry);

    // Log to active task
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const content = fs.readFileSync(taskPath, 'utf-8');
        if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) continue;

        const taskLogPath = taskPath.replace(/\.md$/, '_changes.log');
        const eventType = isTimeout ? 'AGENT_TIMEOUT' : 'AGENT_COMPLETE';
        fs.appendFileSync(taskLogPath, `| ${timestamp} | ${eventType} | ${agentName}: ${statusLabel} |\n`);

        // On timeout: save agent checkpoint for recovery
        if (isTimeout) {
          const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
          const execDir = path.join(reportsDir, 'executions');
          if (!fs.existsSync(execDir)) fs.mkdirSync(execDir, { recursive: true });

          const checkpoint = {
            event: 'agent_timeout',
            timestamp,
            task_id: id.trim(),
            agent: agentName,
            turns_used: turns,
            max_turns: maxTurns,
            recovery: `Agent ${agentName} hit maxTurns (${turns}/${maxTurns}). ` +
              'This counts as +1 loop iteration. Re-invoke with narrowed scope or escalate.'
          };
          const cpPath = path.join(execDir, `${id.trim()}_agent_timeout_${Date.now()}.json`);
          fs.writeFileSync(cpPath, JSON.stringify(checkpoint, null, 2));

          // Warn user prominently
          console.log(`\nAGENT TIMEOUT: ${agentName} hit maxTurns (${turns}/${maxTurns})`);
          console.log(`Task: ${id.trim()} — work may be incomplete`);
          console.log('This counts as +1 loop iteration. Options:');
          console.log('  1. Re-invoke with narrower scope');
          console.log('  2. Continue to next phase (accept partial work)');
          console.log(`  3. Check output: .claude/reports/executions/${path.basename(cpPath)}`);
        } else {
          process.stderr.write(`Agent completed: ${agentName} — ${status} (${turns} turns)\n`);
        }
        break;
      }
    }

    if (!fs.existsSync(tasksDir)) {
      process.stderr.write(`Agent completed: ${agentName} — ${statusLabel}\n`);
    }
  } catch (e) {
    logHookFailure('subagent-tracker', e.message);
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
