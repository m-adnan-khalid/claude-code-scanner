---
name: accessibility-audit
description: WCAG 2.1 AA/AAA accessibility audit using axe-core, Pa11y, and Lighthouse. Scans for color contrast, keyboard navigation, screen reader, semantic HTML, ARIA, and focus management issues.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--level AA|AAA] [--scope full|page|component] [--url "http://..."] [--fix] [--ci]'
---

# Accessibility Audit: $ARGUMENTS

## Auto-Detection
```bash
# Check installed tools
npx axe --version 2>/dev/null && echo "FOUND: axe-core"
npx pa11y --version 2>/dev/null && echo "FOUND: pa11y"
npx lighthouse --version 2>/dev/null && echo "FOUND: lighthouse"
grep -q "@axe-core" package.json 2>/dev/null && echo "INTEGRATED: axe-playwright/axe-cypress"

# Check for existing a11y setup
ls .axe* a11y* accessibility* 2>/dev/null
grep -r "axe\|a11y\|accessibility\|aria" tests/ 2>/dev/null | head -5
```

If no tools found:
```bash
npm install -D @axe-core/cli pa11y pa11y-ci lighthouse
```

## Phase 1: Automated Scanning

### axe-core CLI (WCAG 2.1 AA — fastest, most accurate)
```bash
mkdir -p .claude/reports/accessibility

# Scan single page
npx axe ${URL:-http://localhost:3000} \
  --tags wcag2a,wcag2aa${LEVEL:+,wcag2aaa} \
  --save .claude/reports/accessibility/axe-results.json \
  2>&1 | tee .claude/reports/accessibility/axe-output.txt

# Scan multiple pages
for page in "/" "/login" "/dashboard" "/settings"; do
  npx axe "${BASE_URL:-http://localhost:3000}${page}" \
    --tags wcag2a,wcag2aa \
    --save ".claude/reports/accessibility/axe-$(echo $page | tr '/' '-').json" \
    2>&1
done | tee .claude/reports/accessibility/axe-all-output.txt
```

### axe-core with Playwright (deep — handles SPAs, auth, dynamic content)
```bash
# If @axe-core/playwright is installed
npx playwright test tests/accessibility/ \
  --reporter=json \
  --output=.claude/reports/accessibility/playwright-axe/ \
  2>&1 | tee .claude/reports/accessibility/playwright-axe-output.txt
```

Generate a11y test if none exists:
```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/login', '/dashboard', '/settings'];

for (const path of pages) {
  test(`accessibility: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

### Pa11y (WCAG + HTML CodeSniffer)
```bash
# Single page
npx pa11y ${URL:-http://localhost:3000} \
  --standard WCAG2AA \
  --reporter json \
  > .claude/reports/accessibility/pa11y-results.json \
  2>&1 | tee .claude/reports/accessibility/pa11y-output.txt

# Multi-page with pa11y-ci
cat > .pa11yci.json << 'EOF'
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 1000
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/login",
    "http://localhost:3000/dashboard"
  ]
}
EOF

npx pa11y-ci --config .pa11yci.json \
  --json > .claude/reports/accessibility/pa11y-ci-results.json \
  2>&1 | tee .claude/reports/accessibility/pa11y-ci-output.txt
```

### Lighthouse Accessibility Score
```bash
npx lighthouse ${URL:-http://localhost:3000} \
  --only-categories=accessibility \
  --output=json,html \
  --output-path=.claude/reports/accessibility/lighthouse \
  --chrome-flags="--headless --no-sandbox" \
  2>&1 | tee .claude/reports/accessibility/lighthouse-output.txt
```

## Phase 2: Manual Code Review Checklist

The agent reviews source code for issues automated tools miss:

### Semantic HTML
- [ ] Headings follow hierarchy (h1 → h2 → h3, no skips)
- [ ] Lists use `<ul>/<ol>/<dl>`, not styled `<div>`s
- [ ] Tables have `<th>`, `<caption>`, and `scope` attributes
- [ ] Forms have `<label>` elements linked to inputs via `for`/`id`
- [ ] Navigation uses `<nav>`, main content uses `<main>`, sidebar uses `<aside>`
- [ ] Buttons are `<button>`, links are `<a>` (not `<div onClick>`)

