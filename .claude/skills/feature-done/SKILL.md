---
name: feature-done
description: Complete a feature — run doc sync check, QA gate, lint, tests, and prepare for PR submission.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @qa-lead, @gatekeeper, @reviewer]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. Re-read task/output files before each step — never rely on in-memory state alone.
4. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


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

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Output:** [file path if any]
- **Next Step:** [recommended next action]

### Update TODO
If this work was linked to a TODO item, mark it done. If follow-up needed, add new TODO.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Context Recovery
If context is lost (compaction, pause, resume):
1. Find most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read `## Session Context` → restore state
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
