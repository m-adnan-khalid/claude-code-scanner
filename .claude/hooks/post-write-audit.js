#!/usr/bin/env node
// post-write-audit.js — Post-write audit hook (migrated from post-write-log.sh)
// Logs file writes to AUDIT_LOG.md + auto-detects story outputs for TASK_REGISTRY tracking

const fs = require('fs');
const path = require('path');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const AUDIT_LOG = path.join(projectRoot, 'AUDIT_LOG.md');
const TIMESTAMP = new Date().toISOString().replace(/\.\d{3}Z/, 'Z');

// Read stdin for tool result context
let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch (e) { /* no stdin */ }

let parsed = {};
try { parsed = JSON.parse(input); } catch (e) { /* ignore */ }

const toolName = parsed.tool_name || '';
const filePath = parsed.tool_input?.file_path || parsed.tool_input?.command || '';

// Only act on Edit/Write operations
if (!['Edit', 'Write'].includes(toolName)) {
  process.exit(0);
}

// Log to AUDIT_LOG.md
if (fs.existsSync(AUDIT_LOG) && filePath) {
  // Read role from session.env file (not shell env var)
  let role = 'unknown';
  try {
    const envPath = path.join(projectRoot, '.claude', 'session.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^CURRENT_ROLE=(.+)$/m);
      if (match) role = match[1].trim();
    }
  } catch (e) { /* best effort */ }
  const line = `| ${TIMESTAMP} | ${role} | ${toolName.toUpperCase()} | ${filePath} | — |\n`;
  try {
    fs.appendFileSync(AUDIT_LOG, line);
  } catch (e) { /* best effort */ }
}

// Auto-detect story-related output files
const storyMap = {
  'IDEA_CANVAS': 'STORY-001',
  'PRODUCT_SPEC': 'STORY-002',
  'BACKLOG': 'STORY-003',
  'DOMAIN_MODEL': 'STORY-004',
  'GLOSSARY': 'STORY-004',
  'BRD': 'STORY-005',
};

const basename = path.basename(filePath).toUpperCase();
for (const [pattern, story] of Object.entries(storyMap)) {
  if (basename.includes(pattern)) {
    process.stderr.write(`Story output detected: ${pattern} written — check ${story} subtasks\n`);
    break;
  }
}

// Detect requirements and design outputs
if (filePath.includes('requirements/')) {
  process.stderr.write('Story output detected: Requirements written — check STORY-006 subtasks\n');
} else if (filePath.includes('flows/')) {
  process.stderr.write('Story output detected: Process flow written — check STORY-007 subtasks\n');
} else if (filePath.match(/design\/.*-brief/)) {
  process.stderr.write('Story output detected: Design brief written — check STORY-008 subtasks\n');
}

process.exit(0);
