---
name: design-review
description: Review architecture and design decisions. Check alignment with project patterns, scalability, and maintainability.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Agent
argument-hint: '"design description" [--scope backend|frontend|mobile|infra]'
roles: [Architect, TechLead, CTO, Designer]
agents: [@architect, @code-quality, @ux-designer, @reviewer]
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


# Design Review: $ARGUMENTS

## Process
1. Read current architecture (CLAUDE.md, ARCHITECTURE.md)
2. Invoke @architect to evaluate the design
3. Invoke @code-quality for pattern analysis
4. Check alignment with existing conventions
5. Output: APPROVED / NEEDS_REVISION with specific feedback

## Definition of Done
- All architecture criteria checked, verdict given (APPROVED/NEEDS_REVISION), action items listed.

## Next Steps
- `/workflow dev` if approved, `/refactor` if revision needed.

## Rollback
- **Request re-review:** `/design-review --update` with revised architecture
- **Revert design changes:** `git checkout -- .claude/project/ARCHITECTURE.md` if design was modified
- **Escalate:** `/workflow resume TASK-{id}` to return to previous phase

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
