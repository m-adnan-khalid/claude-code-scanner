#!/usr/bin/env node
// PostToolUse hook: gatekeeper checks after code changes
// BLOCKS: hardcoded secrets, disabled tests in dev phases
// WARNS: console.log, TODOs, scope violations
// For deep review, invoke @gatekeeper agent directly

const fs = require('fs');
const path = require('path');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}

const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
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
    const blockers = [];

    // 1. Check if file content has danger signals
    if (fs.existsSync(resolved)) {
      const content = fs.readFileSync(resolved, 'utf-8');
      const ext = path.extname(file).toLowerCase();
      const codeExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.dart', '.go', '.rs', '.java', '.kt', '.swift'];

      if (codeExts.includes(ext)) {
        // BLOCK: Hardcoded secrets
        if (/(?:password|secret|api_key|apikey|token|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(content)) {
          // Exclude test files and example configs
          if (!relative.includes('test') && !relative.includes('spec') && !relative.includes('example') && !relative.includes('mock')) {
            blockers.push('SECURITY: Hardcoded secret detected. Use environment variables. This edit is flagged.');
          }
        }

        // BLOCK: Disabled tests during development phases (indicates regression hiding)
        if (data.tool_name === 'Edit') {
          const editContent = data.tool_input?.new_string || '';
          if (/@pytest\.mark\.skip|\.skip\(|xit\(|xdescribe\(|test\.skip|\.only\(/.test(editContent)) {
            blockers.push('REGRESSION: Adding test skip/disable/only. This hides regressions. Remove skip or add justification comment.');
          }
        }

        // WARN: Console.log left in production code (not test files)
        if (!relative.includes('test') && !relative.includes('spec') && !relative.includes('__test')) {
          if (/console\.(log|debug|info)\(/.test(content) && ['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            warnings.push('QUALITY: console.log found in production code. Remove before merge.');
          }
        }

        // WARN: TODO/FIXME/HACK markers
        const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX):/gi) || []).length;
        if (todoCount > 2) {
          warnings.push(`QUALITY: ${todoCount} TODO/FIXME markers found. Track these in the task file.`);
        }

        // WARN: Large file changes (>300 lines changed could impact many things)
        const lineCount = content.split('\n').length;
        if (lineCount > 500 && data.tool_name === 'Write') {
          warnings.push(`SCOPE: Large file write (${lineCount} lines). Consider splitting into smaller files.`);
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

    // Log blockers and warnings to gatekeeper report
    if (blockers.length > 0 || warnings.length > 0) {
      const logDir = path.join(reportsDir, 'gatekeeper');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const timestamp = new Date().toISOString();
      const entry = `| ${timestamp} | ${relative} | ${blockers.length} blockers, ${warnings.length} warnings | ${[...blockers, ...warnings].join('; ').substring(0, 300)} |\n`;
      fs.appendFileSync(path.join(logDir, 'gatekeeper.log'), entry);
    }

    // Output blockers (shown prominently)
    if (blockers.length > 0) {
      console.log('\n=== GATEKEEPER BLOCKED ===');
      for (const b of blockers) {
        console.log(`  BLOCK: ${b}`);
      }
      console.log('Fix the issue above before proceeding.');
      console.log('=== END GATEKEEPER ===\n');
    }

    // Output warnings (informational)
    if (warnings.length > 0) {
      process.stderr.write('\n');
      for (const w of warnings) {
        process.stderr.write(`GATEKEEPER: ${w}\n`);
      }
    }
  } catch (e) {
    logHookFailure('gatekeeper-check', e.message);
  }
}

// ── Robust stdin reader (4-layer) ───────────────────────────────────
let done = false;
let buf = '';

function finish() {
  if (done) return;
  done = true;
  process.exit(0); // PostToolUse hooks — blockers are logged, agent sees warning
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
