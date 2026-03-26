#!/usr/bin/env node
// Post-tool hook: auto-format edited files
const { execFileSync } = require('child_process');
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
    if (!file || !fs.existsSync(file)) process.exit(0);

    // Validate file path is within the project directory
    const resolved = path.resolve(file);
    if (!resolved.startsWith(process.cwd())) process.exit(0);

    const ext = path.extname(file).toLowerCase();
    const formatters = {
      '.ts': ['npx', ['prettier', '--write']],
      '.tsx': ['npx', ['prettier', '--write']],
      '.js': ['npx', ['prettier', '--write']],
      '.jsx': ['npx', ['prettier', '--write']],
      '.json': ['npx', ['prettier', '--write']],
      '.css': ['npx', ['prettier', '--write']],
      '.py': ['black', []],
      '.go': ['gofmt', ['-w']],
      '.rs': ['rustfmt', []],
    };

    const formatter = formatters[ext];
    if (formatter) {
      const [cmd, args] = formatter;
      try { execFileSync(cmd, [...args, resolved], { stdio: 'ignore', timeout: 10000 }); } catch {}
    }
  } catch {}
  process.exit(0);
});
