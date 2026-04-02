#!/usr/bin/env node
// pre-compact-archive.js — Pre-compact hook (migrated from pre-compact-archive.sh)
// Snapshots MEMORY.md + TASK_REGISTRY.md before context compaction
// This preserves state that pre-compact.js (transcript archiver) does NOT cover

const fs = require('fs');
const path = require('path');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const MEMORY = path.join(projectRoot, 'MEMORY.md');
const TODO = path.join(projectRoot, 'TODO.md');
const REGISTRY = path.join(projectRoot, '.claude', 'project', 'TASK_REGISTRY.md');
const ARCHIVE_DIR = path.join(projectRoot, 'logs', 'registry-snapshots');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Ensure archive directory exists
try {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
} catch (e) { /* may exist */ }

const archived = [];

// Snapshot MEMORY.md
if (fs.existsSync(MEMORY)) {
  const dest = path.join(ARCHIVE_DIR, `MEMORY-${TIMESTAMP}.md`);
  try {
    fs.copyFileSync(MEMORY, dest);
    archived.push(`MEMORY.md → ${path.relative(projectRoot, dest)}`);
  } catch (e) { /* best effort */ }
}

// Snapshot TODO.md
if (fs.existsSync(TODO)) {
  const dest = path.join(ARCHIVE_DIR, `TODO-${TIMESTAMP}.md`);
  try {
    fs.copyFileSync(TODO, dest);
    archived.push(`TODO.md → ${path.relative(projectRoot, dest)}`);
  } catch (e) { /* best effort */ }
}

// Snapshot TASK_REGISTRY.md
if (fs.existsSync(REGISTRY)) {
  const dest = path.join(ARCHIVE_DIR, `TASK_REGISTRY-${TIMESTAMP}.md`);
  try {
    fs.copyFileSync(REGISTRY, dest);
    archived.push(`TASK_REGISTRY.md → ${path.relative(projectRoot, dest)}`);
  } catch (e) { /* best effort */ }
}

// Snapshot active task's Loop State (critical for workflow continuity)
const tasksDir = path.join(projectRoot, '.claude', 'tasks');
if (fs.existsSync(tasksDir)) {
  try {
    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf8');
      // Only snapshot tasks with active loop state
      if (content.includes('## Loop State') || content.includes('DEVELOPING') || content.includes('DEV_TESTING') || content.includes('REVIEWING') || content.includes('QA_TESTING')) {
        const taskId = tf.replace('.md', '');
        const snapshotDir = path.join(projectRoot, '.claude', 'reports', 'executions');
        try { fs.mkdirSync(snapshotDir, { recursive: true }); } catch (e) { /* exists */ }
        const snapshot = {
          task_id: taskId,
          timestamp: new Date().toISOString(),
          type: 'precompact',
          loop_state: null,
          loop_counters: {},
          bugs: [],
          phase: null,
          handoff: null,
          circuit_breaker: false
        };
        // Extract Loop State section (fix: use $ instead of \Z for JS regex)
        const loopMatch = content.match(/## Loop State\n([\s\S]*?)(?=\n## |\n---|$)/);
        if (loopMatch) {
          snapshot.loop_state = loopMatch[1].trim();

          // Parse individual loop counters into structured fields
          const counterPatterns = [
            { key: 'dev_test', pattern: /dev-test-loop:\s*iteration\s*(\d+)\/(\d+)/ },
            { key: 'review', pattern: /review-loop:\s*iteration\s*(\d+)\/(\d+)/ },
            { key: 'ci_fix', pattern: /ci-fix-loop:\s*iteration\s*(\d+)\/(\d+)/ },
            { key: 'signoff', pattern: /signoff-rejection-cycle:\s*(\d+)\/(\d+)/ },
            { key: 'deploy', pattern: /deploy-loop:\s*iteration\s*(\d+)\/(\d+)/ },
            { key: 'qa_total', pattern: /total-fix-attempts:\s*(\d+)\/(\d+)/ },
          ];
          for (const { key, pattern } of counterPatterns) {
            const m = snapshot.loop_state.match(pattern);
            if (m) snapshot.loop_counters[key] = { current: parseInt(m[1]), max: parseInt(m[2]) };
          }

          // Parse per-bug QA counters (nested indented lines)
          const bugPattern = /BUG-[\w-]+\s*\(P\d\):\s*iteration\s*(\d+)\/(\d+)\s*—\s*\[(\w+)]/g;
          let bugMatch;
          while ((bugMatch = bugPattern.exec(snapshot.loop_state)) !== null) {
            snapshot.bugs.push({
              id: bugMatch[0].match(/BUG-[\w-]+/)[0],
              severity: bugMatch[0].match(/P\d/)[0],
              iteration: parseInt(bugMatch[1]),
              max: parseInt(bugMatch[2]),
              status: bugMatch[3]
            });
          }

          // Detect circuit breaker state
          snapshot.circuit_breaker = /circuit-breaker:\s*true/i.test(snapshot.loop_state);
        }
        // Extract current phase
        const phaseMatch = content.match(/phase:\s*(\S+)/i) || content.match(/status:\s*(\S+)/i);
        if (phaseMatch) snapshot.phase = phaseMatch[1];
        // Extract last HANDOFF block (fix: use $ instead of \Z)
        const handoffMatch = content.match(/HANDOFF:\n([\s\S]*?)(?=```|\n## |$)/);
        if (handoffMatch) snapshot.handoff = handoffMatch[1].trim().slice(0, 500);

        const dest = path.join(snapshotDir, `${taskId}_precompact_${TIMESTAMP}.json`);
        fs.writeFileSync(dest, JSON.stringify(snapshot, null, 2));
        archived.push(`${taskId} loop state → ${path.relative(projectRoot, dest)}`);
      }
    }
  } catch (e) { /* best effort */ }
}

if (archived.length > 0) {
  process.stderr.write(`Pre-compact archive: ${archived.join(', ')}\n`);
}

// Prune old snapshots — keep last 20 of each type
for (const prefix of ['MEMORY-', 'TODO-', 'TASK_REGISTRY-']) {
  try {
    const files = fs.readdirSync(ARCHIVE_DIR)
      .filter(f => f.startsWith(prefix))
      .sort()
      .reverse();
    for (const old of files.slice(20)) {
      fs.unlinkSync(path.join(ARCHIVE_DIR, old));
    }
  } catch (e) { /* best effort */ }
}

// Never block compaction
process.exit(0);
