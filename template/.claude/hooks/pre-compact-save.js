#!/usr/bin/env node
// PreCompact hook: save critical state BEFORE compaction destroys conversation history
// Fires at ~95% context — this is our last chance to preserve state

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

// Parse stdin for session_id
let _stdinBuf = '';
let _sessionId = 'unknown';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { _stdinBuf += chunk; });
process.stdin.on('error', () => {});
process.stdin.on('end', () => { try { _sessionId = JSON.parse(_stdinBuf).session_id || 'unknown'; } catch (_) {} });
setTimeout(() => process.exit(0), 5000).unref();

const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
}

if (!fs.existsSync(tasksDir)) process.exit(0);

const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
let saved = false;

for (const file of files) {
  const filePath = path.join(tasksDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING)/.test(content)) {
      continue;
    }

    const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
    const title = (content.match(/^title:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
    const status = (content.match(/^status:\s*(.+)$/m) || [])[1] || 'UNKNOWN';

    // Save pre-compaction state snapshot
    const snapshotDir = path.join(reportsDir, 'executions');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    // Extract full HANDOFF block (not just regex table line)
    const fullHandoff = extractFullHandoff(content);

    const snapshot = {
      event: 'pre-compaction',
      timestamp: new Date().toISOString(),
      session_id: _sessionId,
      task_id: id.trim(),
      title: title.trim(),
      status: status.trim(),
      branch: (() => { try { return execSync('git branch --show-current', { cwd: _projectRoot, encoding: 'utf8', timeout: 2000 }).trim(); } catch (_) { return 'unknown'; } })(),
      uncommitted_changes: (() => { try { return execSync('git diff --stat', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim(); } catch (_) { return ''; } })(),
      reason: 'Context approaching 95% — auto-compaction imminent',
      preserved: {
        loop_state: extractSection(content, 'Loop State'),
        last_handoff: extractLastHandoff(content),
        full_handoff_block: fullHandoff,
        next_agent_needs: extractNextAgentNeeds(content),
        memory_update: extractMemoryUpdate(content),
        open_bugs: extractBugs(content),
        blocked: /blocked:\s*Y/i.test(content),
        decisions_made: extractSection(content, 'Decisions') || extractSection(content, 'Key Decisions')
      }
    };

    // Auto-persist memory_update to MEMORY.md before compaction
    if (snapshot.preserved.memory_update) {
      try {
        const memPath = path.join(_projectRoot, 'MEMORY.md');
        const memEntry = `\n## ${snapshot.task_id} — ${new Date().toISOString().split('T')[0]} (session: ${_sessionId})\n${snapshot.preserved.memory_update}\n`;
        fs.appendFileSync(memPath, memEntry);
      } catch (_) { /* best-effort */ }
    }

    const snapshotPath = path.join(snapshotDir, `${id.trim()}_precompact_${Date.now()}.json`);
    const tmpSnapshot = snapshotPath + '.tmp';
    fs.writeFileSync(tmpSnapshot, JSON.stringify(snapshot, null, 2));
    fs.renameSync(tmpSnapshot, snapshotPath);

    // Output critical context for the compaction to preserve
    console.log('');
    console.log('WARNING: Context at ~95% — compaction starting.');
    console.log(`TASK: ${id.trim()} — ${title.trim()} [${status.trim()}]`);

    if (snapshot.preserved.loop_state) {
      console.log(`LOOPS: ${snapshot.preserved.loop_state}`);
    }
    if (snapshot.preserved.open_bugs) {
      console.log(`BUGS: ${snapshot.preserved.open_bugs}`);
    }

    console.log('State snapshot saved. PostCompact will re-inject critical state.');
    console.log('');
    console.log('COMPACTION GUIDANCE: Focus on preserving the current phase instructions.');
    console.log('Discard: file contents already read, intermediate exploration results.');
    console.log('Preserve: task requirements, active phase, loop state, pending decisions.');

    saved = true;
    break;
  } catch (e) {
    logHookFailure('pre-compact-save', `Task ${file}: ${e.message}`);
    continue;
  }
}

if (!saved) {
  console.log('Context compaction starting. No active task to preserve.');
}

function extractSection(content, header) {
  const match = content.match(new RegExp(`## ${header}\\n([\\s\\S]*?)(?=\\n##|$)`));
  if (!match) return null;
  return match[1].trim().split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim()).join('; ');
}

function extractLastHandoff(content) {
  const lines = content.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
  return lines ? lines[lines.length - 1].trim() : null;
}

function extractBugs(content) {
  const bugs = content.match(/BUG-\S+\s*\(P[0-4]\)/g);
  return bugs ? bugs.join(', ') : null;
}

function extractFullHandoff(content) {
  // Extract the last complete HANDOFF: block (between ``` markers)
  const blocks = content.match(/```[\s\S]*?HANDOFF:[\s\S]*?```/g);
  if (!blocks) return null;
  return blocks[blocks.length - 1].replace(/```/g, '').trim();
}

function extractNextAgentNeeds(content) {
  const match = content.match(/next_agent_needs:\s*(.*?)(?:\n\s{2,}\S|\n\s*\w+:|\n```|$)/s);
  return match ? match[1].trim() : null;
}

function extractMemoryUpdate(content) {
  const match = content.match(/memory_update:\s*\n([\s\S]*?)(?=\n\s{2}\w+:|\n```|$)/);
  if (!match) return null;
  return match[1].split('\n').map(l => l.trim()).filter(l => l).join('\n');
}

process.exit(0);
