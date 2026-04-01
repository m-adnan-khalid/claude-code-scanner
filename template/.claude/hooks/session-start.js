#!/usr/bin/env node
// Re-inject critical context on session start, resume, and after compaction
// Now includes: crash detection, orphaned state recovery, hook health check, state integrity
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
const hookFailLog = path.join(reportsDir, 'hook-failures.log');

// Shared hook failure logger — used by this hook and referenced pattern for all hooks
function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const ts = new Date().toISOString();
    fs.appendFileSync(hookFailLog, `| ${ts} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) { /* last resort — can't even log */ }
}

// --- 0. Role Check — warn if /setup-workspace hasn't been run ---
try {
  const sessionEnvPath = path.join(_projectRoot, '.claude', 'session.env');
  if (!fs.existsSync(sessionEnvPath)) {
    console.log('SETUP REQUIRED: No .claude/session.env found. Run /setup-workspace to set your role.');
    console.log('  Without a role, RBAC scope-guard and role-based features are disabled.');
  } else {
    const envContent = fs.readFileSync(sessionEnvPath, 'utf-8');
    const roleMatch = envContent.match(/^CURRENT_ROLE=(.+)$/m);
    if (roleMatch) {
      process.stderr.write(`Role: ${roleMatch[1].trim()}\n`);
    } else {
      console.log('SETUP REQUIRED: .claude/session.env exists but CURRENT_ROLE is not set. Run /setup-workspace.');
    }
  }
} catch (e) {
  logHookFailure('session-start:role-check', e.message);
}

// --- 1. Hook Health Check ---
try {
  const hooksDir = path.join(_projectRoot, '.claude', 'hooks');
  const settingsPath = path.join(_projectRoot, '.claude', 'settings.json');
  if (fs.existsSync(settingsPath) && fs.existsSync(hooksDir)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
    const registeredHooks = new Set();
    for (const [, entries] of Object.entries(settings.hooks || {})) {
      for (const entry of entries) {
        for (const h of (entry.hooks || [])) {
          const match = (h.command || '').match(/hooks\/(.+\.js)/);
          if (match) registeredHooks.add(match[1]);
        }
      }
    }
    const missing = [...registeredHooks].filter(h => !hookFiles.includes(h));
    if (missing.length > 0) {
      console.log(`HOOK HEALTH WARNING: ${missing.length} registered hook(s) missing: ${missing.join(', ')}`);
    }
    // Check for recent hook failures
    if (fs.existsSync(hookFailLog)) {
      const failLog = fs.readFileSync(hookFailLog, 'utf-8');
      const lines = failLog.trim().split('\n').filter(l => l.trim());
      const recent = lines.filter(l => {
        const ts = (l.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) || [''])[0];
        return ts && (Date.now() - new Date(ts).getTime()) < 24 * 60 * 60 * 1000;
      });
      if (recent.length > 0) {
        console.log(`HOOK FAILURES (last 24h): ${recent.length} failure(s). Check .claude/reports/hook-failures.log`);
      }
    }
  }
} catch (e) {
  logHookFailure('session-start:health-check', e.message);
}

// --- 1b. Read MEMORY.md and TODO.md for context injection ---
try {
  const memoryPath = path.join(_projectRoot, 'MEMORY.md');
  if (fs.existsSync(memoryPath)) {
    const memory = fs.readFileSync(memoryPath, 'utf8').trim();
    if (memory) {
      process.stderr.write(`\n📋 MEMORY.md:\n${memory.slice(0, 500)}\n`);
    }
  }

  const todoPath = path.join(_projectRoot, 'TODO.md');
  if (fs.existsSync(todoPath)) {
    const todo = fs.readFileSync(todoPath, 'utf8').trim();
    if (todo) {
      process.stderr.write(`\n📝 TODO.md:\n${todo.slice(0, 500)}\n`);
    }
  }
} catch (e) {
  logHookFailure('session-start:context-inject', e.message);
}

// --- 2. Check new project pre-dev status ---
try {
  const projectMd = path.join(_projectRoot, '.claude', 'project', 'PROJECT.md');
  if (fs.existsSync(projectMd)) {
    const projectContent = fs.readFileSync(projectMd, 'utf-8');
    const statusMatch = projectContent.match(/^## Status:\s*(.+)$/m);
    if (statusMatch) {
      const status = statusMatch[1].trim();
      const activeStates = ['IDEATING', 'SPECIFYING', 'MAPPING', 'MODELING', 'SELECTING', 'ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING'];
      if (activeStates.includes(status)) {
        const phaseRows = projectContent.match(/\| \d[b]?\s*\|[^|]+\|\s*[^|]+\|\s*(COMPLETE|PENDING|SKIPPED)/g) || [];
        const completed = phaseRows.filter(r => r.includes('COMPLETE')).length;
        const total = phaseRows.length;
        console.log(`NEW PROJECT IN PROGRESS: Phase "${status}" | ${completed}/${total} phases complete`);
        console.log('Continue with: /new-project --resume');
      } else if (status === 'READY_FOR_DEV') {
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
} catch (e) {
  logHookFailure('session-start:project-check', e.message);
}

// --- 3. Task scan with crash detection + orphaned state recovery ---
const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
if (!fs.existsSync(tasksDir)) process.exit(0);

try {
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

    // Active task — check for crash/stale state
    if (/DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING/.test(status)) {
      if (!activeFound) {
        console.log(`ACTIVE TASK: ${id} — ${title} | STATUS: ${status}`);

        // Crash detection: check last activity age
        const updatedMatch = content.match(/^updated:\s*(.+)$/m);
        const changesLogPath = filePath.replace(/\.md$/, '_changes.log');
        let lastActivity = null;

        if (fs.existsSync(changesLogPath)) {
          const log = fs.readFileSync(changesLogPath, 'utf-8');
          const timestamps = log.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g) || [];
          if (timestamps.length > 0) lastActivity = new Date(timestamps[timestamps.length - 1]);
        }
        if (!lastActivity && updatedMatch) lastActivity = new Date(updatedMatch[1].trim());

        if (lastActivity) {
          const hoursStale = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
          if (hoursStale > 6) {
            console.log(`CRASH DETECTED: ${id} has been ${status} for ${Math.round(hoursStale)}h with no activity.`);
            console.log('  This may indicate a session crash. Options:');
            console.log(`  1. Resume: /workflow resume ${id}`);
            console.log(`  2. Check state: /workflow status ${id}`);
            console.log(`  3. Cancel: /workflow cancel ${id}`);

            // Check for interrupted snapshots
            const execDir = path.join(reportsDir, 'executions');
            if (fs.existsSync(execDir)) {
              const interrupts = fs.readdirSync(execDir)
                .filter(f => f.startsWith(id) && f.includes('_interrupted_'));
              if (interrupts.length > 0) {
                console.log(`  Recovery snapshot found: .claude/reports/executions/${interrupts[interrupts.length - 1]}`);
              }
            }
          }
        }

        // Orphaned subtask detection
        const subtaskMatches = content.match(/\|\s*\d+\s*\|[^|]+\|\s*@[\w-]+\s*\|\s*IN_PROGRESS\s*\|/g) || [];
        if (subtaskMatches.length > 0) {
          console.log(`  STALE SUBTASKS: ${subtaskMatches.length} subtask(s) stuck in IN_PROGRESS`);
        }

        // Loop state display for quick context
        const loopSection = content.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
        if (loopSection) {
          const loops = loopSection[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
          if (loops.length > 0) {
            console.log(`  LOOPS: ${loops.map(l => l.trim().replace(/^-\s*/, '')).join(' | ')}`);
          }
        }

        // Dependency check
        const depMatch = content.match(/^depends-on:\s*(.+)$/m);
        if (depMatch) {
          const depId = depMatch[1].trim();
          const depFile = files.find(f => {
            const c = fs.readFileSync(path.join(tasksDir, f), 'utf-8');
            return c.includes(`id: ${depId}`);
          });
          if (depFile) {
            const depContent = fs.readFileSync(path.join(tasksDir, depFile), 'utf-8');
            const depStatus = (depContent.match(/^status:\s*(.+)$/m) || [])[1] || '';
            if (!/CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING|CLOSED/.test(depStatus.trim())) {
              console.log(`  BLOCKED: Depends on ${depId} which is still ${depStatus.trim()}`);
            }
          }
        }

        console.log(`  Full state: .claude/tasks/${file}`);
        activeFound = true;
      }
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

  // --- 4. State integrity check ---
  // Check for task files with inconsistent state
  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const statusMatch = content.match(/^status:\s*(.+)$/m);
    if (!statusMatch) continue;
    const status = statusMatch[1].trim();

    // Check: task in review but no reviewer assigned
    if (status === 'REVIEWING' && !/reviewer-1-status:\s*(APPROVE|REQUEST_CHANGES)/i.test(content)) {
      const id = (content.match(/^id:\s*(.+)$/m) || [])[1] || file;
      // Only warn if the loop state section exists but reviewers haven't started
      if (content.includes('## Loop State') && !content.includes('reviewer-1-status')) {
        console.log(`STATE WARNING: ${id} is REVIEWING but no reviewer has started. May need /workflow resume ${id}`);
      }
    }
  }
} catch (e) {
  logHookFailure('session-start:task-scan', e.message);
}

process.exit(0);
