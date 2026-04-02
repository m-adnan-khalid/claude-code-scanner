---
name: license-audit
description: Dependency license compliance audit — SPDX validation, OSS license compatibility, copyleft risk detection, and legal compliance reporting for npm, pip, cargo, go, and more.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: '[--policy permissive|copyleft-ok|custom] [--format json|csv|md] [--fail-on gpl|agpl|unknown]'
roles: [CTO, TechLead, Architect, DevOps]
agents: [@security, @code-quality]
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


# License Compliance Audit: $ARGUMENTS

## Auto-Detection
```bash
mkdir -p .claude/reports/license

# Detect package manager
[ -f package.json ] && echo "PM: npm/yarn/pnpm"
[ -f requirements.txt ] || [ -f pyproject.toml ] && echo "PM: pip/poetry"
[ -f go.mod ] && echo "PM: go"
[ -f Cargo.toml ] && echo "PM: cargo"
[ -f Gemfile ] && echo "PM: bundler"
[ -f pubspec.yaml ] && echo "PM: flutter/dart"
```

## Phase 1: License Extraction

### npm/yarn/pnpm
```bash
# license-checker (most comprehensive)
npx license-checker --json --production \
  > .claude/reports/license/npm-licenses.json 2>/dev/null

# Summary view
npx license-checker --summary --production \
  > .claude/reports/license/npm-summary.txt 2>/dev/null

# Or npm built-in
npm ls --all --json 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
def walk(deps, results):
    for name, info in (deps or {}).items():
        lic = info.get('license', info.get('licenses', 'UNKNOWN'))
        results.append({'name': name, 'version': info.get('version','?'), 'license': lic})
        walk(info.get('dependencies'), results)
    return results
results = walk(data.get('dependencies'), [])
for r in sorted(results, key=lambda x: x['license']):
    print(f\"{r['license']:30s} {r['name']}@{r['version']}\")
" > .claude/reports/license/npm-licenses.txt 2>/dev/null
```

### Python (pip/poetry)
```bash
pip-licenses --format=json --with-urls --with-description \
  > .claude/reports/license/python-licenses.json 2>/dev/null

pip-licenses --format=table --order=license \
  > .claude/reports/license/python-licenses.txt 2>/dev/null
```

### Go
```bash
go-licenses report ./... --template='{{.Name}},{{.LicenseName}},{{.LicensePath}}' \
  > .claude/reports/license/go-licenses.csv 2>/dev/null

# Or manual
go list -m -json all 2>/dev/null | python3 -c "
import json, sys
for line in sys.stdin.read().split('}\n{'):
    line = line.strip().strip('{}')
    if line:
        try:
            data = json.loads('{' + line + '}')
            print(f\"{data.get('Path', '?'):60s} {data.get('Version', '?')}\")
        except: pass
" > .claude/reports/license/go-deps.txt 2>/dev/null
```

### Cargo (Rust)
```bash
cargo license --json > .claude/reports/license/cargo-licenses.json 2>/dev/null
cargo license > .claude/reports/license/cargo-licenses.txt 2>/dev/null
```

## Phase 2: License Classification & Risk Assessment

### License Categories
| Category | Licenses | Risk for Proprietary | Risk for OSS |
|----------|----------|---------------------|-------------|
| **Permissive** | MIT, ISC, BSD-2, BSD-3, Apache-2.0, Unlicense, CC0-1.0 | NONE | NONE |
| **Weak Copyleft** | LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-2.0 | LOW (must share modifications to the library) | NONE |
| **Strong Copyleft** | GPL-2.0, GPL-3.0 | HIGH (derivative work must be GPL) | LOW |
| **Network Copyleft** | AGPL-3.0 | CRITICAL (SaaS must share source) | MEDIUM |
| **Commercial** | Various proprietary | Check terms | N/A |
| **Unknown** | No license declared | HIGH (assume All Rights Reserved) | HIGH |

### Compatibility Matrix
```
Your Project License → Can use these dependency licenses:
  MIT/ISC/BSD        → MIT, ISC, BSD, Apache-2.0, Unlicense, CC0
  Apache-2.0         → MIT, ISC, BSD, Apache-2.0, Unlicense, CC0
  LGPL-3.0           → MIT, ISC, BSD, Apache-2.0, LGPL, GPL-3.0
  GPL-3.0            → MIT, ISC, BSD, Apache-2.0, LGPL, GPL-2.0, GPL-3.0
  AGPL-3.0           → All of the above + AGPL-3.0
  Proprietary        → MIT, ISC, BSD, Apache-2.0 (check LGPL linking)
```