### ARIA & Roles
- [ ] Dynamic content has `aria-live` regions (polite for updates, assertive for alerts)
- [ ] Custom widgets have correct `role`, `aria-expanded`, `aria-selected`, `aria-checked`
- [ ] Modals trap focus and have `aria-modal="true"` + `role="dialog"`
- [ ] No redundant ARIA (e.g., `role="button"` on `<button>`)
- [ ] `aria-label` or `aria-labelledby` on all interactive elements without visible text

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus order follows visual layout (no tabindex > 0)
- [ ] Focus visible on all interactive elements (`:focus-visible` styles)
- [ ] Escape closes modals/dropdowns and returns focus to trigger
- [ ] No keyboard traps (user can always Tab out)
- [ ] Skip-to-content link present

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (AA) or ≥ 7:1 (AAA)
- [ ] Large text contrast ratio ≥ 3:1 (AA) or ≥ 4.5:1 (AAA)
- [ ] UI components contrast ≥ 3:1 against background
- [ ] Information not conveyed by color alone (icons, patterns, text labels)
- [ ] Focus indicators have ≥ 3:1 contrast

### Images & Media
- [ ] All `<img>` have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Complex images have `aria-describedby` with long description
- [ ] SVG icons have `<title>` or `aria-label`
- [ ] Videos have captions and transcripts
- [ ] Audio has transcripts
- [ ] No auto-playing media

### Forms
- [ ] All inputs have associated labels
- [ ] Required fields marked with `aria-required` and visual indicator
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] Form validation errors announced to screen readers
- [ ] Autocomplete attributes on address/payment fields

### Motion & Animation
- [ ] `prefers-reduced-motion` media query respected
- [ ] No flashing content (> 3 flashes per second)
- [ ] Animations can be paused/stopped
- [ ] Carousels have pause controls

### Touch (Mobile)
- [ ] Touch targets ≥ 44x44px (iOS) / 48x48dp (Android)
- [ ] Adequate spacing between touch targets (≥ 8px)
- [ ] Gestures have alternative controls (swipe → button)

## Phase 3: Report

```markdown
# Accessibility Audit Report
Date: {ISO timestamp}
Standard: WCAG 2.1 {AA|AAA}
URL: {base url}
Tools: {axe-core, Pa11y, Lighthouse}

## Score Summary
| Tool | Score | Issues | Critical | Serious | Moderate | Minor |
|------|-------|--------|----------|---------|----------|-------|
| axe-core | — | N | N | N | N | N |
| Pa11y | — | N | N | N | N | N |
| Lighthouse | N/100 | N | — | — | — | — |

## WCAG Compliance Matrix
| Criterion | Level | Status | Issues |
|-----------|-------|--------|--------|
| 1.1.1 Non-text Content | A | PASS/FAIL | N |
| 1.3.1 Info and Relationships | A | PASS/FAIL | N |
| 1.4.3 Contrast (Minimum) | AA | PASS/FAIL | N |
| 1.4.6 Contrast (Enhanced) | AAA | PASS/FAIL | N |
| 2.1.1 Keyboard | A | PASS/FAIL | N |
| 2.4.3 Focus Order | A | PASS/FAIL | N |
| 2.4.7 Focus Visible | AA | PASS/FAIL | N |
| 4.1.2 Name, Role, Value | A | PASS/FAIL | N |

## Issues by Severity
| # | Severity | WCAG | Element | Issue | Fix |
|---|----------|------|---------|-------|-----|
| 1 | Critical | 1.1.1 | `img.hero` | Missing alt text | Add descriptive alt |
| 2 | Serious | 1.4.3 | `.btn-secondary` | Contrast 2.8:1 (needs 4.5:1) | Darken text color |

## Pages Scanned
| Page | Issues | Critical | Lighthouse Score |
|------|--------|----------|-----------------|
| / | N | N | N/100 |
| /login | N | N | N/100 |

## Manual Review Findings
| Category | Status | Notes |
|----------|--------|-------|
| Semantic HTML | PASS/FAIL | {details} |
| Keyboard Navigation | PASS/FAIL | {details} |
| Screen Reader | PASS/FAIL | {details} |
| Color Independence | PASS/FAIL | {details} |
| Focus Management | PASS/FAIL | {details} |
| Motion/Animation | PASS/FAIL | {details} |

## Evidence
- axe results: `.claude/reports/accessibility/axe-results.json`
- Pa11y results: `.claude/reports/accessibility/pa11y-results.json`
- Lighthouse report: `.claude/reports/accessibility/lighthouse.report.html`

## Verdict
**PASS** — WCAG 2.1 {level} compliant. {N} minor issues noted.
OR
**FAIL** — {N} critical/{N} serious violations. See Issues above.
```

Save to `.claude/reports/accessibility/report-{date}.md`

## CI Integration
```bash
# Add to CI pipeline
npx pa11y-ci --config .pa11yci.json --threshold 0
npx axe ${URL} --tags wcag2a,wcag2aa --exit
```

## Definition of Done
- Automated scan with axe-core + Pa11y + Lighthouse completed
- Manual code review checklist evaluated
- All critical/serious issues documented with fix guidance
- Lighthouse accessibility score ≥ 90
- Report saved to `.claude/reports/accessibility/`
