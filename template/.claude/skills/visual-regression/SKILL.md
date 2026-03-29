---
name: visual-regression
description: Run visual regression tests — capture screenshots and compare against baselines using Playwright, BackstopJS, or Percy. Detects CSS/layout regressions automatically.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--tool playwright|backstop|percy] [--update-baselines] [--pages "url1,url2"] [--viewports "1280x720,768x1024,375x812"] [--threshold 0.1]'
roles: [QA, FrontendDev, FullStackDev, Designer]
agents: [@qa-automation, @frontend, @ux-designer]
---

# Visual Regression Testing: $ARGUMENTS

## Auto-Detection
```bash
# Check available tools
npx playwright --version 2>/dev/null && echo "FOUND: playwright"
npx backstop --version 2>/dev/null && echo "FOUND: backstop"
npx percy --version 2>/dev/null && echo "FOUND: percy"
ls backstop.json 2>/dev/null && echo "CONFIG: backstop"
ls playwright.config.* 2>/dev/null && echo "CONFIG: playwright"
```

If no tool found, install BackstopJS (zero-config visual testing):
```bash
npm install -D backstopjs
npx backstop init
```

## Tool 1: Playwright Visual Comparisons (Recommended)

### Setup (if no visual tests exist)
Generate visual test file:
```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  // Add more pages from CLAUDE.md routes
];

const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const page of pages) {
  for (const viewport of viewports) {
    test(`${page.name} - ${viewport.name}`, async ({ page: p }) => {
      await p.setViewportSize({ width: viewport.width, height: viewport.height });
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');
      await expect(p).toHaveScreenshot(`${page.name}-${viewport.name}.png`, {
        maxDiffPixelRatio: 0.01,
        threshold: 0.1,
      });
    });
  }
}
```

### Execute
```bash
mkdir -p .claude/reports/visual

# First run — create baselines
npx playwright test tests/visual-regression.spec.ts --update-snapshots \
  2>&1 | tee .claude/reports/visual/playwright-output.txt

# Subsequent runs — compare against baselines
npx playwright test tests/visual-regression.spec.ts \
  --reporter=html \
  2>&1 | tee .claude/reports/visual/playwright-output.txt

# Copy diff images
cp -r test-results/ .claude/reports/visual/diffs/ 2>/dev/null
cp -r playwright-report/ .claude/reports/visual/html-report/ 2>/dev/null
```

## Tool 2: BackstopJS

### Config (if none exists)
```json
{
  "id": "visual-regression",
  "viewports": [
    { "label": "desktop", "width": 1280, "height": 720 },
    { "label": "tablet", "width": 768, "height": 1024 },
    { "label": "mobile", "width": 375, "height": 812 }
  ],
  "scenarios": [
    {
      "label": "Home Page",
      "url": "http://localhost:3000/",
      "delay": 1000,
      "misMatchThreshold": 0.1
    },
    {
      "label": "Login Page",
      "url": "http://localhost:3000/login",
      "delay": 1000,
      "misMatchThreshold": 0.1
    }
  ],
  "paths": {
    "bitmaps_reference": ".claude/reports/visual/baselines",
    "bitmaps_test": ".claude/reports/visual/test-screenshots",
    "html_report": ".claude/reports/visual/backstop-report",
    "ci_report": ".claude/reports/visual/backstop-ci"
  },
  "engine": "playwright",
  "engineOptions": { "args": ["--no-sandbox"] },
  "report": ["browser", "CI"],
  "debug": false
}
```

### Execute
```bash
mkdir -p .claude/reports/visual

# Create baselines (first run or after intentional changes)
npx backstop reference --config=backstop.json \
  2>&1 | tee .claude/reports/visual/backstop-reference.txt

# Run comparison
npx backstop test --config=backstop.json \
  2>&1 | tee .claude/reports/visual/backstop-output.txt

# Approve changes (update baselines)
npx backstop approve --config=backstop.json
```

## Tool 3: Percy (Cloud-based)
```bash
# Requires PERCY_TOKEN env var
npx percy snapshot ./snapshots.yml \
  2>&1 | tee .claude/reports/visual/percy-output.txt

# Or with Playwright
npx percy exec -- npx playwright test tests/visual-regression.spec.ts
```

## Report Template
```markdown
# Visual Regression Report
Date: {ISO timestamp}
Tool: {Playwright|BackstopJS|Percy}
Base URL: {url}
Threshold: {mismatch %}

## Summary
| Metric | Value |
|--------|-------|
| Pages Tested | N |
| Viewports | N |
| Total Screenshots | N |
| Matches (no change) | N |
| Diffs Detected | N |
| New (no baseline) | N |

## Results by Page
| Page | Desktop | Tablet | Mobile | Status |
|------|---------|--------|--------|--------|
| Home | MATCH | MATCH | DIFF (2.3%) | REVIEW |
| Login | MATCH | MATCH | MATCH | PASS |
| Dashboard | NEW | NEW | NEW | BASELINE |

## Diffs Detected
| # | Page | Viewport | Mismatch % | Diff Image | Description |
|---|------|----------|------------|------------|-------------|
| 1 | Home | mobile | 2.3% | home-mobile-diff.png | Button shifted 5px |

## Evidence
- Baselines: `.claude/reports/visual/baselines/`
- Test Screenshots: `.claude/reports/visual/test-screenshots/`
- Diff Images: `.claude/reports/visual/diffs/`
- HTML Report: `.claude/reports/visual/{tool}-report/`

## Verdict
**PASS** — No visual regressions detected.
OR
**REVIEW** — {N} diffs detected. Review diff images above.
OR
**BASELINE** — {N} new screenshots captured as baselines.
```

Save to `.claude/reports/visual/report-{date}.md`

## Update Baselines
When visual changes are intentional:
```bash
# Playwright
npx playwright test --update-snapshots
# BackstopJS
npx backstop approve
# Percy
# Approve in Percy dashboard
```

## Definition of Done
- Screenshots captured for all configured pages and viewports
- Compared against baselines (or baselines created on first run)
- Diff images generated for any mismatches
- Structured report saved to `.claude/reports/visual/`
