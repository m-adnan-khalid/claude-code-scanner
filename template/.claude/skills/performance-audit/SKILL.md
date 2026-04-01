---
name: performance-audit
description: Web performance audit using Lighthouse, Core Web Vitals measurement, performance budget enforcement, and bundle size analysis. Detects LCP, FID/INP, CLS regressions.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--tool lighthouse|bundlesize|all] [--url "http://..."] [--budget "path"] [--pages "url1,url2"] [--threshold 90]'
roles: [FrontendDev, FullStackDev, TechLead, QA]
agents: [@frontend, @qa-automation, @code-quality]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# Performance Audit: $ARGUMENTS

## Auto-Detection
```bash
# Check tools
npx lighthouse --version 2>/dev/null && echo "FOUND: lighthouse"
npx bundlesize --version 2>/dev/null && echo "FOUND: bundlesize"
npx size-limit --version 2>/dev/null && echo "FOUND: size-limit"
npx source-map-explorer --version 2>/dev/null && echo "FOUND: source-map-explorer"

# Check for existing performance config
ls .lighthouserc.* lighthouse*.json budgets.json .size-limit* 2>/dev/null
```

If no tools:
```bash
npm install -D lighthouse @lhci/cli
```

## Phase 1: Lighthouse Full Audit

```bash
mkdir -p .claude/reports/performance

# Full Lighthouse audit (performance + best practices)
npx lighthouse ${URL:-http://localhost:3000} \
  --only-categories=performance,best-practices \
  --output=json,html \
  --output-path=.claude/reports/performance/lighthouse \
  --chrome-flags="--headless --no-sandbox" \
  --throttling.cpuSlowdownMultiplier=4 \
  2>&1 | tee .claude/reports/performance/lighthouse-output.txt

# Multi-page audit
for page in "/" "/login" "/dashboard"; do
  npx lighthouse "${BASE_URL:-http://localhost:3000}${page}" \
    --only-categories=performance \
    --output=json \
    --output-path=".claude/reports/performance/lighthouse$(echo $page | tr '/' '-')" \
    --chrome-flags="--headless --no-sandbox" \
    2>&1
done | tee .claude/reports/performance/lighthouse-all-output.txt
```

### Extract Core Web Vitals from Lighthouse
```bash
python3 -c "
import json
with open('.claude/reports/performance/lighthouse.report.json') as f:
    data = json.load(f)
audits = data.get('audits', {})
metrics = {
    'Performance Score': data.get('categories', {}).get('performance', {}).get('score', 0) * 100,
    'LCP (Largest Contentful Paint)': audits.get('largest-contentful-paint', {}).get('displayValue', 'N/A'),
    'FID / INP (Interaction to Next Paint)': audits.get('interactive', {}).get('displayValue', 'N/A'),
    'CLS (Cumulative Layout Shift)': audits.get('cumulative-layout-shift', {}).get('displayValue', 'N/A'),
    'FCP (First Contentful Paint)': audits.get('first-contentful-paint', {}).get('displayValue', 'N/A'),
    'TTFB (Time to First Byte)': audits.get('server-response-time', {}).get('displayValue', 'N/A'),
    'TBT (Total Blocking Time)': audits.get('total-blocking-time', {}).get('displayValue', 'N/A'),
    'Speed Index': audits.get('speed-index', {}).get('displayValue', 'N/A'),
}
for k, v in metrics.items():
    print(f'{k}: {v}')
" 2>/dev/null
```

## Phase 2: Bundle Size Analysis

### JavaScript Bundle Analysis
```bash
# Webpack bundle analyzer
npx webpack-bundle-analyzer stats.json --mode static \
  --report .claude/reports/performance/bundle-report.html \
  --no-open 2>/dev/null

# Or source-map-explorer for any bundler
npx source-map-explorer dist/**/*.js \
  --html .claude/reports/performance/source-map.html \
  2>/dev/null

# Or size-limit
npx size-limit --json > .claude/reports/performance/size-limit.json 2>/dev/null

# Check total bundle sizes
echo "=== Bundle Sizes ==="
du -sh dist/ build/ .next/ out/ 2>/dev/null
find dist/ build/ .next/ -name "*.js" -exec du -sh {} \; 2>/dev/null | sort -rh | head -20
```

### Image Optimization Check
```bash
echo "=== Large Images (> 200KB) ==="
find . -path ./node_modules -prune -o \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \) -size +200k -print -exec du -sh {} \;

echo "=== Images without WebP/AVIF alternative ==="
find public/ src/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | head -20
```

## Phase 3: Performance Budget Enforcement

### Define Budget (if none exists)
```json
// performance-budget.json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "stylesheet", "budget": 100 },
        { "resourceType": "image", "budget": 500 },
        { "resourceType": "font", "budget": 100 },
        { "resourceType": "total", "budget": 1000 }
      ],
      "resourceCounts": [
        { "resourceType": "script", "budget": 15 },
        { "resourceType": "stylesheet", "budget": 5 }
      ],
      "timings": [
        { "metric": "largest-contentful-paint", "budget": 2500 },
        { "metric": "cumulative-layout-shift", "budget": 0.1 },
        { "metric": "total-blocking-time", "budget": 300 },
        { "metric": "first-contentful-paint", "budget": 1800 },
        { "metric": "interactive", "budget": 3800 }
      ]
    }
  ]
}
```

