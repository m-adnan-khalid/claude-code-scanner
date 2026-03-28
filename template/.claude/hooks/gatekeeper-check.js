#!/usr/bin/env node
// PostToolUse hook: lightweight gatekeeper checks after code changes
// Catches obvious regressions and scope violations automatically
// For deep review, invoke @gatekeeper agent directly

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

// ── Gatekeeper logic ────────────────────────────────────────────────
function check(raw) {
  try {
    const data = JSON.parse(raw);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) return;

    const resolved = path.resolve(file);
    const relative = path.relative(_projectRoot, resolved);

    // Skip non-project files
    if (relative.startsWith('..')) return;

    const warnings = [];

    // 1. Check if file content has danger signals
    if (fs.existsSync(resolved)) {
      const content = fs.readFileSync(resolved, 'utf-8');
      const ext = path.extname(file).toLowerCase();
      const codeExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.dart', '.go', '.rs', '.java', '.kt', '.swift'];

      if (codeExts.includes(ext)) {
        // Hardcoded secrets
        if (/(?:password|secret|api_key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(content)) {
          warnings.push('SECURITY: Possible hardcoded secret detected. Use environment variables instead.');
        }

        // Disabled tests
        if (/@pytest\.mark\.skip|\.skip\(|xit\(|xdescribe\(|test\.skip/.test(content)) {
          if (data.tool_name === 'Edit') {
            warnings.push('REGRESSION: Test skip/disable detected. Ensure this is intentional.');
          }
        }

        // Console.log left in production code (not test files)
        if (!relative.includes('test') && !relative.includes('spec') && !relative.includes('__test')) {
          if (/console\.(log|debug|info)\(/.test(content) && ext !== '.js') {
            warnings.push('QUALITY: console.log found in production code. Remove before merge.');
          }
        }

        // TODO/FIXME/HACK markers
        const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX):/gi) || []).length;
        if (todoCount > 2) {
          warnings.push(`QUALITY: ${todoCount} TODO/FIXME markers found. Track these in the task file.`);
        }
      }
    }

    // 2. Check scope against active task
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const taskPath = path.join(tasksDir, tf);
        const taskContent = fs.readFileSync(taskPath, 'utf-8');
        if (/status:\s*(DEVELOPING|DEV_TESTING)/.test(taskContent)) {
          const scopeMatch = taskContent.match(/^scope:\s*(.+)$/m);
          if (scopeMatch) {
            const scope = scopeMatch[1].trim().toLowerCase();
            const fileLower = relative.toLowerCase();
            // Warn if editing files clearly outside task scope
            if (scope === 'backend' && (fileLower.includes('frontend') || fileLower.includes('web/') || fileLower.includes('lib/'))) {
              warnings.push(`SCOPE: Editing ${relative} but task scope is "${scope}". Is this intentional?`);
            }
            if (scope === 'frontend' && (fileLower.includes('backend') || fileLower.includes('app/api') || fileLower.includes('lib/features'))) {
              warnings.push(`SCOPE: Editing ${relative} but task scope is "${scope}". Is this intentional?`);
            }
            if (scope === 'mobile' && (fileLower.includes('backend') || fileLower.includes('web/'))) {
              warnings.push(`SCOPE: Editing ${relative} but task scope is "${scope}". Is this intentional?`);
            }
          }
          break;
        }
      }
    }

    // Output warnings (non-blocking — informational only)
    if (warnings.length > 0) {
      process.stderr.write('\n');
      for (const w of warnings) {
        process.stderr.write(`GATEKEEPER: ${w}\n`);
      }
    }
  } catch {}
}

// ── Robust stdin reader (4-layer) ───────────────────────────────────
let done = false;
let buf = '';

function finish() {
  if (done) return;
  done = true;
  process.exit(0); // PostToolUse hooks should never block — only warn
}

setTimeout(() => finish(), 5000).unref();

const graceTimer = setTimeout(() => {
  if (!buf) finish();
}, 300);

process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => {
  clearTimeout(graceTimer);
  buf += chunk;
  try {
    JSON.parse(buf);
    check(buf);
    finish();
  } catch {}
});
process.stdin.on('end', () => {
  clearTimeout(graceTimer);
  if (buf) check(buf);
  finish();
});
process.stdin.on('error', () => finish());
process.stdin.resume();
