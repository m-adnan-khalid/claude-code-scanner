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

      // WARN: Long function in incoming content (>40 consecutive non-blank lines)
      const incomingLines = newContent.split('\n');
      if (incomingLines.length > 60) {
        let consecNonBlank = 0;
        for (const line of incomingLines) {
          consecNonBlank = line.trim() ? consecNonBlank + 1 : 0;
          if (consecNonBlank > 40) {
            warnings.push('Code block exceeds 40 lines. Consider extracting into smaller functions.');
            break;
          }
        }
      }

      // WARN: Magic numbers (not 0, 1, -1, common HTTP status codes)
      const magicMatches = newContent.match(/(?<![.\w])(?:(?<!\d)[2-9]\d{2,}|[2-9]\d{3,})(?!\d)/g);
      if (magicMatches && magicMatches.length > 2) {
        const httpCodes = new Set(['200', '201', '204', '301', '302', '400', '401', '403', '404', '409', '422', '429', '500', '502', '503']);
        const nonHttp = magicMatches.filter(m => !httpCodes.has(m));
        if (nonHttp.length > 2) {
          warnings.push(`${nonHttp.length} magic numbers detected. Use named constants or enums.`);
        }
      }

      // WARN: DIP violation — direct instantiation of services in business logic
      const newMatches = newContent.match(/new\s+\w+(Service|Repository|Client|Provider|Handler|Manager|Gateway)\s*\(/g);
      if (newMatches && newMatches.length > 0 && !relative.includes('test') && !relative.includes('spec') && !relative.includes('factory') && !relative.includes('module') && !relative.includes('config') && !relative.includes('container')) {
        warnings.push(`Direct "new ${newMatches[0].trim()}" in business logic. Use dependency injection (constructor parameter) instead.`);
      }

      // WARN: Large if/else chain that could be Strategy pattern
      const ifElseChain = newContent.match(/else\s+if\s*\(/g);
      if (ifElseChain && ifElseChain.length >= 4) {
        warnings.push(`${ifElseChain.length + 1}-branch if/else chain detected. Consider Strategy or Map pattern for extensibility (OCP).`);
      }

      // WARN: any/dynamic type usage (type safety — code-safety.md)
      if (['.ts', '.tsx'].includes(ext)) {
        const anyMatches = newContent.match(/:\s*any\b|<any>|as\s+any\b/g);
        if (anyMatches && anyMatches.length > 0) {
          warnings.push(`${anyMatches.length} "any" type(s) detected. Use specific types or generics (see code-safety.md Type Safety).`);
        }
      }

      // WARN: Bare catch-all (error handling — code-safety.md)
      if (/catch\s*\(\s*\)\s*\{[\s]*\}|catch\s*\{[\s]*\}|except\s*:\s*$/m.test(newContent)) {
        blockers.push('Empty catch block detected. Never swallow errors — log or propagate (see code-safety.md Error Handling).');
      }

      // WARN: Hardcoded user-facing strings (i18n — code-platform.md)
      // Only flag if project uses i18n (checked by presence of common i18n imports)
      if (/(?:i18n|intl|t\(|useTranslation|formatMessage|gettext|__)/.test(newContent)) {
        const hardcodedStrings = newContent.match(/(?:label|title|message|placeholder|text)\s*[:=]\s*['"][A-Z][a-z]/g);
        if (hardcodedStrings && hardcodedStrings.length > 2) {
          warnings.push(`${hardcodedStrings.length} potentially hardcoded user-facing strings. Use i18n keys (see code-platform.md i18n).`);
        }
      }

      // WARN: Missing timeout on fetch/axios/http calls (code-safety.md)
      if (/(?:fetch|axios|http\.get|http\.post|request)\s*\(/.test(newContent) && !/timeout/i.test(newContent)) {
        warnings.push('Network call without timeout configuration. Add timeout to prevent infinite waits (see code-safety.md Error Handling).');
      }

      // WARN: Unsubscribed event listeners (code-safety.md Resources)
      if (/addEventListener\s*\(/.test(newContent) && !/removeEventListener/.test(newContent)) {
        warnings.push('addEventListener without matching removeEventListener. Dispose on cleanup (see code-safety.md Resources).');
      }

      // WARN: Nesting depth > 3 levels (code-standards.md)
      let maxNest = 0;
      for (const line of incomingLines || newContent.split('\n')) {
        if (!line.trim()) continue;
        const indent = (line.match(/^(\s*)/)[1] || '').length;
        const level = Math.floor(indent / 2);
        if (level > maxNest) maxNest = level;
      }
      if (maxNest > 6) {
        warnings.push(`Nesting depth ~${Math.floor(maxNest / 2)} levels detected (limit: 3). Extract early returns or helper functions (see code-standards.md).`);
      }
    }

    // Also check existing file for accumulated issues (warnings only)
    if (fs.existsSync(resolved) && codeExts.includes(ext)) {
      const existingContent = fs.readFileSync(resolved, 'utf-8');

      // WARN: File exceeds 300 lines
      const lineCount = existingContent.split('\n').length;
      if (lineCount > 300) {
        warnings.push(`File is ${lineCount} lines (limit: 300). Consider splitting into smaller modules.`);
      }

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

    // BLOCK: Scope violations (upgraded from warning to blocker)
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
              blockers.push(`SCOPE VIOLATION: Editing ${relative} but task scope is "${scope}". Change task scope or work in the correct directory.`);
            }
            if (scope === 'frontend' && (fileLower.includes('backend') || fileLower.includes('app/api'))) {
              blockers.push(`SCOPE VIOLATION: Editing ${relative} but task scope is "${scope}". Change task scope or work in the correct directory.`);
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
