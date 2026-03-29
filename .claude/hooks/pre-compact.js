#!/usr/bin/env node

/**
 * pre-compact.js — PreCompact hook
 * Archives full transcript summary to /docs/transcripts/ before compaction.
 * Does NOT block compaction — fires and exits cleanly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const root = findProjectRoot();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);

  // Create transcripts directory if needed
  const transcriptsDir = path.join(root, 'docs', 'transcripts');
  fs.mkdirSync(transcriptsDir, { recursive: true });

  // Create transcript archive file
  const archivePath = path.join(transcriptsDir, `session-${timestamp}.md`);

  // Read current state for archive
  const memoryContent = safeRead(path.join(root, 'MEMORY.md'));
  const todoContent = safeRead(path.join(root, 'TODO.md'));
  // Read from branch-scoped audit log
  const branch = getBranch(root);
  const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
  const branchAuditPath = path.join(root, '.claude', 'reports', 'audit', `audit-${safeBranch}.log`);
  const auditContent = safeRead(branchAuditPath);

  // Get recent audit entries (last 50 lines)
  const auditLines = auditContent.split('\n');
  const recentAudit = auditLines.slice(Math.max(0, auditLines.length - 50)).join('\n');

  const archive = `# Session Transcript Archive — ${timestamp}

## Memory State at Compaction
${memoryContent}

## Active TODOs at Compaction
${todoContent}

## Recent Audit Log (last 50 entries)
${recentAudit}

---
Archived by pre-compact hook at ${now.toISOString()}
`;

  fs.writeFileSync(archivePath, archive);

  // Log to branch-scoped audit log
  const role = getRole(root);
  const auditDir = path.join(root, '.claude', 'reports', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });
  const isoNow = now.toISOString();
  fs.appendFileSync(
    path.join(auditDir, `audit-${safeBranch}.log`),
    `${isoNow}|${role}|${branch}|PRE_COMPACT|Archived to ${path.basename(archivePath)}|ok|0ms\n`
  );

} catch (e) {
  // Never block compaction — exit cleanly
}

// Always exit 0 to not block compaction
process.exit(0);

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

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return '(not found)';
  }
}
