---
name: dependency-check
description: Check for outdated, vulnerable, or unused dependencies. Supports npm, pip, poetry, cargo, go, flutter.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[--outdated|--vulnerabilities|--unused|--licenses]"
roles: [TechLead, DevOps, Architect, BackendDev, FrontendDev, FullStackDev]
agents: [@security, @infra, @code-quality]
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


# Dependency Check: $ARGUMENTS

## Process
1. Detect package manager (npm, pip, poetry, cargo, go, pub)
2. Run appropriate audit commands:
   - `npm audit` / `npm outdated`
   - `pip-audit` / `pip list --outdated`
   - `poetry show --outdated` / `safety check`
   - `cargo audit` / `cargo outdated`
   - `flutter pub outdated`
3. Check for unused dependencies (depcheck, deptry, etc.)
4. Check license compliance
5. Output report with update recommendations and risk assessment

## Definition of Done
- All deps scanned, vulnerabilities listed with severity, outdated packages flagged, upgrade path clear.

## Next Steps
- `/fix-bug` for critical vulnerabilities, `/refactor` for major upgrades.
- `/license-audit` for deeper OSS license compliance, copyleft risk, and SPDX validation.

## Rollback
- N/A (read-only check).

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
