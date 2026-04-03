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

// Parse stdin for session_id, then proceed
let _stdinData = '';
let _sessionId = 'unknown';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { _stdinData += chunk; });
process.stdin.on('error', () => {});
process.stdin.on('end', () => {
  try {
    const parsed = JSON.parse(_stdinData);
    _sessionId = parsed.session_id || 'unknown';
  } catch (_) {}
});
// Fallback timeout — proceed even if stdin doesn't close
setTimeout(() => {
  try {
    if (_stdinData && _sessionId === 'unknown') {
      const parsed = JSON.parse(_stdinData);
      _sessionId = parsed.session_id || 'unknown';
    }
  } catch (_) {}
}, 500);
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

// --- 0a. Session ID tracking — log and persist for cross-session continuity ---
setTimeout(() => {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const sessionLogPath = path.join(reportsDir, 'sessions.log');
    const ts = new Date().toISOString();
    const branch = (() => { try { return require('child_process').execSync('git branch --show-current', { cwd: _projectRoot, encoding: 'utf8', timeout: 2000 }).trim(); } catch (_) { return 'unknown'; } })();
    const entry = `| ${ts} | ${_sessionId} | ${branch} | start |\n`;
    fs.appendFileSync(sessionLogPath, entry);

    // Write current session ID to session.env for other hooks to read (create if missing)
    const sessionEnvPath = path.join(_projectRoot, '.claude', 'session.env');
    if (fs.existsSync(sessionEnvPath)) {
      let envContent = fs.readFileSync(sessionEnvPath, 'utf-8');
      if (envContent.includes('SESSION_ID=')) {
        envContent = envContent.replace(/^SESSION_ID=.*$/m, `SESSION_ID=${_sessionId}`);
      } else {
        envContent += `\nSESSION_ID=${_sessionId}\n`;
      }
      fs.writeFileSync(sessionEnvPath, envContent);
    } else {
      // Create session.env with session ID even without /setup-workspace
      try {
        fs.writeFileSync(sessionEnvPath, `CURRENT_ROLE=unset\nSESSION_ID=${_sessionId}\n`);
      } catch (_) {}
    }

    console.log(`SESSION: ${_sessionId} | Branch: ${branch}`);
  } catch (_) {}
}, 600); // Wait for stdin parse to complete

// --- 0b. Concurrency guard — warn if another session is active ---
try {
  const lockPath = path.join(_projectRoot, '.claude', '.session-lock');
  if (fs.existsSync(lockPath)) {
    const lockData = fs.readFileSync(lockPath, 'utf-8').trim();
    const lockAge = Date.now() - fs.statSync(lockPath).mtimeMs;
    if (lockAge < 3600000) { // Lock less than 1 hour old
      console.log(`WARNING: Another session may be active (lock: ${lockData}, age: ${Math.round(lockAge / 60000)}min).`);
      console.log('  If the previous session crashed, delete .claude/.session-lock to proceed.');
      console.log('  Running concurrent sessions on the same repo can cause state corruption.');
    }
  }
  // Write our lock
  fs.writeFileSync(lockPath, `${_sessionId}|${new Date().toISOString()}`);
} catch (_) {}

// --- 0c. Role Check — warn if /setup-workspace hasn't been run ---
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

