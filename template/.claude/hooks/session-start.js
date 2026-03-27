#!/usr/bin/env node
// Re-inject critical context on session start, resume, and after compaction
const fs = require('fs');
const path = require('path');

// --- Check new project pre-dev status ---
const projectMd = path.join(process.cwd(), '.claude', 'project', 'PROJECT.md');
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
      const backlogPath = path.join(process.cwd(), '.claude', 'project', 'BACKLOG.md');
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

const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
if (!fs.existsSync(tasksDir)) process.exit(0);

const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
let activeFound = false;

for (const file of files) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Show active tasks
  if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING)/.test(content)) {
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const statusMatch = content.match(/^status:\s*(.+)$/m);
    if (titleMatch && statusMatch) {
      console.log(`ACTIVE TASK: ${titleMatch[1].trim()} | STATUS: ${statusMatch[1].trim()}`);
      console.log('Check .claude/tasks/ for full details.');
      activeFound = true;
    }
    break;
  }
}

// Warn about ON_HOLD tasks
for (const file of files) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  if (/status:\s*ON_HOLD/.test(content)) {
    const idMatch = content.match(/^id:\s*(.+)$/m);
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const updatedMatch = content.match(/^updated:\s*(.+)$/m);

    if (idMatch && titleMatch) {
      const id = idMatch[1].trim();
      const title = titleMatch[1].trim();

      // Check how long it's been on hold
      let daysOnHold = 0;
      if (updatedMatch) {
        const updated = new Date(updatedMatch[1].trim());
        daysOnHold = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (daysOnHold > 30) {
        console.log(`WARNING: ${id} "${title}" has been ON_HOLD for ${daysOnHold} days. Consider cancelling: /workflow cancel ${id}`);
      } else if (daysOnHold > 7) {
        console.log(`REMINDER: ${id} "${title}" is ON_HOLD (${daysOnHold} days). Resume: /workflow resume ${id}`);
      } else {
        console.log(`ON_HOLD: ${id} "${title}". Resume: /workflow resume ${id}`);
      }
    }
  }
}

if (!activeFound) {
  // Check for blocked tasks
  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (/status:\s*BLOCKED/.test(content)) {
      const idMatch = content.match(/^id:\s*(.+)$/m);
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      if (idMatch && titleMatch) {
        console.log(`BLOCKED: ${idMatch[1].trim()} "${titleMatch[1].trim()}". Check blockers in task file.`);
      }
    }
  }
}

process.exit(0);
