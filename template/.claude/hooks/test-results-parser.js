#!/usr/bin/env node

/**
 * test-results-parser.js — PostToolUse hook
 * Auto-detects and parses test results from Bash stdout.
 * Extracts pass/fail counts, coverage %, and saves structured data.
 * Triggers on test execution commands (jest, vitest, pytest, go test, playwright, cypress, k6, etc.)
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(process.cwd(), '.claude', 'reports', 'test-runs');

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

    // Update latest result pointer
    const latestFile = path.join(REPORTS_DIR, 'latest.json');
    fs.writeFileSync(latestFile, JSON.stringify(report, null, 2));

    // Append to history
    const historyFile = path.join(REPORTS_DIR, 'history.jsonl');
    fs.appendFileSync(historyFile, JSON.stringify(report) + '\n');

    // Output summary to stderr (visible as hook feedback)
    const statusIcon = report.status === 'PASS' ? 'PASS' : 'FAIL';
    process.stderr.write(
      `[test-parser] ${statusIcon}: ${report.passed}/${report.total} passed` +
      (report.coverage ? ` | Coverage: ${report.coverage}%` : '') +
      (report.duration ? ` | ${report.duration}` : '') + '\n'
    );
  } catch (e) {
    // Silent fail — don't block the workflow
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
  // Try each parser until one matches
  const parsers = [
    parseJestVitest,
    parsePytest,
    parseGoTest,
    parsePlaywright,
    parseCypress,
    parseMocha,
    parseK6,
    parseGeneric,
  ];

  for (const parser of parsers) {
    const result = parser(output);
    if (result) return result;
  }
  return null;
}

function parseJestVitest(output) {
  // Jest/Vitest: "Tests: 5 passed, 2 failed, 7 total"
  const testMatch = output.match(/Tests:\s+(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/i);
  if (!testMatch) return null;

  const passed = parseInt(testMatch[1] || '0');
  const failed = parseInt(testMatch[2] || '0');
  const skipped = parseInt(testMatch[3] || '0');
  const total = parseInt(testMatch[4] || '0');

  // Coverage: "All files | 85.71 | 80 | 90 | 85.71"
  const covMatch = output.match(/All files\s*\|\s*([\d.]+)/);
  const coverage = covMatch ? parseFloat(covMatch[1]) : null;

  // Duration: "Time: 5.234 s"
  const timeMatch = output.match(/Time:\s+([\d.]+\s*m?s)/i);
  const duration = timeMatch ? timeMatch[1] : null;

  return { framework: 'jest/vitest', total, passed, failed, skipped, coverage, duration };
}

function parsePytest(output) {
  // pytest: "5 passed, 2 failed, 1 skipped in 3.45s"
  const match = output.match(/(?:(\d+)\s+passed)?[,\s]*(?:(\d+)\s+failed)?[,\s]*(?:(\d+)\s+skipped)?[,\s]*in\s+([\d.]+s)/i);
  if (!match) return null;

  const passed = parseInt(match[1] || '0');
  const failed = parseInt(match[2] || '0');
  const skipped = parseInt(match[3] || '0');
  const total = passed + failed + skipped;

  // Coverage: "TOTAL    500    425    85%"
  const covMatch = output.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
  const coverage = covMatch ? parseInt(covMatch[1]) : null;

  return { framework: 'pytest', total, passed, failed, skipped, coverage, duration: match[4] };
}

function parseGoTest(output) {
  // Go: "ok  pkg 0.045s" and "FAIL pkg 0.123s"
  const okMatches = (output.match(/^ok\s/gm) || []).length;
  const failMatches = (output.match(/^FAIL\s/gm) || []).length;
  if (okMatches === 0 && failMatches === 0) return null;

  // "coverage: 85.0% of statements"
  const covMatch = output.match(/coverage:\s+([\d.]+)%/);
  const coverage = covMatch ? parseFloat(covMatch[1]) : null;

  return {
    framework: 'go-test',
    total: okMatches + failMatches,
    passed: okMatches,
    failed: failMatches,
    skipped: 0,
    coverage,
    duration: null,
  };
}

function parsePlaywright(output) {
  // Playwright: "5 passed (3.2s)" or "3 passed, 2 failed (5.1s)"
  const match = output.match(/(\d+)\s+passed(?:.*?(\d+)\s+failed)?(?:.*?(\d+)\s+skipped)?\s*\(([\d.]+[ms]+)\)/i);
  if (!match) return null;

  const passed = parseInt(match[1]);
  const failed = parseInt(match[2] || '0');
  const skipped = parseInt(match[3] || '0');

  return { framework: 'playwright', total: passed + failed + skipped, passed, failed, skipped, coverage: null, duration: match[4] };
}

function parseCypress(output) {
  // Cypress: "Tests: 5, Passing: 4, Failing: 1"
  const match = output.match(/Tests:\s+(\d+).*?Passing:\s+(\d+).*?Failing:\s+(\d+)/is);
  if (!match) return null;

  return {
    framework: 'cypress',
    total: parseInt(match[1]),
    passed: parseInt(match[2]),
    failed: parseInt(match[3]),
    skipped: 0,
    coverage: null,
    duration: null,
  };
}

function parseMocha(output) {
  // Mocha: "5 passing (3s)" and "2 failing"
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
  // k6: "http_reqs......................: 1234  45.67/s"
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
  // Generic: look for common patterns
  const passMatch = output.match(/(\d+)\s+(?:pass(?:ed|ing)?|success)/i);
  const failMatch = output.match(/(\d+)\s+(?:fail(?:ed|ing|ure)?)/i);
  if (!passMatch && !failMatch) return null;

  const passed = passMatch ? parseInt(passMatch[1]) : 0;
  const failed = failMatch ? parseInt(failMatch[1]) : 0;

  return { framework: 'unknown', total: passed + failed, passed, failed, skipped: 0, coverage: null, duration: null };
}
