#!/usr/bin/env node

/**
 * stop.js — Stop hook
 * Fires BEFORE session closes.
 * Writes "Last Completed" and "Next Step" to MEMORY.md on exit.
 * Reads the latest git log and TODO.md to determine current state.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const root = findProjectRoot();
  const memoryPath = path.join(root, 'MEMORY.md');
  const todoPath = path.join(root, 'TODO.md');
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  // Get last git commit for "Last Completed"
  let lastCommit = 'unknown';
  try {
    lastCommit = execSync('git log --oneline -1', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {}

  // Get top TODO item for "Next Step"
  let nextStep = 'Check TODO.md for next task';
  if (fs.existsSync(todoPath)) {
    const todoContent = fs.readFileSync(todoPath, 'utf8');
    const match = todoContent.match(/- \[ \] (.+)/);
    if (match) nextStep = match[1];
  }

  // Update MEMORY.md — create with headers if missing
  let content = '';
  if (fs.existsSync(memoryPath)) {
    content = fs.readFileSync(memoryPath, 'utf8');
  }

  // Ensure headers exist before replacing
  if (!content.includes('## Last Completed')) {
    content += '\n\n## Last Completed\n(none)\n';
  }
  if (!content.includes('## Next Step')) {
    content += '\n\n## Next Step\n(none)\n';
  }

  // Update Last Completed
  content = content.replace(
    /## Last Completed\n.+/,
    `## Last Completed\n${now} — ${lastCommit}`
  );

  // Update Next Step
  content = content.replace(
    /## Next Step\n.+/,
    `## Next Step\n${nextStep}`
  );

  fs.writeFileSync(memoryPath, content);

  // Auto-advance TODO.md — mark matching items complete
  if (fs.existsSync(todoPath)) {
    let todoContent = fs.readFileSync(todoPath, 'utf8');
    const commitMsg = lastCommit.toLowerCase();
    // If the commit message contains words matching an active TODO, mark it done
    const todoLines = todoContent.split('\n');
    let changed = false;
    for (let i = 0; i < todoLines.length; i++) {
      const match = todoLines[i].match(/^- \[ \] (.+)/);
      if (match) {
        const item = match[1].toLowerCase();
        // Check if commit message words overlap with TODO item
        const itemWords = item.split(/\s+/).filter(w => w.length > 4);
        const commitWords = commitMsg.split(/\s+/).filter(w => w.length > 4);
        const overlap = itemWords.filter(w => commitWords.includes(w));
        if (overlap.length >= 2) {
          todoLines[i] = todoLines[i].replace('- [ ]', '- [x]');
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(todoPath, todoLines.join('\n'));
    }
  }

  // Capture active loop state to MEMORY.md (preserves counters across sessions)
  const tasksDir = path.join(root, '.claude', 'tasks');
  if (fs.existsSync(tasksDir)) {
    try {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskContent = fs.readFileSync(path.join(tasksDir, tf), 'utf8');
        if (/DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING/.test(taskContent)) {
          const loopMatch = taskContent.match(/## Loop State\n([\s\S]*?)(?=\n## |\n$|$)/);
          if (loopMatch) {
            const loopLines = loopMatch[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
            if (loopLines.length > 0) {
              // Add loop state to MEMORY.md
              const loopSummary = `## Active Loop State\n${loopLines.join('\n')}\n`;
              if (content.includes('## Active Loop State')) {
                content = content.replace(/## Active Loop State\n(?:- [^\n]*\n)*/, loopSummary);
              } else {
                content += '\n' + loopSummary;
              }
              fs.writeFileSync(memoryPath, content);
            }
          }
          break;
        }
      }
    } catch (e) { /* best effort */ }
  }

  // Log to branch-scoped audit log
  const role = getRole(root);
  const branch = getBranch(root);
  const auditDir = path.join(root, '.claude', 'reports', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });
  const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
  const isoNow = new Date().toISOString();
  fs.appendFileSync(
    path.join(auditDir, `audit-${safeBranch}.log`),
    `${isoNow}|${role}|${branch}|SESSION_STOP|Last: ${lastCommit}|ok|0ms\n`
  );

} catch (e) {
  // Never block session close
}

function getRole(root) {
  try {
    const envPath = path.join(root, '.claude', 'session.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^CURRENT_ROLE=(.+)$/m);
      if (match) return match[1].trim();
    }
  } catch (_) {}
  return 'Unknown';
}

function getBranch(root) {
  try {
    return execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
  } catch (_) {
    return 'unknown';
  }
}

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
