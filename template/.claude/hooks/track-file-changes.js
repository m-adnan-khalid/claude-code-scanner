#!/usr/bin/env node
// Post-tool hook: track file changes for active task
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
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) process.exit(0);

    const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
    if (!fs.existsSync(tasksDir)) process.exit(0);

    const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const tf of taskFiles) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf-8');
      if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
        const logPath = taskPath.replace(/\.md$/, '_changes.log');
        const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
        fs.appendFileSync(logPath, `| ${timestamp} | file_changed | ${file} |\n`);
        break;
      }
    }
  } catch {}
  process.exit(0);
});
