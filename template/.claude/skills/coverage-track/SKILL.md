---
name: coverage-track
description: Parse real coverage reports (Istanbul/c8/coverage.py/go cover/lcov), track deltas across runs, enforce thresholds, and generate trend reports.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: '[--threshold 80] [--compare "baseline|last"] [--format lcov|cobertura|clover|json] [--fail-under 70]'
roles: [QA, TechLead]
agents: [@tester, @qa-lead, @qa-automation]
---

# Coverage Tracking: $ARGUMENTS

## Auto-Detection
```bash
# Detect coverage tools and reports
ls coverage/lcov.info 2>/dev/null && echo "FORMAT: lcov (Istanbul/c8)"
ls coverage/cobertura-coverage.xml 2>/dev/null && echo "FORMAT: cobertura"
ls coverage/clover.xml 2>/dev/null && echo "FORMAT: clover"
ls coverage/coverage-summary.json 2>/dev/null && echo "FORMAT: json (Istanbul)"
ls htmlcov/ 2>/dev/null && echo "FORMAT: coverage.py"
ls coverage.out 2>/dev/null && echo "FORMAT: go-cover"
ls coverage/ 2>/dev/null && echo "DIR: coverage/"

# Detect test runner
grep -q '"jest"' package.json 2>/dev/null && echo "RUNNER: jest"
grep -q '"vitest"' package.json 2>/dev/null && echo "RUNNER: vitest"
grep -q '"c8"' package.json 2>/dev/null && echo "RUNNER: c8"
[ -f pytest.ini ] || [ -f pyproject.toml ] && echo "RUNNER: pytest"
ls *_test.go 2>/dev/null && echo "RUNNER: go-test"
```

## Phase 1: Run Tests with Coverage

### JavaScript/TypeScript
```bash
# Jest
npx jest --coverage --coverageReporters=json-summary --coverageReporters=lcov --coverageReporters=text \
  2>&1 | tee .claude/reports/coverage/test-output.txt

# Vitest
npx vitest run --coverage --coverage.reporter=json-summary --coverage.reporter=lcov --coverage.reporter=text \
  2>&1 | tee .claude/reports/coverage/test-output.txt

# c8 (for Node.js)
npx c8 --reporter=json-summary --reporter=lcov --reporter=text npm test \
  2>&1 | tee .claude/reports/coverage/test-output.txt
```

### Python
```bash
# Pytest with coverage
python -m pytest --cov=. --cov-report=json --cov-report=html --cov-report=term-missing \
  2>&1 | tee .claude/reports/coverage/test-output.txt
cp .coverage coverage.json htmlcov/ .claude/reports/coverage/ 2>/dev/null
```

### Go
```bash
go test -coverprofile=coverage.out -covermode=atomic ./... \
  2>&1 | tee .claude/reports/coverage/test-output.txt
go tool cover -func=coverage.out > .claude/reports/coverage/coverage-func.txt
go tool cover -html=coverage.out -o .claude/reports/coverage/coverage.html
```

### .NET
```bash
dotnet test --collect:"XPlat Code Coverage" --results-directory .claude/reports/coverage/ \
  2>&1 | tee .claude/reports/coverage/test-output.txt
```

## Phase 2: Parse Coverage Data

### Parse Istanbul/c8 JSON Summary
```bash
mkdir -p .claude/reports/coverage

# Extract key metrics from coverage-summary.json
if [ -f coverage/coverage-summary.json ]; then
  python3 -c "
import json, sys
with open('coverage/coverage-summary.json') as f:
    data = json.load(f)
total = data.get('total', {})
print(f'Lines:      {total.get(\"lines\", {}).get(\"pct\", 0)}%')
print(f'Statements: {total.get(\"statements\", {}).get(\"pct\", 0)}%')
print(f'Functions:  {total.get(\"functions\", {}).get(\"pct\", 0)}%')
print(f'Branches:   {total.get(\"branches\", {}).get(\"pct\", 0)}%')
# Save parsed data
json.dump({
    'timestamp': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'lines': total.get('lines', {}).get('pct', 0),
    'statements': total.get('statements', {}).get('pct', 0),
    'functions': total.get('functions', {}).get('pct', 0),
    'branches': total.get('branches', {}).get('pct', 0),
    'lines_total': total.get('lines', {}).get('total', 0),
    'lines_covered': total.get('lines', {}).get('covered', 0),
}, open('.claude/reports/coverage/parsed-coverage.json', 'w'), indent=2)
"
fi
```

### Parse LCOV
```bash
if [ -f coverage/lcov.info ]; then
  python3 -c "
import re
with open('coverage/lcov.info') as f:
    content = f.read()
lines_found = sum(int(x) for x in re.findall(r'LF:(\d+)', content))
lines_hit = sum(int(x) for x in re.findall(r'LH:(\d+)', content))
funcs_found = sum(int(x) for x in re.findall(r'FNF:(\d+)', content))
funcs_hit = sum(int(x) for x in re.findall(r'FNH:(\d+)', content))
branches_found = sum(int(x) for x in re.findall(r'BRF:(\d+)', content))
branches_hit = sum(int(x) for x in re.findall(r'BRH:(\d+)', content))
line_pct = (lines_hit / lines_found * 100) if lines_found else 0
func_pct = (funcs_hit / funcs_found * 100) if funcs_found else 0
branch_pct = (branches_hit / branches_found * 100) if branches_found else 0
print(f'Lines:     {line_pct:.1f}% ({lines_hit}/{lines_found})')
print(f'Functions: {func_pct:.1f}% ({funcs_hit}/{funcs_found})')
print(f'Branches:  {branch_pct:.1f}% ({branches_hit}/{branches_found})')
"
fi
```

