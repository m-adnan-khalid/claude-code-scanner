#!/usr/bin/env node

/**
 * prompt-stats.js — Stop hook (command type)
 * Generates per-session execution stats when the session ends.
 * Shows: tool call counts, files changed, estimated tokens, context usage,
 * test results summary, and a basic hallucination risk flag.
 *
 * Replaces the unreliable "prompt" type Stop hook with a real command hook
 * that outputs structured stats.
 */

const fs = require('fs');
const path = require('path');

// Resolve project root
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

// Parse stdin for session_id
let _stdinBuf = '';
let _sessionId = 'unknown';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { _stdinBuf += chunk; });
process.stdin.on('error', () => {});
process.stdin.on('end', () => { try { _sessionId = JSON.parse(_stdinBuf).session_id || 'unknown'; } catch (_) {} });
setTimeout(() => { try { if (_stdinBuf && _sessionId === 'unknown') _sessionId = JSON.parse(_stdinBuf).session_id || 'unknown'; } catch (_) {} }, 300);
setTimeout(() => process.exit(0), 5000).unref();

try {
  const root = _projectRoot;

  // 1. Read context state
  const contextFile = path.join(reportsDir, 'context-state.json');
  let contextState = null;
  if (fs.existsSync(contextFile)) {
    contextState = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
  }

  // 2. Read latest test results
  const testRunFile = path.join(reportsDir, 'test-runs', 'latest.json');
  let testResults = null;
  if (fs.existsSync(testRunFile)) {
    testResults = JSON.parse(fs.readFileSync(testRunFile, 'utf-8'));
  }

  // 3. Count files changed in this session (from git)
  let filesChanged = 0;
  let filesAdded = 0;
  try {
    const { execSync } = require('child_process');
    const diffOutput = execSync('git diff --name-only 2>/dev/null', { cwd: root, timeout: 3000 }).toString();
    filesChanged = diffOutput.split('\n').filter(l => l.trim()).length;
    const untrackedOutput = execSync('git ls-files --others --exclude-standard 2>/dev/null', { cwd: root, timeout: 3000 }).toString();
    filesAdded = untrackedOutput.split('\n').filter(l => l.trim()).length;
  } catch (e) { logHookFailure("prompt-stats", e.message); }

  // 4. Basic hallucination risk assessment
  // Check if any recently written files reference non-existent imports
  let hallucinationRisk = 'LOW';
  let hallucinationNotes = [];

  // Check for common hallucination patterns in recent changes
  try {
    const { execSync } = require('child_process');
    const changedFiles = execSync('git diff --name-only --diff-filter=M 2>/dev/null', { cwd: root, timeout: 3000 })
      .toString().split('\n').filter(f => f.match(/\.(ts|js|py|go)$/));

    for (const file of changedFiles.slice(0, 5)) {
      const filePath = path.join(root, file);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for imports of non-existent local files
      const localImports = content.match(/from\s+['"]\.\/[^'"]+['"]/g) || [];
      for (const imp of localImports) {
        const importMatch = imp.match(/from\s+['"](\.\/[^'"]+)['"]/);
      if (!importMatch) continue;
      const importPath = importMatch[1];
        const dir = path.dirname(filePath);
        const resolved = path.join(dir, importPath);
        const exists = fs.existsSync(resolved) ||
          fs.existsSync(resolved + '.ts') ||
          fs.existsSync(resolved + '.js') ||
          fs.existsSync(resolved + '/index.ts') ||
          fs.existsSync(resolved + '/index.js');
        if (!exists) {
          hallucinationRisk = 'HIGH';
          hallucinationNotes.push(`${file}: imports non-existent "${importPath}"`);
        }
      }
    }
  } catch (e) { logHookFailure("prompt-stats", e.message); }

  // 4b. Word count estimation from audit log
  let sessionWordCount = 0;
  try {
    const auditDir = path.join(reportsDir, 'audit');
    if (fs.existsSync(auditDir)) {
      const auditFiles = fs.readdirSync(auditDir).filter(f => f.endsWith('.log'));
      for (const f of auditFiles) {
        const content = fs.readFileSync(path.join(auditDir, f), 'utf8');
        sessionWordCount += content.split(/\s+/).length;
      }
    }
  } catch (e) { /* ignore */ }

  // 4c. Phase completion tracking
  let phaseLines = [];
  try {
    const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      for (const tf of taskFiles) {
        const content = fs.readFileSync(path.join(tasksDir, tf), 'utf8');
        const phases = content.match(/## Phase \d+.*?(DONE|IN_PROGRESS|TODO)/g) || [];
        if (phases.length > 0) {
          phaseLines.push(`  Phase status (${tf}): ${phases.join(', ')}`);
        }
      }
    }
  } catch (e) { /* ignore */ }

  // 5. Build and output stats
  console.log('\n' + '='.repeat(50));
  console.log('SESSION EXECUTION STATS');
  console.log('='.repeat(50));

  if (contextState) {
    console.log(`\nContext Usage:    ~${contextState.estimated_pct || 0}% (${contextState.budget_pct || 0}% of 60% budget)`);
    console.log(`Tool Calls:      ${contextState.tool_calls || 0} total`);
    console.log(`  File Reads:    ${contextState.file_reads || 0} (${formatBytes(contextState.file_read_bytes || 0)})`);
    console.log(`  Bash Commands: ${contextState.bash_calls || 0} (${formatBytes(contextState.bash_output_bytes || 0)})`);
    console.log(`  Edits/Writes:  ${contextState.edits || 0} / ${contextState.writes || 0}`);
    console.log(`  Agents:        ${contextState.agent_calls || 0}`);
    console.log(`Est. Tokens:     ~${formatNumber(contextState.estimated_tokens || 0)}`);
  } else {
    console.log('\nContext Usage:    No tracking data (context-monitor hook may not be active)');
  }

  console.log(`\nFiles Changed:   ${filesChanged} modified, ${filesAdded} new`);

  if (testResults) {
    const icon = testResults.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`\nTest Results:    ${icon} — ${testResults.passed}/${testResults.total} passed`);
    if (testResults.coverage) console.log(`Coverage:        ${testResults.coverage}%`);
    if (testResults.duration) console.log(`Duration:        ${testResults.duration}`);
  }

  if (sessionWordCount > 0) {
    console.log(`\nSession Words:   ~${sessionWordCount}`);
  }
  if (phaseLines.length > 0) {
    console.log('\nPhase Completion:');
    for (const pl of phaseLines) {
      console.log(pl);
    }
  }

  console.log(`\nHallucination:   ${hallucinationRisk}`);
  if (hallucinationNotes.length > 0) {
    for (const note of hallucinationNotes) {
      console.log(`  WARNING: ${note}`);
    }
  }

  console.log('\n' + '='.repeat(50));

  // 6. Save session report
  const sessionReport = {
    timestamp: new Date().toISOString(),
    session_id: _sessionId,
    context: contextState || {},
    files: { changed: filesChanged, added: filesAdded },
    tests: testResults || null,
    hallucination: { risk: hallucinationRisk, notes: hallucinationNotes },
  };

  const reportPath = path.join(reportsDir, 'executions', `session-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(sessionReport, null, 2));

  // 7. Reset context state for next session
  if (fs.existsSync(contextFile)) {
    fs.unlinkSync(contextFile);
  }

} catch (err) {
  console.log(`[prompt-stats] Error: ${err.message}`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatNumber(n) {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1000000).toFixed(1)}M`;
}

process.exit(0);
