#!/usr/bin/env node
// stop-registry-snapshot.js — Stop hook (migrated from stop-memory-write.sh)
// Tracks open story count from TASK_REGISTRY + writes session summary to MEMORY.md
// This supplements stop.js which only tracks Last Completed / Next Step

const fs = require('fs');
const path = require('path');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const MEMORY = path.join(projectRoot, 'MEMORY.md');
const REGISTRY = path.join(projectRoot, '.claude', 'project', 'TASK_REGISTRY.md');
const TIMESTAMP = new Date().toISOString().replace(/\.\d{3}Z/, 'Z');

if (!fs.existsSync(MEMORY)) {
  process.exit(0);
}

// Find current IN_PROGRESS task from TASK_REGISTRY
let currentTask = 'None';
let openStories = 0;
let todoCount = 0;
let blockedCount = 0;

if (fs.existsSync(REGISTRY)) {
  try {
    const content = fs.readFileSync(REGISTRY, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Only count rows that look like task/story entries (have STORY-/TASK- ID)
      const isTaskRow = /\|\s*(STORY|TASK)-\d+\s*\|/.test(line);
      if (!isTaskRow) continue;

      if (line.includes('IN_PROGRESS')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          currentTask = `${parts[0]} — ${parts[2]}`;
        }
        openStories++;
      } else if (line.includes('TODO')) {
        todoCount++;
        openStories++;
      } else if (line.includes('BLOCKED')) {
        blockedCount++;
        openStories++;
      }
    }
  } catch (e) { /* best effort */ }
}

// Append registry summary to MEMORY.md (stop.js handles Last Completed / Next Step)
try {
  const memContent = fs.readFileSync(MEMORY, 'utf8');

  // Only update if there's a registry section or add one
  const registrySummary = [
    `## Registry Status (${TIMESTAMP})`,
    `- In Progress: ${currentTask}`,
    `- Open stories: ${openStories} (TODO: ${todoCount}, IN_PROGRESS: ${openStories - todoCount - blockedCount}, BLOCKED: ${blockedCount})`,
  ].join('\n');

  // Replace existing Registry Status section or append
  if (memContent.includes('## Registry Status')) {
    const updated = memContent.replace(
      /## Registry Status[^\n]*\n(?:- [^\n]*\n)*/,
      registrySummary + '\n'
    );
    fs.writeFileSync(MEMORY, updated);
  } else {
    fs.appendFileSync(MEMORY, '\n' + registrySummary + '\n');
  }

  process.stderr.write(`Session state: ${currentTask} | ${openStories} open stories\n`);
} catch (e) { /* best effort */ }

process.exit(0);
