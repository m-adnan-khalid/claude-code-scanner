#!/usr/bin/env node
// Re-inject critical context on session start, resume, and after compaction
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

// --- Check new project pre-dev status ---
const projectMd = path.join(_projectRoot, '.claude', 'project', 'PROJECT.md');
if (fs.existsSync(projectMd)) {
  const projectContent = fs.readFileSync(projectMd, 'utf-8');
  const statusMatch = projectContent.match(/^## Status:\s*(.+)$/m);
  if (statusMatch) {
    const status = statusMatch[1].trim();
    const activeStates = ['IDEATING', 'SPECIFYING', 'MAPPING', 'MODELING', 'SELECTING', 'ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING'];
    if (activeStates.includes(status)) {
      // Count completed phases
      const phaseRows = projectContent.match(/\| \d[b]?\s*\|[^|]+\|\s*[^|]+\|\s*(COMPLETE|PENDING|SKIPPED)/g) || [];
      const completed = phaseRows.filter(r => r.includes('COMPLETE')).length;
      const total = phaseRows.length;
      console.log(`NEW PROJECT IN PROGRESS: Phase "${status}" | ${completed}/${total} phases complete`);
      console.log('Continue with: /new-project --resume');
    } else if (status === 'READY_FOR_DEV') {
      // Check if there are MVP features to build
      const backlogPath = path.join(_projectRoot, '.claude', 'project', 'BACKLOG.md');
      if (fs.existsSync(backlogPath)) {
        const backlog = fs.readFileSync(backlogPath, 'utf-8');
        const pendingFeatures = (backlog.match(/\| PENDING \|/g) || []).length;
        if (pendingFeatures > 0) {
          console.log(`PROJECT READY: ${pendingFeatures} MVP features pending. Start with: /workflow new "feature"`);
        }
      }
    }
  }
}

const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
if (!fs.existsSync(tasksDir)) process.exit(0);

// Single-pass task scan — read each file ONCE, classify by status
const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
let activeFound = false;

for (const file of files) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const statusMatch = content.match(/^status:\s*(.+)$/m);
  if (!statusMatch) continue;
  const status = statusMatch[1].trim();

  const idMatch = content.match(/^id:\s*(.+)$/m);
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  const id = idMatch ? idMatch[1].trim() : file;
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  // Active task
  if (!activeFound && /DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING/.test(status)) {
    console.log(`ACTIVE TASK: ${title} | STATUS: ${status}`);
    console.log('Check .claude/tasks/ for full details.');
    activeFound = true;
  }

  // On-hold task
  if (status === 'ON_HOLD') {
    const updatedMatch = content.match(/^updated:\s*(.+)$/m);
    let daysOnHold = 0;
    if (updatedMatch) {
      daysOnHold = Math.floor((Date.now() - new Date(updatedMatch[1].trim()).getTime()) / (1000 * 60 * 60 * 24));
    }
    if (daysOnHold > 30) {
      console.log(`WARNING: ${id} "${title}" ON_HOLD for ${daysOnHold} days. Consider: /workflow cancel ${id}`);
    } else if (daysOnHold > 7) {
      console.log(`REMINDER: ${id} "${title}" ON_HOLD (${daysOnHold} days). Resume: /workflow resume ${id}`);
    }
  }

  // Blocked task (only show if no active task found)
  if (!activeFound && status === 'BLOCKED') {
    console.log(`BLOCKED: ${id} "${title}". Check blockers in task file.`);
  }
}

process.exit(0);
