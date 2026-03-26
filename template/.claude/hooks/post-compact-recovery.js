#!/usr/bin/env node
// PostCompact hook: re-inject critical workflow state after context compaction
// Compaction can lose loop counters, phase state, and active handoffs — this restores them

const fs = require('fs');
const path = require('path');

const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
if (!fs.existsSync(tasksDir)) process.exit(0);

const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
for (const file of files) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Only process active tasks
  if (!/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING)/.test(content)) {
    continue;
  }

  const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
  const title = (content.match(/^title:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
  const status = (content.match(/^status:\s*(.+)$/m) || [])[1] || 'UNKNOWN';
  const assignedTo = (content.match(/^assigned-to:\s*(.+)$/m) || [])[1] || 'unassigned';

  console.log('');
  console.log('=== CONTEXT RECOVERY (post-compaction) ===');
  console.log(`ACTIVE TASK: ${id} — ${title.trim()}`);
  console.log(`STATUS: ${status.trim()} | ASSIGNED: ${assignedTo.trim()}`);

  // Extract and re-inject loop state
  const loopSection = content.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
  if (loopSection) {
    console.log('');
    console.log('LOOP STATE (preserved):');
    const lines = loopSection[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
    for (const line of lines) {
      console.log(`  ${line.trim()}`);
    }
  }

  // Extract last handoff
  const handoffLines = content.match(/\| \d{4}-\d{2}-\d{2}T.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|/g);
  if (handoffLines && handoffLines.length > 0) {
    const lastHandoff = handoffLines[handoffLines.length - 1];
    console.log('');
    console.log(`LAST HANDOFF: ${lastHandoff.trim()}`);
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

  console.log('');
  console.log(`Full state: .claude/tasks/${file}`);
  console.log('=== END RECOVERY ===');
  break; // Only show the first active task
}
