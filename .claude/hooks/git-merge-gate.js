#!/usr/bin/env node

/**
 * git-merge-gate.js — PreToolUse hook for git merge
 * Runs Gate 2 (task registry), Gate 6 (tests), Gate 9 (destructive check).
 * Exit 0 = allow, Exit 2 = hard block.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 }).trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function fail(gate, msg) {
  process.stderr.write(`❌ GATE ${gate} FAIL: ${msg}\n`);
  process.exit(2);
}

// Read stdin (4-layer approach for cross-platform)
let input = '';
try { input = fs.readFileSync('/dev/stdin', 'utf-8'); } catch (e) {
  try { input = fs.readFileSync(0, 'utf-8'); } catch (e2) { /* no stdin */ }
}

const cmd = (() => {
  try { return JSON.parse(input).tool_input?.command || ''; }
  catch { return ''; }
})();

// Only run if this is actually a git merge command
if (!cmd || !cmd.match(/git\s+merge/)) {
  process.exit(0);
}

// ── GATE 9: DESTRUCTIVE COMMAND BLOCK ──
if (/merge.*main|merge.*master/.test(cmd)) {
  const branch = run('git branch --show-current');
  if (branch === 'main' || branch === 'master') {
    // Merging INTO main — verify task registry shows DONE/IN_REVIEW
    // (clearance is checked via Gate 2 task registry below)
    process.stderr.write(`⚠️  GATE 9: Merging into ${branch} — verifying task status...\n`);
  }
}

// ── GATE 2: TASK REGISTRY ──
const branch = run('git branch --show-current');
const storyMatch = branch.match(/([A-Z]+-[0-9]+)/);
const storyId = storyMatch ? storyMatch[1] : null;
const registryPath = path.join(ROOT, '.claude/project/TASK_REGISTRY.md');

if (storyId && fs.existsSync(registryPath)) {
  const registry = fs.readFileSync(registryPath, 'utf-8');
  const storyLine = registry.split('\n').find(l => l.includes(storyId));
  if (storyLine && !storyLine.includes('DONE') && !storyLine.includes('IN_REVIEW') && !storyLine.includes('MERGED')) {
    fail(2, `${storyId} is not DONE/IN_REVIEW.\n    Complete all tasks before merging.`);
  }
}

// ── GATE 10: PHASE 10 SIGN-OFF CHECK ──
if (storyId) {
  const tasksDir = path.join(ROOT, '.claude', 'tasks');
  if (fs.existsSync(tasksDir)) {
    try {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const content = fs.readFileSync(path.join(tasksDir, tf), 'utf8');
        if (content.includes(storyId) || tf.toUpperCase().includes(storyId)) {
          // Check sign-off statuses
          const techSignoff = content.match(/tech_signoff:\s*(\S+)/i);
          const qaSignoff = content.match(/qa_signoff:\s*(\S+)/i);
          const bizSignoff = content.match(/business_signoff:\s*(\S+)/i);

          const missing = [];
          if (!techSignoff || techSignoff[1] !== 'APPROVED') missing.push('tech');
          if (!qaSignoff || qaSignoff[1] !== 'APPROVED') missing.push('QA');
          // Business sign-off optional for hotfix/refactor
          if (bizSignoff && bizSignoff[1] === 'REJECTED') missing.push('business (REJECTED)');
          else if (!bizSignoff && !content.includes('type: hotfix') && !content.includes('type: refactor')) {
            missing.push('business');
          }

          if (missing.length > 0) {
            process.stderr.write(`⚠️  GATE 10 WARNING: Missing sign-offs for ${storyId}: ${missing.join(', ')}\n`);
            process.stderr.write(`    Run: /signoff ${missing[0]} ${storyId}\n`);
            // Advisory warning, not blocking — @team-lead orchestrator enforces the hard gate
          }
          break;
        }
      }
    } catch (e) { /* best effort */ }
  }
}

// ── GATE 6: TESTS ──
if (fs.existsSync(path.join(ROOT, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  if (pkg.scripts && pkg.scripts.test) {
    try {
      execSync('npm test', { cwd: ROOT, encoding: 'utf-8', timeout: 120000, stdio: 'pipe' });
    } catch (e) {
      const output = (e.stdout || '') + (e.stderr || '');
      const failures = output.split('\n').filter(l => /fail|error/i.test(l)).slice(0, 5).join('\n    ');
      fail(6, `Test suite failed.\n    ${failures}\n    Fix tests before merging.`);
    }
  }
}

// Log merge clearance
const timestamp = new Date().toISOString();
const auditPath = path.join(ROOT, 'AUDIT_LOG.md');
if (fs.existsSync(auditPath)) {
  fs.appendFileSync(auditPath,
    `| ${timestamp} | MERGE | ${branch} | ${storyId || 'N/A'} | CLEARED |\n`);
}

process.stderr.write(`✅ Merge gate passed.\n`);
process.exit(0);
