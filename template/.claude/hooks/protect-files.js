#!/usr/bin/env node
// Pre-tool hook: block edits to protected files
const path = require('path');

// Timeout: exit if stdin hangs
setTimeout(() => { process.stderr.write('BLOCKED: Hook timeout.\n'); process.exit(2); }, 10000);

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) process.exit(0);

    // Normalize path separators for cross-platform matching
    const normalized = path.resolve(file).split(path.sep).join('/');

    const PROTECTED_DIRS = ['.github/workflows/'];
    for (const p of PROTECTED_DIRS) {
      if (normalized.includes(p)) {
        process.stderr.write(`BLOCKED: ${file} is protected.\n`);
        process.exit(2);
      }
    }
    const basename = path.basename(normalized);
    const PROTECTED_EXACT = ['.env', '.env.local', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    for (const p of PROTECTED_EXACT) {
      if (basename === p) {
        process.stderr.write(`BLOCKED: ${file} is protected.\n`);
        process.exit(2);
      }
    }
  } catch {
    process.stderr.write('BLOCKED: Failed to parse hook input.\n');
    process.exit(2);
  }
});
