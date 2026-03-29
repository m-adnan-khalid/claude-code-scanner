---
name: feature-done
description: Complete a feature — run doc sync check, QA gate, lint, tests, and prepare for PR submission.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @qa-lead, @gatekeeper, @reviewer]
---

# Feature Done

Complete a feature with all quality checks before PR submission.

## Process

### Step 1: Identify Changes
```bash
git diff --name-only HEAD~1
git diff --name-only --staged
```
List all changed files.

### Step 2: Doc Sync Check
For each changed `src/` file:
1. Check if a corresponding `docs/` file exists
2. If doc exists and is older than the src change:
   - Flag: "DOC DRIFT: {src file} -> update {doc file} before PR"
3. Block PR creation until all doc drift is resolved

### Step 3: Standards Check
1. Run linter (if configured): `npm run lint` / `python -m pylint` / equivalent
2. Run formatter check: `npm run format:check` / equivalent
3. Run type check: `npx tsc --noEmit` / equivalent

### Step 4: Test Check
1. Run relevant tests for changed files
2. Check coverage threshold (if configured)
3. Report: pass/fail/skip counts

### Step 5: QA Gate
Generate QA gate output:
```json
{
  "pass": true/false,
  "coverage_pct": N,
  "failures": [],
  "gaps": [],
  "doc_drift": []
}
```

### Step 6: Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
{timestamp} | {ROLE} | {branch} | FEATURE_DONE | {files_changed} | {qa_gate_result}
```

### Step 7: Output
If all checks pass:
```
Feature complete — ready for PR

Changed files: {list}
Tests: {pass}/{total} passed
Coverage: {pct}%
Doc sync: All docs up to date
QA Gate: PASS

Next: Submit PR for review
```

If checks fail:
```
Feature NOT ready for PR

Failures:
- {list of failures}

Fix these issues before submitting PR.
```
