#!/usr/bin/env node
// Stop hook: collect execution metadata and prompt for execution report generation
// Now: richer state for disaster recovery, hook failure logging, session chain tracking

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

// Drain stdin so hook never hangs if data is piped
process.stdin.resume();
process.stdin.on('data', () => {});
process.stdin.on('error', () => {});
setTimeout(() => process.exit(0), 5000).unref();

const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
}

const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
const execDir = path.join(reportsDir, 'executions');

try {
  // Ensure reports directory exists
  if (!fs.existsSync(execDir)) fs.mkdirSync(execDir, { recursive: true });

  // Find active task
  let activeTask = null;
  let activeTaskPath = null;

  if (fs.existsSync(tasksDir)) {
    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf-8');
      if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING)/.test(content)) {
        activeTask = content;
        activeTaskPath = taskPath;
        break;
      }
    }
  }

  if (!activeTask) {
    const snapshot = { timestamp: new Date().toISOString(), task: 'none', status: 'no active task found' };
    console.log(`EXECUTION SNAPSHOT: ${JSON.stringify(snapshot)}`);
    process.exit(0);
  }

  // Extract task metadata
  const taskId = (activeTask.match(/^id:\s*(.+)$/m) || [])[1]?.trim() || 'UNKNOWN';
  const taskTitle = (activeTask.match(/^title:\s*(.+)$/m) || [])[1]?.trim() || 'UNKNOWN';
  const taskStatus = (activeTask.match(/^status:\s*(.+)$/m) || [])[1]?.trim() || 'UNKNOWN';
  const phase = (activeTask.match(/^phase:\s*(.+)$/m) || [])[1]?.trim() || 'unknown';
  const assignedTo = (activeTask.match(/^assigned-to:\s*(.+)$/m) || [])[1]?.trim() || 'unassigned';

  // Count handoffs
  const handoffMatches = activeTask.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
  const handoffCount = handoffMatches ? handoffMatches.length : 0;

  // Count loop iterations
  const devTestLoop = activeTask.match(/dev-test-loop:\s*iteration\s*(\d+)/);
  const reviewLoop = activeTask.match(/review-loop:\s*iteration\s*(\d+)/);
  const qaBugLoop = activeTask.match(/qa-bug-loop:\s*iteration\s*(\d+)/);
  const ciFixLoop = activeTask.match(/ci-fix-loop:\s*iteration\s*(\d+)/);
  const deployLoop = activeTask.match(/deploy-loop:\s*iteration\s*(\d+)/);
  const signoffCycle = activeTask.match(/signoff-rejection-cycle:\s*(\d+)/);

  // Count agents
  const agentMentions = activeTask.match(/@[\w-]+/g) || [];
  const agentCounts = {};
  for (const agent of agentMentions) agentCounts[agent] = (agentCounts[agent] || 0) + 1;

  // Read changes log
  const changesLogPath = activeTaskPath.replace(/\.md$/, '_changes.log');
  let filesChanged = 0;
  let toolFailures = 0;
  let agentTimeouts = 0;
  let sessionFailures = 0;

  if (fs.existsSync(changesLogPath)) {
    const changesLog = fs.readFileSync(changesLogPath, 'utf-8');
    const lines = changesLog.split('\n').filter(l => l.trim());
    filesChanged = lines.filter(l => l.includes('file_changed')).length;
    toolFailures = lines.filter(l => l.includes('TOOL_FAILURE')).length;
    agentTimeouts = lines.filter(l => l.includes('AGENT_TIMEOUT')).length;
    sessionFailures = lines.filter(l => l.includes('SESSION_FAILURE')).length;
  }

  // Extract loop state for recovery
  const loopSection = activeTask.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
  const loopState = loopSection ? loopSection[1].trim().split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim()).join('; ') : null;

  // Build comprehensive snapshot (serves as disaster recovery manifest)
  const snapshot = {
    timestamp: new Date().toISOString(),
    event: 'session_stop',
    task_id: taskId,
    title: taskTitle,
    status: taskStatus,
    phase,
    assigned_to: assignedTo,
    agents_used: Object.keys(agentCounts).length,
    agent_breakdown: agentCounts,
    handoffs: handoffCount,
    loops: {
      dev_test: devTestLoop ? parseInt(devTestLoop[1]) : 0,
      review: reviewLoop ? parseInt(reviewLoop[1]) : 0,
      qa_bug: qaBugLoop ? parseInt(qaBugLoop[1]) : 0,
      ci_fix: ciFixLoop ? parseInt(ciFixLoop[1]) : 0,
      deploy: deployLoop ? parseInt(deployLoop[1]) : 0,
      signoff_cycle: signoffCycle ? parseInt(signoffCycle[1]) : 0
    },
    loop_state_raw: loopState,
    files_changed: filesChanged,
    resilience: {
      tool_failures: toolFailures,
      agent_timeouts: agentTimeouts,
      session_failures: sessionFailures
    },
    recovery: {
      task_file: `.claude/tasks/${path.basename(activeTaskPath)}`,
      changes_log: fs.existsSync(changesLogPath) ? changesLogPath : null,
      resume_command: `/workflow resume ${taskId}`
    }
  };

  // Save execution snapshot
  const snapshotPath = path.join(execDir, `${taskId}_snapshot_${Date.now()}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  // Output summary
  console.log(`\nEXECUTION SNAPSHOT for ${taskId}: ${taskTitle}`);
  console.log(`  Status: ${taskStatus} | Phase: ${phase} | Assigned: ${assignedTo}`);
  console.log(`  Agents: ${Object.keys(agentCounts).length} | Handoffs: ${handoffCount} | Files: ${filesChanged}`);
  console.log(`  Loops: dev-test=${snapshot.loops.dev_test}, review=${snapshot.loops.review}, qa-bug=${snapshot.loops.qa_bug}`);
  if (toolFailures || agentTimeouts || sessionFailures) {
    console.log(`  Issues: ${toolFailures} tool failures, ${agentTimeouts} agent timeouts, ${sessionFailures} session failures`);
  }
  // Token and context metrics
  try {
    const ctxPath = path.join('.claude', 'reports', 'context-state.json');
    if (fs.existsSync(ctxPath)) {
      const ctxData = JSON.parse(fs.readFileSync(ctxPath, 'utf8'));
      process.stderr.write(`  Tokens used: ${ctxData.total_tokens || 'N/A'}\n`);
      process.stderr.write(`  Context usage: ${ctxData.estimated_pct || 'N/A'}%\n`);
    }
  } catch (e) { /* ignore */ }

  console.log(`  Resume: /workflow resume ${taskId}`);

} catch (err) {
  logHookFailure('execution-report', err.message);
  console.log(`EXECUTION REPORT HOOK: non-fatal error — ${err.message}`);
}

process.exit(0);
