#!/usr/bin/env node
// PreToolUse hook: gatekeeper that BLOCKS dangerous edits before they happen
// Exit code 2 = BLOCK the edit | Exit code 0 = ALLOW
// Checks the INCOMING edit content (tool_input.new_string) not the file on disk
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

// Track exit code — 0 = allow, 2 = block
let exitCode = 0;

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
    const ext = path.extname(file).toLowerCase();
    const codeExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.dart', '.go', '.rs', '.java', '.kt', '.swift'];

    // Check INCOMING content (what's about to be written), not file on disk
    const newContent = data.tool_input?.new_string || data.tool_input?.content || '';

    if (codeExts.includes(ext) && newContent) {
      // BLOCK: Hardcoded secrets in incoming content
      if (/(?:password|secret|api_key|apikey|token|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(newContent)) {
        if (!relative.includes('test') && !relative.includes('spec') && !relative.includes('example') && !relative.includes('mock')) {
          blockers.push('Hardcoded secret detected. Use environment variables instead.');
        }
      }

      // BLOCK: Disabling tests (skip, only, xit)
      if (/@pytest\.mark\.skip|\.skip\(|xit\(|xdescribe\(|test\.skip|\.only\(/.test(newContent)) {
        blockers.push('Test skip/disable/only detected. This hides regressions. Remove or add justification.');
      }
    }

    // Also check existing file for accumulated issues (warnings only)
    if (fs.existsSync(resolved) && codeExts.includes(ext)) {
      const existingContent = fs.readFileSync(resolved, 'utf-8');

      // WARN: Console.log in production code
      if (!relative.includes('test') && !relative.includes('spec')) {
        if (/console\.(log|debug|info)\(/.test(existingContent) && ['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          warnings.push('console.log in production code. Remove before merge.');
        }
      }

      // WARN: TODO/FIXME accumulation
      const todoCount = (existingContent.match(/\/\/\s*(TODO|FIXME|HACK|XXX):/gi) || []).length;
      if (todoCount > 2) {
        warnings.push(`${todoCount} TODO/FIXME markers. Track in task file.`);
      }
    }

    // WARN: Scope violations
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
            if (scope === 'backend' && (fileLower.includes('frontend') || fileLower.includes('web/'))) {
              warnings.push(`Editing ${relative} but task scope is "${scope}".`);
            }
            if (scope === 'frontend' && (fileLower.includes('backend') || fileLower.includes('app/api'))) {
              warnings.push(`Editing ${relative} but task scope is "${scope}".`);
            }
          }
          break;
        }
      }
    }

    // Log to gatekeeper report
    if (blockers.length > 0 || warnings.length > 0) {
      const logDir = path.join(reportsDir, 'gatekeeper');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const ts = new Date().toISOString();
      const entry = `| ${ts} | ${relative} | ${blockers.length} blocked, ${warnings.length} warned | ${[...blockers, ...warnings].join('; ').substring(0, 300)} |\n`;
      fs.appendFileSync(path.join(logDir, 'gatekeeper.log'), entry);
    }

    // BLOCK: exit(2) prevents the edit from happening
    if (blockers.length > 0) {
      process.stderr.write('\nGATEKEEPER BLOCKED:\n');
      for (const b of blockers) {
        process.stderr.write(`  ${b}\n`);
      }
      process.stderr.write('Fix the issue and retry the edit.\n');
      exitCode = 2;
    }

    // WARN: exit(0) allows but shows warnings
    if (warnings.length > 0) {
      for (const w of warnings) {
        process.stderr.write(`GATEKEEPER: ${w}\n`);
      }
    }
  } catch (e) {
    logHookFailure('gatekeeper-check', e.message);
    // On error, allow the edit (fail-open, not fail-closed)
  }
}

// ── Robust stdin reader ───────────────────────────────────────────
let done = false;
let buf = '';

function finish() {
  if (done) return;
  done = true;
  process.exit(exitCode); // 0 = allow, 2 = block
}

setTimeout(() => finish(), 5000).unref();

const graceTimer = setTimeout(() => {
  if (!buf) finish();
}, 300);

process.stdin.setEncoding('utf-8');
process.stdin.resume();
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
