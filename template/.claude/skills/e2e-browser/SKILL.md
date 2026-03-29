---
name: e2e-browser
description: Run real browser E2E tests with Playwright or Cypress. Auto-detects framework, executes tests, captures screenshots/traces/videos, and generates evidence-based reports.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--framework playwright|cypress] [--headed] [--spec "pattern"] [--browser chromium|firefox|webkit|all] [--base-url "http://..."] [--update-snapshots]'
roles: [QA, TechLead, FrontendDev, FullStackDev]
agents: [@qa-automation, @tester, @qa-lead, @frontend]
---

# Browser E2E Testing: $ARGUMENTS

## Auto-Detection
Detect which browser testing framework is installed:
```bash
# Check Playwright
npx playwright --version 2>/dev/null && echo "FOUND: playwright" || echo "NOT_FOUND: playwright"
# Check Cypress
npx cypress --version 2>/dev/null && echo "FOUND: cypress" || echo "NOT_FOUND: cypress"
# Check config files
ls playwright.config.* 2>/dev/null || ls cypress.config.* 2>/dev/null || echo "NO_CONFIG"
```

If neither found, offer to install:
```bash
# Playwright (recommended — headless, fast, multi-browser)
npm install -D @playwright/test && npx playwright install --with-deps chromium
# OR Cypress
npm install -D cypress
```

## Phase 1: Environment Setup
Ensure the application is running before tests:
```bash
# Read CLAUDE.md for start commands
# Start backend
{backend-start-command} &
BACKEND_PID=$!
for i in $(seq 1 30); do curl -sf http://localhost:{port}/health && break || sleep 1; done

# Start frontend
{frontend-start-command} &
FRONTEND_PID=$!
for i in $(seq 1 30); do curl -sf http://localhost:{port} && break || sleep 1; done

echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
```

## Phase 2: Execute Tests

### Playwright Execution
```bash
# Full suite with all evidence collection
npx playwright test \
  --reporter=html,json,junit \
  --output=.claude/reports/e2e/artifacts \
  ${SPEC:+--grep "$SPEC"} \
  ${BROWSER:+--project="$BROWSER"} \
  ${HEADED:+--headed} \
  2>&1 | tee .claude/reports/e2e/playwright-output.txt

# Copy structured results
cp test-results/*.json .claude/reports/e2e/ 2>/dev/null
cp playwright-report/index.html .claude/reports/e2e/ 2>/dev/null

# Screenshot failed tests (auto-captured by Playwright on failure)
ls test-results/**/*.png 2>/dev/null && cp test-results/**/*.png .claude/reports/e2e/screenshots/

# Traces for debugging failures
ls test-results/**/*.zip 2>/dev/null && echo "Traces available in test-results/"
```

### Cypress Execution
```bash
# Headless with video and screenshots
npx cypress run \
  --reporter mocha-junit-reporter \
  --reporter-options mochaFile=.claude/reports/e2e/cypress-results.xml \
  ${SPEC:+--spec "$SPEC"} \
  ${BROWSER:+--browser "$BROWSER"} \
  ${HEADED:+--headed} \
  2>&1 | tee .claude/reports/e2e/cypress-output.txt

# Collect artifacts
cp -r cypress/screenshots .claude/reports/e2e/ 2>/dev/null
cp -r cypress/videos .claude/reports/e2e/ 2>/dev/null
```

## Phase 3: Parse Results & Generate Report

Parse test output and generate structured report:
```bash
mkdir -p .claude/reports/e2e/screenshots
```

### Report Template
```markdown
# Browser E2E Test Report
Date: {ISO timestamp}
Framework: {Playwright|Cypress}
Browser(s): {chromium, firefox, webkit}
Base URL: {url}

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | N |
| Passed | N |
| Failed | N |
| Skipped | N |
| Duration | Ns |
| Screenshots | N |
| Videos | N |

## Failed Tests
| # | Test Name | Error | Screenshot | Trace |
|---|-----------|-------|------------|-------|
| 1 | {test} | {error message} | {screenshot path} | {trace path} |

## Test Results by Suite
| Suite | Tests | Pass | Fail | Duration |
|-------|-------|------|------|----------|
| {suite name} | N | N | N | Ns |

## Browser Matrix (if multi-browser)
| Test | Chromium | Firefox | WebKit |
|------|----------|---------|--------|
| {test} | PASS | PASS | FAIL |

## Evidence
- Screenshots: `.claude/reports/e2e/screenshots/`
- Videos: `.claude/reports/e2e/videos/`
- Traces: `.claude/reports/e2e/traces/`
- HTML Report: `.claude/reports/e2e/index.html`
- Raw Output: `.claude/reports/e2e/{framework}-output.txt`

## Verdict
**PASS** — All {N} tests passed across {browsers}.
OR
**FAIL** — {N} failures detected. See Failed Tests above.
```

Save report to `.claude/reports/e2e/report-{date}.md`

## Phase 4: Cleanup
```bash
# Stop servers started in Phase 1
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
# Keep test artifacts for review — don't delete screenshots/videos
```

## Snapshot Updates
If `--update-snapshots` flag is passed:
```bash
# Playwright
npx playwright test --update-snapshots
# Cypress
npx cypress run --env updateSnapshots=true
```

## CI Integration
For CI environments (detected by `CI=true`):
```bash
# Playwright in CI
npx playwright install --with-deps
npx playwright test --reporter=github,json

# Cypress in CI (requires Xvfb on Linux)
npx cypress run --browser chrome --headless
```

## Definition of Done
- All tests executed against real running application
- Screenshots/videos captured for failures
- Structured report saved to `.claude/reports/e2e/`
- No test infrastructure left running (servers stopped)

## Rollback
- `--update-snapshots` to reset visual baselines
- Delete `.claude/reports/e2e/` to clear old reports
