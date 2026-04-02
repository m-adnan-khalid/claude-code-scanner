#!/usr/bin/env node

/**
 * handoff-validator.js — SubagentStop hook
 * Validates that agent output contains a properly formatted HANDOFF block
 * with required fields. Logs warnings for malformed handoffs.
 * Exit 0 always (advisory — never blocks agent completion).
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const reportsDir = path.join(ROOT, '.claude', 'reports');

// Read stdin for agent output context
let input = '';
try { input = fs.readFileSync('/dev/stdin', 'utf-8'); } catch (e) { /* ok */ }

let parsed = {};
try { parsed = JSON.parse(input); } catch { parsed = {}; }

const agentName = parsed.agent_name || parsed.tool_input?.description || 'unknown-agent';
const agentOutput = parsed.tool_result?.text || parsed.stdout || '';

// Skip if no output to validate
if (!agentOutput || agentOutput.length < 50) {
  process.exit(0);
}

const warnings = [];
const timestamp = new Date().toISOString();

// Check for HANDOFF block
const hasHandoff = /HANDOFF:/i.test(agentOutput);
if (!hasHandoff) {
  warnings.push(`MISSING HANDOFF block — agent output has no structured handoff`);
}

if (hasHandoff) {
  // Check required fields
  const requiredFields = [
    { field: 'from:', label: 'from (source agent)' },
    { field: 'to:', label: 'to (target agent)' },
    { field: 'reason:', label: 'reason (why handoff)' },
  ];

  for (const { field, label } of requiredFields) {
    const pattern = new RegExp(`${field}\\s*\\S`, 'i');
    if (!pattern.test(agentOutput)) {
      warnings.push(`MISSING HANDOFF field: ${label}`);
    }
  }

  // Check recommended fields
  const recommendedFields = [
    { field: 'next_agent_needs:', label: 'next_agent_needs' },
    { field: 'execution_metrics:', label: 'execution_metrics' },
    { field: 'memory_update:', label: 'memory_update' },
  ];

  for (const { field, label } of recommendedFields) {
    const pattern = new RegExp(field, 'i');
    if (!pattern.test(agentOutput)) {
      warnings.push(`MISSING recommended field: ${label}`);
    }
  }

  // Check execution metrics sub-fields if present
  if (/execution_metrics:/i.test(agentOutput)) {
    const metricFields = ['turns_used', 'files_read', 'files_modified', 'confidence'];
    for (const mf of metricFields) {
      if (!new RegExp(mf, 'i').test(agentOutput)) {
        warnings.push(`MISSING execution_metric: ${mf}`);
      }
    }
  }
}

// Check for NEXT ACTION line
if (!/NEXT ACTION:/i.test(agentOutput)) {
  warnings.push(`MISSING "NEXT ACTION:" line — required by all agents`);
}

// Log warnings
if (warnings.length > 0) {
  // Write to handoff validation log
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const logPath = path.join(reportsDir, 'handoff-validation.log');
    const entry = `${timestamp} | ${agentName} | ${warnings.length} issues | ${warnings.join('; ')}\n`;
    fs.appendFileSync(logPath, entry);
  } catch (e) { /* best effort */ }

  // Stderr warning (visible to user)
  process.stderr.write(`\n⚠️  HANDOFF validation for ${agentName}: ${warnings.length} issue(s)\n`);
  for (const w of warnings.slice(0, 3)) {
    process.stderr.write(`   - ${w}\n`);
  }
  if (warnings.length > 3) {
    process.stderr.write(`   ... and ${warnings.length - 3} more. See .claude/reports/handoff-validation.log\n`);
  }
}

// Prune log if too large (keep last 500 lines)
try {
  const logPath = path.join(reportsDir, 'handoff-validation.log');
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    if (lines.length > 500) {
      fs.writeFileSync(logPath, lines.slice(-400).join('\n'));
    }
  }
} catch (e) { /* best effort */ }

// Advisory only — never block agent completion
process.exit(0);
