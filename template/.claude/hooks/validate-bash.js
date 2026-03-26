#!/usr/bin/env node
// Pre-tool hook: block dangerous bash commands

// Timeout: exit if stdin hangs
setTimeout(() => { process.stderr.write('BLOCKED: Hook timeout.\n'); process.exit(2); }, 10000);

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cmd = (data.tool_input && data.tool_input.command) || '';
    if (!cmd) process.exit(0);

    const DANGEROUS_STRINGS = ['rm -rf /', ':(){ :|:& };:', '> /dev/sda', 'mkfs', 'dd if='];
    const DANGEROUS_PATTERNS = [/curl\s.*\|\s*bash/, /wget\s.*\|\s*bash/];
    for (const p of DANGEROUS_STRINGS) {
      if (cmd.includes(p)) {
        process.stderr.write('BLOCKED: Dangerous command.\n');
        process.exit(2);
      }
    }
    for (const rx of DANGEROUS_PATTERNS) {
      if (rx.test(cmd)) {
        process.stderr.write('BLOCKED: Dangerous command.\n');
        process.exit(2);
      }
    }
  } catch {
    process.stderr.write('BLOCKED: Failed to parse hook input.\n');
    process.exit(2);
  }
});
