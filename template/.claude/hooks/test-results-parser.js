#!/usr/bin/env node

/**
 * test-results-parser.js — PostToolUse hook
 * Auto-detects and parses test results from Bash stdout.
 * Extracts pass/fail counts, coverage %, and saves structured data.
 * NOW: Compares against baseline to detect regressions (new failures, coverage drops).
 * Triggers on test execution commands (jest, vitest, pytest, go test, playwright, cypress, k6, etc.)
 */

const fs = require('fs');
const path = require('path');

const _projectRoot = process.cwd();
const REPORTS_DIR = path.join(_projectRoot, '.claude', 'reports', 'test-runs');
const reportsDir = path.join(_projectRoot, '.claude', 'reports');

function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (_) {}
}

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input, tool_output } = data;

    // Only process Bash tool results
    if (tool_name !== 'Bash' || !tool_output) return;

    const command = tool_input?.command || '';
    const stdout = tool_output?.stdout || tool_output || '';

    // Check if this was a test command
    if (!isTestCommand(command)) return;

    const result = parseTestOutput(command, stdout);
    if (!result) return;

    // Save structured result
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(REPORTS_DIR, `test-run-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      command: command.substring(0, 200),
      framework: result.framework,
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      skipped: result.skipped,
      duration: result.duration,
      coverage: result.coverage,
      status: result.failed > 0 ? 'FAIL' : 'PASS',
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // --- Regression Detection: compare against baseline ---
    const baselineFile = path.join(REPORTS_DIR, 'baseline.json');
    const latestFile = path.join(REPORTS_DIR, 'latest.json');
    let regressions = [];

    // Load previous latest as comparison point (or baseline if set)
    let baseline = null;
    if (fs.existsSync(baselineFile)) {
      try { baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8')); } catch (_) {}
    } else if (fs.existsSync(latestFile)) {
      try { baseline = JSON.parse(fs.readFileSync(latestFile, 'utf-8')); } catch (_) {}
    }

    if (baseline) {
      // Check: more failures than baseline
      if (report.failed > (baseline.failed || 0)) {
        const newFailures = report.failed - (baseline.failed || 0);
        regressions.push(`${newFailures} new test failure(s) (was ${baseline.failed || 0}, now ${report.failed})`);
      }

      // Check: fewer passes than baseline (tests removed or broken)
      if (report.passed < (baseline.passed || 0) && report.total >= (baseline.total || 0)) {
        const lostPasses = (baseline.passed || 0) - report.passed;
        regressions.push(`${lostPasses} previously passing test(s) now failing or removed`);
      }

      // Check: coverage drop
      if (baseline.coverage && report.coverage && report.coverage < baseline.coverage) {
        const drop = (baseline.coverage - report.coverage).toFixed(1);
        regressions.push(`Coverage dropped ${drop}% (was ${baseline.coverage}%, now ${report.coverage}%)`);
      }

      // Check: total tests decreased (tests were deleted)
      if (report.total < (baseline.total || 0) - (baseline.skipped || 0)) {
        const removed = (baseline.total || 0) - report.total;
        regressions.push(`${removed} test(s) removed from suite`);
      }

      // Check: more skipped tests than baseline
      if (report.skipped > (baseline.skipped || 0) + 1) {
        const newSkips = report.skipped - (baseline.skipped || 0);
        regressions.push(`${newSkips} test(s) newly skipped`);
      }
    }

    // Save regression info in report
    report.regressions = regressions;
    report.baseline_compared = baseline ? baseline.timestamp : null;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Update latest result pointer
    fs.writeFileSync(latestFile, JSON.stringify(report, null, 2));

    // Append to history
    const historyFile = path.join(REPORTS_DIR, 'history.jsonl');
    fs.appendFileSync(historyFile, JSON.stringify(report) + '\n');

    // Log regressions to task changes log
    if (regressions.length > 0) {
      const tasksDir = path.join(_projectRoot, '.claude', 'tasks');
      if (fs.existsSync(tasksDir)) {
        const taskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
        for (const tf of taskFiles) {
          const taskPath = path.join(tasksDir, tf);
          const content = fs.readFileSync(taskPath, 'utf-8');
          if (/status:\s*(DEVELOPING|DEV_TESTING|REVIEWING|CI_PENDING|QA_TESTING)/.test(content)) {
            const taskLogPath = taskPath.replace(/\.md$/, '_changes.log');
            const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
            fs.appendFileSync(taskLogPath, `| ${ts} | REGRESSION_DETECTED | ${regressions.join('; ')} |\n`);
            break;
          }
        }
      }
    }

    // Output summary to stderr
    const statusIcon = report.status === 'PASS' ? 'PASS' : 'FAIL';
    let output = `[test-parser] ${statusIcon}: ${report.passed}/${report.total} passed`;
    if (report.coverage) output += ` | Coverage: ${report.coverage}%`;
    if (report.duration) output += ` | ${report.duration}`;

    if (regressions.length > 0) {
      console.log(`\n=== REGRESSION DETECTED ===`);
      for (const r of regressions) {
        console.log(`  WARNING: ${r}`);
      }
      console.log(`Baseline: ${baseline.timestamp}`);
      console.log(`Fix regressions before advancing to next phase.`);
      console.log(`To update baseline after intentional changes: copy latest.json to baseline.json`);
      console.log(`=== END REGRESSION ===\n`);
    }

    process.stderr.write(output + '\n');
  } catch (e) {
    logHookFailure('test-results-parser', e.message);
  }
});

function isTestCommand(cmd) {
  const testPatterns = [
    /\b(jest|vitest|mocha|pytest|go\s+test|dotnet\s+test|rspec|cargo\s+test)\b/,
    /\b(playwright\s+test|cypress\s+run|detox\s+test|maestro\s+test)\b/,
    /\b(newman\s+run|hurl\s+--test|artillery\s+run|k6\s+run|locust)\b/,
    /\b(backstop\s+test|npx\s+test|npm\s+test|yarn\s+test|pnpm\s+test)\b/,
    /\bflutter\s+test\b/,
    /--coverage\b/,
  ];
  return testPatterns.some(p => p.test(cmd));
}

function parseTestOutput(command, output) {
  const parsers = [
    parseJestVitest, parsePytest, parseGoTest, parsePlaywright,
    parseCypress, parseMocha, parseK6, parseGeneric,
  ];
  for (const parser of parsers) {
    const result = parser(output);
    if (result) return result;
  }
  return null;
}

function parseJestVitest(output) {
  const testMatch = output.match(/Tests:\s+(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/i);
  if (!testMatch) return null;
  const passed = parseInt(testMatch[1] || '0');
  const failed = parseInt(testMatch[2] || '0');
  const skipped = parseInt(testMatch[3] || '0');
  const total = parseInt(testMatch[4] || '0');
  const covMatch = output.match(/All files\s*\|\s*([\d.]+)/);
  const coverage = covMatch ? parseFloat(covMatch[1]) : null;
  const timeMatch = output.match(/Time:\s+([\d.]+\s*m?s)/i);
  const duration = timeMatch ? timeMatch[1] : null;
  return { framework: 'jest/vitest', total, passed, failed, skipped, coverage, duration };
}

function parsePytest(output) {
  const match = output.match(/(?:(\d+)\s+passed)?[,\s]*(?:(\d+)\s+failed)?[,\s]*(?:(\d+)\s+skipped)?[,\s]*in\s+([\d.]+s)/i);
  if (!match) return null;
  const passed = parseInt(match[1] || '0');
  const failed = parseInt(match[2] || '0');
  const skipped = parseInt(match[3] || '0');
  const total = passed + failed + skipped;
  const covMatch = output.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
  const coverage = covMatch ? parseInt(covMatch[1]) : null;
  return { framework: 'pytest', total, passed, failed, skipped, coverage, duration: match[4] };
}

function parseGoTest(output) {
  const okMatches = (output.match(/^ok\s/gm) || []).length;
  const failMatches = (output.match(/^FAIL\s/gm) || []).length;
  if (okMatches === 0 && failMatches === 0) return null;
  const covMatch = output.match(/coverage:\s+([\d.]+)%/);
  const coverage = covMatch ? parseFloat(covMatch[1]) : null;
  return { framework: 'go-test', total: okMatches + failMatches, passed: okMatches, failed: failMatches, skipped: 0, coverage, duration: null };
}

function parsePlaywright(output) {
  const match = output.match(/(\d+)\s+passed(?:.*?(\d+)\s+failed)?(?:.*?(\d+)\s+skipped)?\s*\(([\d.]+[ms]+)\)/i);
  if (!match) return null;
  const passed = parseInt(match[1]);
  const failed = parseInt(match[2] || '0');
  const skipped = parseInt(match[3] || '0');
  return { framework: 'playwright', total: passed + failed + skipped, passed, failed, skipped, coverage: null, duration: match[4] };
}

function parseCypress(output) {
  const match = output.match(/Tests:\s+(\d+).*?Passing:\s+(\d+).*?Failing:\s+(\d+)/is);
  if (!match) return null;
  return { framework: 'cypress', total: parseInt(match[1]), passed: parseInt(match[2]), failed: parseInt(match[3]), skipped: 0, coverage: null, duration: null };
}

function parseMocha(output) {
  const passMatch = output.match(/(\d+)\s+passing\s*\(([\d.]+[ms]+)\)/i);
  if (!passMatch) return null;
  const passed = parseInt(passMatch[1]);
  const failMatch = output.match(/(\d+)\s+failing/i);
  const failed = failMatch ? parseInt(failMatch[1]) : 0;
  const skipMatch = output.match(/(\d+)\s+pending/i);
  const skipped = skipMatch ? parseInt(skipMatch[1]) : 0;
  return { framework: 'mocha', total: passed + failed + skipped, passed, failed, skipped, coverage: null, duration: passMatch[2] };
}

function parseK6(output) {
  const reqMatch = output.match(/http_reqs[.\s]+:\s+(\d+)/);
  if (!reqMatch) return null;
  const total = parseInt(reqMatch[1]);
  const failMatch = output.match(/http_req_failed[.\s]+:\s+([\d.]+)%/);
  const failRate = failMatch ? parseFloat(failMatch[1]) : 0;
  const failed = Math.round(total * failRate / 100);
  const p95Match = output.match(/http_req_duration[.\s]+:.*?p\(95\)=([\d.]+)/);
  const duration = p95Match ? `p95=${p95Match[1]}ms` : null;
  return { framework: 'k6', total, passed: total - failed, failed, skipped: 0, coverage: null, duration };
}

function parseGeneric(output) {
  const passMatch = output.match(/(\d+)\s+(?:pass(?:ed|ing)?|success)/i);
  const failMatch = output.match(/(\d+)\s+(?:fail(?:ed|ing|ure)?)/i);
  if (!passMatch && !failMatch) return null;
  const passed = passMatch ? parseInt(passMatch[1]) : 0;
  const failed = failMatch ? parseInt(failMatch[1]) : 0;
  return { framework: 'unknown', total: passed + failed, passed, failed, skipped: 0, coverage: null, duration: null };
}