### Enforce Budget
```bash
npx lighthouse ${URL:-http://localhost:3000} \
  --budget-path=performance-budget.json \
  --output=json \
  --output-path=.claude/reports/performance/budget-check \
  --chrome-flags="--headless --no-sandbox" \
  2>&1 | tee .claude/reports/performance/budget-output.txt
```

## Phase 4: Code-Level Performance Review

### Check for Common Performance Issues
```bash
# Large dependencies
npx depcheck --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print('Unused deps:', d.get('dependencies',[])); print('Missing deps:', d.get('missing',{}).keys())" 2>/dev/null

# N+1 query detection (look for DB queries in loops)
grep -rn --include="*.{ts,js,py,rb,go}" \
  -E "for.*\{|\.forEach|\.map\(|for .* in " \
  . | grep -i "query\|find\|select\|fetch\|get" 2>/dev/null | head -20

# Missing pagination
grep -rn --include="*.{ts,js,py,rb,go}" \
  -iE "findAll|find_all|\.all\(\)|SELECT \*" \
  . 2>/dev/null | head -20

# Unoptimized images in code
grep -rn --include="*.{tsx,jsx,vue,svelte,html}" \
  -E '<img[^>]+src=' . 2>/dev/null | grep -v "loading=" | head -10
```

### Performance Checklist
- [ ] Images use lazy loading (`loading="lazy"`)
- [ ] Images use modern formats (WebP/AVIF) with fallbacks
- [ ] Images have explicit width/height (prevents CLS)
- [ ] JavaScript is code-split / lazy loaded
- [ ] Critical CSS is inlined / above the fold
- [ ] Fonts use `font-display: swap` or `optional`
- [ ] Third-party scripts are async/deferred
- [ ] API responses are paginated (no unbounded lists)
- [ ] Database queries are indexed
- [ ] Static assets have cache headers
- [ ] Compression enabled (gzip/brotli)
- [ ] HTTP/2 or HTTP/3 used
- [ ] Preconnect/preload for critical resources

## Report Template

```markdown
# Performance Audit Report
Date: {ISO timestamp}
URL: {base url}
Tool: Lighthouse {version}

## Core Web Vitals
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (Largest Contentful Paint) | {N}s | < 2.5s | GOOD/NEEDS WORK/POOR |
| INP (Interaction to Next Paint) | {N}ms | < 200ms | GOOD/NEEDS WORK/POOR |
| CLS (Cumulative Layout Shift) | {N} | < 0.1 | GOOD/NEEDS WORK/POOR |
| FCP (First Contentful Paint) | {N}s | < 1.8s | GOOD/NEEDS WORK/POOR |
| TTFB (Time to First Byte) | {N}ms | < 800ms | GOOD/NEEDS WORK/POOR |
| TBT (Total Blocking Time) | {N}ms | < 300ms | GOOD/NEEDS WORK/POOR |

## Lighthouse Scores
| Category | Score | Status |
|----------|-------|--------|
| Performance | N/100 | PASS (≥90) / WARN (50-89) / FAIL (<50) |
| Best Practices | N/100 | PASS/WARN/FAIL |

## Bundle Analysis
| Resource | Size | Budget | Status |
|----------|------|--------|--------|
| JavaScript (total) | NKB | 300KB | PASS/FAIL |
| CSS (total) | NKB | 100KB | PASS/FAIL |
| Images (total) | NKB | 500KB | PASS/FAIL |
| Fonts (total) | NKB | 100KB | PASS/FAIL |

## Largest Bundles
| File | Size | % of Total |
|------|------|-----------|
| {file} | NKB | N% |

## Pages Comparison
| Page | LCP | CLS | TBT | Score |
|------|-----|-----|-----|-------|
| / | Ns | N | Nms | N |
| /login | Ns | N | Nms | N |
| /dashboard | Ns | N | Nms | N |

## Issues Found
| # | Impact | Issue | Savings | Fix |
|---|--------|-------|---------|-----|
| 1 | HIGH | Render-blocking JS | -1.2s | Code-split + async |
| 2 | MEDIUM | Unoptimized images | -500KB | Convert to WebP |

## Evidence
- Lighthouse HTML: `.claude/reports/performance/lighthouse.report.html`
- Lighthouse JSON: `.claude/reports/performance/lighthouse.report.json`
- Bundle report: `.claude/reports/performance/bundle-report.html`

## Verdict
**PASS** — Lighthouse score ≥ {threshold}, all CWV in "Good" range.
OR
**FAIL** — Score {N}/100, {N} CWV in "Poor" range. See Issues above.
```

Save to `.claude/reports/performance/report-{date}.md`

## Definition of Done
- Lighthouse audit completed with scores
- Core Web Vitals measured and evaluated
- Bundle sizes analyzed
- Performance budget checked (if defined)
- Code-level performance issues flagged
- Report saved to `.claude/reports/performance/`

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
