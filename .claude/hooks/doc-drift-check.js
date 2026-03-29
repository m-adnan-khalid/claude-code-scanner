#!/usr/bin/env node

/**
 * doc-drift-check.js — PostToolUse hook
 * After Edit/Write on src/ files, checks if a corresponding docs/ file
 * exists and warns if it may be stale.
 */

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    // Only check after Edit or Write
    if (!['Edit', 'Write'].includes(tool_name)) {
      process.exit(0);
    }

    const filePath = tool_input && tool_input.file_path;
    if (!filePath) process.exit(0);

    const root = findProjectRoot();
    const relPath = path.relative(root, path.resolve(filePath));

    // Only check src/ files
    if (!relPath.startsWith('src/') && !relPath.startsWith('src\\')) {
      process.exit(0);
    }

    // Map src/ path to potential docs/ path
    const docPath = relPath
      .replace(/^src\//, 'docs/')
      .replace(/\.[^.]+$/, '.md');

    const fullDocPath = path.join(root, docPath);

    if (fs.existsSync(fullDocPath)) {
      const docStat = fs.statSync(fullDocPath);
      const srcStat = fs.statSync(path.resolve(filePath));

      if (docStat.mtimeMs < srcStat.mtimeMs) {
        process.stderr.write(`\n⚠️  DOC DRIFT: ${relPath} changed but ${docPath} may be stale\n`);
        process.stderr.write(`   Update the doc before submitting PR.\n\n`);

        // Log to branch-scoped audit log
        const now = new Date().toISOString();
        let branch = 'detached';
        try {
          const { execSync } = require('child_process');
          branch = execSync('git branch --show-current', { cwd: root, timeout: 3000 })
            .toString().trim() || 'detached';
        } catch (_) {}
        let role = 'UNKNOWN';
        try {
          const envPath = path.join(root, '.claude', 'session.env');
          if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/CURRENT_ROLE=(\S+)/);
            if (match) role = match[1];
          }
        } catch (_) {}
        const auditDir = path.join(root, '.claude', 'reports', 'audit');
        fs.mkdirSync(auditDir, { recursive: true });
        const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
        const auditPath = path.join(auditDir, `audit-${safeBranch}.log`);
        fs.appendFileSync(auditPath, `${now}|${role}|${branch}|DOC_DRIFT|${relPath} changed, ${docPath} stale|warn|0ms\n`);
      }
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}