// --- 1b. Read MEMORY.md (with rotation if too large) and TODO.md ---
try {
  const memoryPath = path.join(_projectRoot, 'MEMORY.md');
  if (fs.existsSync(memoryPath)) {
    let memory = fs.readFileSync(memoryPath, 'utf8').trim();

    // MEMORY.md rotation: if >100 lines, archive old entries and keep recent 60
    const memLines = memory.split('\n');
    if (memLines.length > 100) {
      const archivePath = path.join(_projectRoot, '.claude', 'reports', 'memory-archive.md');
      const archiveHeader = `\n\n---\nArchived ${new Date().toISOString().split('T')[0]}\n---\n`;
      const oldEntries = memLines.slice(0, memLines.length - 60).join('\n');
      const recentEntries = memLines.slice(memLines.length - 60).join('\n');
      try {
        fs.appendFileSync(archivePath, archiveHeader + oldEntries + '\n');
        fs.writeFileSync(memoryPath, recentEntries + '\n');
        memory = recentEntries;
        console.log(`MEMORY: Rotated — archived ${memLines.length - 60} old lines to .claude/reports/memory-archive.md`);
      } catch (_) { /* best-effort rotation */ }
    }

    if (memory) {
      process.stderr.write(`\nMEMORY.md:\n${memory.slice(0, 500)}\n`);
    }
  }

  const todoPath = path.join(_projectRoot, 'TODO.md');
  if (fs.existsSync(todoPath)) {
    const todo = fs.readFileSync(todoPath, 'utf8').trim();
    if (todo) {
      process.stderr.write(`\nTODO.md:\n${todo.slice(0, 500)}\n`);
    }
  }

  // Re-inject recent audit log entries (last 10 decisions) for context continuity
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git branch --show-current', { cwd: _projectRoot, encoding: 'utf8', timeout: 2000 }).trim();
    const auditPath = path.join(reportsDir, 'audit', `audit-${branch}.log`);
    if (fs.existsSync(auditPath)) {
      const auditContent = fs.readFileSync(auditPath, 'utf-8').trim();
      const recentLines = auditContent.split('\n').slice(-10).join('\n');
      if (recentLines) {
        console.log(`\nRECENT AUDIT (last 10 actions on ${branch}):\n${recentLines}`);
      }
    }
  } catch (_) { /* no audit log or git not available */ }
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
if (!fs.existsSync(tasksDir)) {
  // Create tasks dir so future hooks don't fail silently
  try { fs.mkdirSync(tasksDir, { recursive: true }); } catch (_) {}
}

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

    // Active task — auto-inject full resume context
    if (/DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING|QA_SIGNOFF|BIZ_SIGNOFF|TECH_SIGNOFF|DEPLOYING|MONITORING/.test(status)) {
      if (!activeFound) {
        // Extract phase and assigned agent
        const phaseMatch = content.match(/^phase:\s*(.+)$/m);
        const assignedMatch = content.match(/^assigned-to:\s*(.+)$/m);
        const phase = phaseMatch ? phaseMatch[1].trim() : 'unknown';
        const assignedTo = assignedMatch ? assignedMatch[1].trim() : 'unknown';

        console.log(`\nACTIVE TASK: ${id} — ${title}`);
        console.log(`STATUS: ${status} | PHASE: ${phase} | AGENT: ${assignedTo}`);
        console.log(`TASK FILE: .claude/tasks/${file}`);

        // Auto-inject loop state for immediate context
        const loopSection = content.match(/## Loop State\n([\s\S]*?)(?=\n##|\n$|$)/);
        if (loopSection) {
          const loops = loopSection[1].trim().split('\n').filter(l => l.trim().startsWith('-'));
          if (loops.length > 0) {
            console.log(`\nLOOP STATE:`);
            for (const l of loops) console.log(`  ${l.trim()}`);
          }
        }

        // Auto-inject last HANDOFF block with next_agent_needs
        const handoffBlocks = content.match(/```[\s\S]*?HANDOFF:[\s\S]*?```/g);
        if (handoffBlocks) {
          const lastBlock = handoffBlocks[handoffBlocks.length - 1].replace(/```/g, '').trim();
          const needsMatch = lastBlock.match(/next_agent_needs:\s*([\s\S]*?)(?=\n\s{2}\w+:|\n```|$)/);
          if (needsMatch) {
            console.log(`\nNEXT AGENT NEEDS: ${needsMatch[1].trim()}`);
          }
          const contextMatch = lastBlock.match(/context:\s*(.*)/);
          if (contextMatch) {
            console.log(`LAST CONTEXT: ${contextMatch[1].trim()}`);
          }
        }

        // Auto-inject subtask progress
        const subtasksDone = (content.match(/\|\s*DONE\s*\|/g) || []).length;
        const subtasksTotal = (content.match(/\|\s*(?:TODO|IN_PROGRESS|DONE|BLOCKED)\s*\|/g) || []).length;
        if (subtasksTotal > 0) {
          console.log(`\nSUBTASKS: ${subtasksDone}/${subtasksTotal} complete`);
        }

        // Auto-inject recovery snapshot if exists
        const execDir = path.join(reportsDir, 'executions');
        if (fs.existsSync(execDir)) {
          const snapshots = fs.readdirSync(execDir)
            .filter(f => f.startsWith(id) && (f.includes('_interrupted_') || f.includes('_precompact_')))
            .sort().reverse();
          if (snapshots.length > 0) {
            try {
              const snap = JSON.parse(fs.readFileSync(path.join(execDir, snapshots[0]), 'utf-8'));
              if (snap.preserved) {
                if (snap.preserved.decisions_made) console.log(`\nDECISIONS: ${snap.preserved.decisions_made}`);
                if (snap.preserved.open_bugs) console.log(`OPEN BUGS: ${snap.preserved.open_bugs}`);
              }
            } catch (_) { /* snapshot parse failed */ }
          }
        }

        console.log(`\nRESUME: Read .claude/tasks/${file} then continue Phase ${phase} with ${assignedTo}`);
        console.log(`Or run: /workflow resume ${id}\n`);

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
          if (hoursStale > 1) {
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

// --- 5. Orphaned worktree detection ---
try {
  const { execSync } = require('child_process');
  const worktrees = execSync('git worktree list', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim();
  const wtLines = worktrees.split('\n').filter(l => l.trim());
  if (wtLines.length > 1) {
    console.log(`\nWORKTREES: ${wtLines.length - 1} active worktree(s) detected:`);
    for (const wt of wtLines.slice(1)) {
      console.log(`  ${wt.trim()}`);
    }
    console.log('  Clean up orphaned worktrees: git worktree remove <path>');
  }
} catch (_) { /* git worktree not available */ }

// --- 6. Uncommitted changes warning ---
try {
  const { execSync } = require('child_process');
  const diff = execSync('git diff --stat', { cwd: _projectRoot, encoding: 'utf8', timeout: 3000 }).trim();
  if (diff) {
    const fileCount = diff.split('\n').length - 1;
    console.log(`\nUNCOMMITTED: ${fileCount} file(s) with uncommitted changes. Consider committing.`);
  }
} catch (_) { /* git not available */ }

// --- 7. Task file format validation ---
try {
  const tasksDir2 = path.join(_projectRoot, '.claude', 'tasks');
  if (fs.existsSync(tasksDir2)) {
    const taskFiles = fs.readdirSync(tasksDir2).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const content = fs.readFileSync(path.join(tasksDir2, tf), 'utf-8');
      const hasId = /^id:\s*.+$/m.test(content);
      const hasStatus = /^status:\s*.+$/m.test(content);
      const hasTitle = /^title:\s*.+$/m.test(content);
      if (!hasId || !hasStatus || !hasTitle) {
        const missing = [!hasId && 'id', !hasStatus && 'status', !hasTitle && 'title'].filter(Boolean).join(', ');
        console.log(`TASK WARNING: ${tf} is missing required fields: ${missing}. May be corrupted.`);
      }
    }
  }
} catch (e) {
  logHookFailure('session-start:task-validation', e.message);
}

process.exit(0);