## Phase 3: Policy Enforcement

### Default Policy: Permissive-Only
```bash
# Check for copyleft/problematic licenses
python3 -c "
import json
BLOCKED = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'SSPL-1.0', 'BSL-1.1', 'EUPL-1.2']
WARN = ['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'EPL-2.0', 'CC-BY-SA-4.0']
UNKNOWN = ['UNKNOWN', 'UNLICENSED', 'Custom', 'SEE LICENSE IN']

try:
    with open('.claude/reports/license/npm-licenses.json') as f:
        data = json.load(f)
    blocked = []
    warned = []
    unknown = []
    for pkg, info in data.items():
        lic = info.get('licenses', 'UNKNOWN')
        if any(b in lic for b in BLOCKED):
            blocked.append(f'{pkg}: {lic}')
        elif any(w in lic for w in WARN):
            warned.append(f'{pkg}: {lic}')
        elif any(u in lic for u in UNKNOWN):
            unknown.append(f'{pkg}: {lic}')

    print(f'BLOCKED ({len(blocked)}):')
    for b in blocked: print(f'  {b}')
    print(f'WARNED ({len(warned)}):')
    for w in warned: print(f'  {w}')
    print(f'UNKNOWN ({len(unknown)}):')
    for u in unknown: print(f'  {u}')
except Exception as e:
    print(f'Error: {e}')
" > .claude/reports/license/policy-check.txt 2>/dev/null

cat .claude/reports/license/policy-check.txt
```

## Phase 4: Project License Validation

```bash
echo "=== Project License Check ==="
[ -f LICENSE ] && echo "OK: LICENSE file exists" || echo "WARN: No LICENSE file"
[ -f LICENSE.md ] && echo "OK: LICENSE.md file exists"
grep -q "license" package.json 2>/dev/null && echo "OK: License in package.json" || echo "WARN: No license in package.json"

# Check SPDX identifier
grep '"license"' package.json 2>/dev/null
head -5 LICENSE 2>/dev/null
```

## Report Template

```markdown
# License Compliance Report
Date: {ISO timestamp}
Project License: {MIT|Apache-2.0|Proprietary|etc.}
Policy: {Permissive-only|Copyleft-OK|Custom}
Package Manager: {npm|pip|cargo|go}

## Summary
| Category | Count | Status |
|----------|-------|--------|
| Permissive (MIT, BSD, Apache, ISC) | N | OK |
| Weak Copyleft (LGPL, MPL) | N | REVIEW |
| Strong Copyleft (GPL) | N | BLOCKED |
| Network Copyleft (AGPL) | N | BLOCKED |
| Unknown/No License | N | REVIEW |
| **Total Dependencies** | **N** | |

## License Distribution
| License | Count | % | Risk |
|---------|-------|---|------|
| MIT | N | N% | None |
| ISC | N | N% | None |
| Apache-2.0 | N | N% | None |
| BSD-3-Clause | N | N% | None |

## Policy Violations
| # | Package | Version | License | Risk | Action |
|---|---------|---------|---------|------|--------|
| 1 | {pkg} | {ver} | GPL-3.0 | BLOCKED | Replace with alternative |
| 2 | {pkg} | {ver} | UNKNOWN | REVIEW | Contact maintainer |

## Unknown Licenses
| Package | Version | Repository | Action |
|---------|---------|-----------|--------|
| {pkg} | {ver} | {url} | Manual review needed |

## Project License Compliance
| Check | Status |
|-------|--------|
| LICENSE file exists | PASS/FAIL |
| SPDX identifier in package.json | PASS/FAIL |
| All dependencies compatible | PASS/FAIL |
| No copyleft contamination | PASS/FAIL |

## Evidence
- Full license list: `.claude/reports/license/{pm}-licenses.json`
- Policy check: `.claude/reports/license/policy-check.txt`

## Verdict
**COMPLIANT** — All {N} dependencies use approved licenses.
OR
**NON-COMPLIANT** — {N} policy violations found. See above.
```

Save to `.claude/reports/license/report-{date}.md`

## Definition of Done
- All dependency licenses extracted
- Licenses classified by risk category
- Policy violations identified
- Unknown licenses flagged
- Project license validated
- Report saved to `.claude/reports/license/`

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
