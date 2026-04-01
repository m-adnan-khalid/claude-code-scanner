---
description: Run a full 7-phase system audit checking files, memory, hooks, sync, subagents, retry/undo, and context risk
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

## Audit Phases

Run a FULL SYSTEM AUDIT on this workspace. Check all 7 phases:
1. File existence & health (CLAUDE.md, MEMORY.md, TODO.md, AUDIT_LOG.md, RETRY_LOG.md, docs/, hooks, commands)
2. Memory integrity (Last Completed, Next Step, Blockers, line count, stale refs, sync with TODO)
3. Hook registration & firing (PreToolUse, PostToolUse, Stop, PreCompact, AUDIT_LOG cross-check)
4. Cross-layer sync (CODE↔DOCS, TODO↔MEMORY, MEMORY↔GIT, HOOKS↔AUDIT_LOG)
5. Subagent handoff integrity (Input/Output contracts, no direct MEMORY writes)
6. Retry/undo/redo audit (RETRY_LOG, checkpoint commits, undo paths)
7. Context window risk (line counts, combined load)

Output the structured audit report with issue counts per phase and prioritized fix list.

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /audit-system
- **Task:** Full 7-phase system audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found across 7 phases]
- **Output:** audit report (console output)
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | AUDIT_SYSTEM | 7-phase audit | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run, say "/audit-system"
             - To run a specific audit, say "/[audit-type]-audit"
```
