#!/usr/bin/env node
// PostToolUseFailure hook: track tool failures for debugging and execution reports
// Logs every tool failure with context so patterns can be identified

const fs = require('fs');
const path = require('path');

// Timeout: exit if stdin hangs
setTimeout(() => process.exit(0), 10000);

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name || 'unknown';
    const error = data.tool_error || data.error || 'unknown error';
    const toolInput = data.tool_input || {};

    // Log to failure tracking file
    const reportsDir = path.join(process.cwd(), '.claude', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const logPath = path.join(reportsDir, 'tool-failures.log');
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const entry = `| ${timestamp} | ${toolName} | ${String(error).substring(0, 200).replace(/\n/g, ' ')} | ${JSON.stringify(toolInput).substring(0, 200)} |\n`;

    fs.appendFileSync(logPath, entry);

    // Also log to active task's changes log if one exists
    const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const content = fs.readFileSync(taskPath, 'utf-8');
        if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
          const taskLogPath = taskPath.replace(/\.md$/, '_changes.log');
          fs.appendFileSync(taskLogPath, `| ${timestamp} | TOOL_FAILURE | ${toolName}: ${String(error).substring(0, 100)} |\n`);
          break;
        }
      }
    }

    // Output warning to stderr (visible to user)
    process.stderr.write(`Tool failure tracked: ${toolName} — ${String(error).substring(0, 100)}\n`);
  } catch (e) {
    // Don't block on tracking failure
  }
  process.exit(0);
});
