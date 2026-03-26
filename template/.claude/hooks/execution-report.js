#!/usr/bin/env node
// Stop hook: collect execution metadata and prompt for execution report generation
// Runs on session Stop to capture final execution state

const fs = require('fs');
const path = require('path');

const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
const reportsDir = path.join(process.cwd(), '.claude', 'reports', 'executions');

// Find active task
let activeTask = null;
let activeTaskPath = null;

try {
// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

if (fs.existsSync(tasksDir)) {
  const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  for (const tf of taskFiles) {
    const taskPath = path.join(tasksDir, tf);
    const content = fs.readFileSync(taskPath, 'utf-8');
    if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
      activeTask = content;
      activeTaskPath = taskPath;
      break;
    }
  }
}

if (!activeTask) {
  // No active task — output minimal execution snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    task: 'none',
    status: 'no active task found'
  };
  console.log(`EXECUTION SNAPSHOT: ${JSON.stringify(snapshot)}`);
  process.exit(0);
}

// Extract task metadata
const idMatch = activeTask.match(/^id:\s*(.+)$/m);
const titleMatch = activeTask.match(/^title:\s*(.+)$/m);
const statusMatch = activeTask.match(/^status:\s*(.+)$/m);
const taskId = idMatch ? idMatch[1].trim() : 'UNKNOWN';
const taskTitle = titleMatch ? titleMatch[1].trim() : 'UNKNOWN';
const taskStatus = statusMatch ? statusMatch[1].trim() : 'UNKNOWN';

// Count handoffs from handoff log
const handoffMatches = activeTask.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
const handoffCount = handoffMatches ? handoffMatches.length : 0;

// Count loop iterations
const devTestLoop = activeTask.match(/dev-test-loop:\s*iteration\s*(\d+)/);
const reviewLoop = activeTask.match(/review-loop:\s*iteration\s*(\d+)/);
const qaBugLoop = activeTask.match(/qa-bug-loop:\s*iteration\s*(\d+)/);

// Count agents mentioned in handoff log
const agentMentions = activeTask.match(/@[\w-]+/g) || [];
const agentCounts = {};
for (const agent of agentMentions) {
  agentCounts[agent] = (agentCounts[agent] || 0) + 1;
}

// Read changes log
const changesLogPath = activeTaskPath.replace(/\.md$/, '_changes.log');
let filesChanged = 0;
let changesLog = '';
if (fs.existsSync(changesLogPath)) {
  changesLog = fs.readFileSync(changesLogPath, 'utf-8');
  filesChanged = changesLog.split('\n').filter(l => l.trim()).length;
}

// Build execution snapshot
const snapshot = {
  timestamp: new Date().toISOString(),
  task_id: taskId,
  title: taskTitle,
  status: taskStatus,
  agents_used: Object.keys(agentCounts).length,
  agent_breakdown: agentCounts,
  handoffs: handoffCount,
  loops: {
    dev_test: devTestLoop ? parseInt(devTestLoop[1]) : 0,
    review: reviewLoop ? parseInt(reviewLoop[1]) : 0,
    qa_bug: qaBugLoop ? parseInt(qaBugLoop[1]) : 0
  },
  files_changed: filesChanged
};

// Save execution snapshot
const snapshotPath = path.join(reportsDir, `${taskId}_snapshot_${Date.now()}.json`);
fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

// Output summary for the Stop prompt hook to consume
console.log(`\nEXECUTION SNAPSHOT for ${taskId}: ${taskTitle}`);
console.log(`  Status: ${taskStatus}`);
console.log(`  Agents used: ${Object.keys(agentCounts).length} (${Object.keys(agentCounts).join(', ')})`);
console.log(`  Handoffs: ${handoffCount}`);
console.log(`  Loops: dev-test=${snapshot.loops.dev_test}, review=${snapshot.loops.review}, qa-bug=${snapshot.loops.qa_bug}`);
console.log(`  Files changed: ${filesChanged}`);
console.log(`  Snapshot saved: ${snapshotPath}`);
console.log(`\nRun /execution-report ${taskId} for full analysis with success scoring, hallucination check, and regression impact.`);

} catch (err) {
  // Non-fatal — don't block session stop
  console.log(`EXECUTION REPORT HOOK: non-fatal error — ${err.message}`);
}

process.exit(0);