## Phase 3: Compare with Baseline

### Save Current as Baseline
```bash
# Save current coverage as baseline for future comparison
cp .claude/reports/coverage/parsed-coverage.json .claude/reports/coverage/baseline.json 2>/dev/null
echo "Baseline saved: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### Compare Delta
```bash
if [ -f .claude/reports/coverage/baseline.json ] && [ -f .claude/reports/coverage/parsed-coverage.json ]; then
  python3 -c "
import json
with open('.claude/reports/coverage/baseline.json') as f:
    baseline = json.load(f)
with open('.claude/reports/coverage/parsed-coverage.json') as f:
    current = json.load(f)
for key in ['lines', 'statements', 'functions', 'branches']:
    b = baseline.get(key, 0)
    c = current.get(key, 0)
    delta = c - b
    symbol = '+' if delta >= 0 else ''
    status = 'UP' if delta > 0 else ('DOWN' if delta < 0 else 'SAME')
    print(f'{key:12s}: {b:.1f}% -> {c:.1f}% ({symbol}{delta:.1f}%) [{status}]')
"
fi
```

## Phase 4: Enforce Thresholds
```bash
THRESHOLD=${THRESHOLD:-80}
FAIL_UNDER=${FAIL_UNDER:-70}

python3 -c "
import json, sys
with open('.claude/reports/coverage/parsed-coverage.json') as f:
    data = json.load(f)
lines = data.get('lines', 0)
threshold = $THRESHOLD
fail_under = $FAIL_UNDER

if lines < fail_under:
    print(f'FAIL: Coverage {lines}% is below hard minimum {fail_under}%')
    sys.exit(1)
elif lines < threshold:
    print(f'WARN: Coverage {lines}% is below target {threshold}%')
    sys.exit(0)
else:
    print(f'PASS: Coverage {lines}% meets target {threshold}%')
    sys.exit(0)
"
```

## Phase 5: Uncovered File Analysis
```bash
# Find files with lowest coverage
if [ -f coverage/coverage-summary.json ]; then
  python3 -c "
import json
with open('coverage/coverage-summary.json') as f:
    data = json.load(f)
files = [(k, v['lines']['pct']) for k, v in data.items() if k != 'total' and v.get('lines', {}).get('pct', 100) < 80]
files.sort(key=lambda x: x[1])
print('Files below 80% coverage:')
for path, pct in files[:20]:
    print(f'  {pct:5.1f}% — {path}')
if not files:
    print('  All files above 80%')
"
fi
```

## Report Template
```markdown
# Coverage Report
Date: {ISO timestamp}
Runner: {Jest|Vitest|Pytest|Go test}
Coverage Tool: {Istanbul|c8|coverage.py|go cover}

## Current Coverage
| Metric | Coverage | Covered | Total | Status |
|--------|----------|---------|-------|--------|
| Lines | N% | N | N | PASS/WARN/FAIL |
| Statements | N% | N | N | PASS/WARN/FAIL |
| Functions | N% | N | N | PASS/WARN/FAIL |
| Branches | N% | N | N | PASS/WARN/FAIL |

## Delta from Baseline
| Metric | Baseline | Current | Delta | Trend |
|--------|----------|---------|-------|-------|
| Lines | N% | N% | +/-N% | UP/DOWN/SAME |
| Functions | N% | N% | +/-N% | UP/DOWN/SAME |
| Branches | N% | N% | +/-N% | UP/DOWN/SAME |

## Thresholds
| Check | Target | Actual | Status |
|-------|--------|--------|--------|
| Coverage target | {threshold}% | N% | PASS/WARN |
| Hard minimum | {fail_under}% | N% | PASS/FAIL |
| No decrease from baseline | >= baseline | N% | PASS/FAIL |

## Lowest Coverage Files
| File | Lines % | Functions % | Branches % |
|------|---------|-------------|------------|
| {path} | N% | N% | N% |

## Uncovered Critical Paths
- {list of important uncovered code paths}

## Evidence
- Summary JSON: `.claude/reports/coverage/parsed-coverage.json`
- Baseline JSON: `.claude/reports/coverage/baseline.json`
- HTML Report: `coverage/` or `htmlcov/`
- LCOV: `coverage/lcov.info`

## Verdict
**PASS** — Coverage {N}% meets target {threshold}%.
OR
**WARN** — Coverage {N}% below target but above minimum.
OR
**FAIL** — Coverage {N}% below hard minimum {fail_under}%.

## Recommendations
- {files needing more tests}
- {uncovered branches to address}
```

Save to `.claude/reports/coverage/report-{date}.md`

## History Tracking
Append each run to coverage history for trend analysis:
```bash
python3 -c "
import json, os
history_file = '.claude/reports/coverage/history.json'
history = json.load(open(history_file)) if os.path.exists(history_file) else []
with open('.claude/reports/coverage/parsed-coverage.json') as f:
    current = json.load(f)
history.append(current)
# Keep last 50 entries
history = history[-50:]
json.dump(history, open(history_file, 'w'), indent=2)
print(f'History: {len(history)} entries')
"
```

## Definition of Done
- Tests executed with coverage enabled
- Coverage data parsed and structured
- Compared against baseline (if exists)
- Thresholds checked (pass/warn/fail)
- Lowest-coverage files identified
- Report saved to `.claude/reports/coverage/`
