#!/usr/bin/env node
// PostCompact hook: re-inject critical workflow state after context compaction
// Compaction can lose loop counters, phase state, and active handoffs — this restores them
// Now consumes pre-compact snapshots for richer recovery context

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

const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
const executionsDir = path.join(_projectRoot, '.claude', 'reports', 'executions');
if (!fs.existsSync(tasksDir)) process.exit(0);

const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
for (const file of files) {
  const filePath = path.join(tasksDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Only process active tasks
    if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING)/.test(content)) {
      continue;
    }

    const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
    const title = (content.match(/^title:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
    const status = (content.match(/^status:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
    const assignedTo = (content.match(/^assigned-to:\s*(.+)$/m) || [])[1] || 'unassigned';
    const phase = (content.match(/^phase:\s*(.+)$/m) || [])[1] || 'unknown';

    // Try to load pre-compact snapshot for richer context
    let snapshot = null;
    if (fs.existsSync(executionsDir)) {
      const snapshots = fs.readdirSync(executionsDir)
        .filter(f => f.startsWith(id.trim() + '_precompact_') && f.endsWith('.json'))
        .sort()
        .reverse();
      if (snapshots.length > 0) {
        try {
          snapshot = JSON.parse(fs.readFileSync(path.join(executionsDir, snapshots[0]), 'utf-8'));
        } catch (_) { /* ignore parse errors */ }
      }
    }

    console.log('');
    console.log('=== CONTEXT RECOVERY (post-compaction) ===');
    console.log(`ACTIVE TASK: ${id} — ${title.trim()}`);
    console.log(`STATUS: ${status.trim()} | PHASE: ${phase.trim()} | ASSIGNED: ${assignedTo.trim()}`);

    // Extract and re-inject loop state (prefer snapshot, fall back to task file)
    const loopSection = content.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
    if (loopSection) {
      console.log('');
      console.log('LOOP STATE (preserved):');
      const lines = loopSection[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
      for (const line of lines) {
        console.log(`  ${line.trim()}`);
      }
    }

    // Extract last handoff with next_agent_needs
    const handoffLines = content.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
    if (handoffLines && handoffLines.length > 0) {
      const lastHandoff = handoffLines[handoffLines.length - 1];
      console.log('');
      console.log(`LAST HANDOFF: ${lastHandoff.trim()}`);
    }

    // Extract the last HANDOFF block's next_agent_needs
    const needsMatch = content.match(/next_agent_needs:\s*\|?\n([\s\S]*?)(?=\n\s*iteration:|HANDOFF:|$)/);
    if (needsMatch) {
      console.log('');
      console.log('NEXT ACTION NEEDED:');
      console.log(`  ${needsMatch[1].trim().split('\n').map(l => l.trim()).join('\n  ')}`);
    }

    // Extract blockers
    if (/blocked:\s*Y/i.test(content)) {
      const blockerMatch = content.match(/BLOCKER:\s*(.+)/i);
      console.log('');
      console.log(`BLOCKER: ${blockerMatch ? blockerMatch[1].trim() : 'See task file for details'}`);
    }

    // Extract open bugs
    const bugMatches = content.match(/BUG-\S+\s*\(P[0-4]\)/g);
    if (bugMatches) {
      console.log('');
      console.log(`OPEN BUGS: ${bugMatches.join(', ')}`);
    }

    // Provide actionable next step based on phase
    console.log('');
    console.log('RESUME ACTION:');
    console.log(`  Read .claude/tasks/${file} then continue Phase ${phase.trim()} for ${assignedTo.trim()}`);
    if (snapshot && snapshot.preserved && snapshot.preserved.loop_state) {
      console.log(`  Pre-compact snapshot available at .claude/reports/executions/`);
    }

    console.log('');
    console.log(`Full state: .claude/tasks/${file}`);
    // Clear stale caches
    const cacheFiles = [
      path.join('.claude', 'reports', 'context-state.json'),
      path.join('.claude', 'reports', 'tool-failures.json')
    ];
    for (const cacheFile of cacheFiles) {
      try {
        if (fs.existsSync(cacheFile)) {
          fs.unlinkSync(cacheFile);
          process.stderr.write(`  Cleared stale cache: ${cacheFile}\n`);
        }
      } catch (e) { /* ignore */ }
    }

    console.log('=== END RECOVERY ===');
    break; // Only show the first active task
  } catch (e) {
    // Skip unreadable task files
    continue;
  }
}
