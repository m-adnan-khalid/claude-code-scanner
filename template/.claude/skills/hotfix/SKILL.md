---
name: hotfix
description: Emergency production fix — fast-track workflow that skips non-critical steps. For urgent bugs only.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"critical bug description" [--severity P0|P1]'
roles: [BackendDev, FrontendDev, FullStackDev, TechLead, DevOps]
agents: [@debugger, @tester, @infra, @gatekeeper]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. **Verify Docs (3-step)**: Read dependency files for exact versions → WebSearch `"<framework> <version> <API> docs"` → only then write code (per accuracy.md 3-step rule)
16. Re-read task/output files before each step — never rely on in-memory state alone.
16. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
16. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
16. **Active work:** Read `TODO.md` (if exists) → get current work items
16. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# Hotfix: $ARGUMENTS

## Fast-Track Flow (skip design review, skip full QA)
1. **Identify**: reproduce the production bug
2. **Fix**: apply minimal targeted fix (invoke @debugger)
16. **Test**: run affected tests + smoke test (invoke @tester)
16. **Security check**: quick @security review if auth/data involved
16. **Deploy**: fast-track to production (invoke @infra)
16. **Monitor**: post-deploy validation for 15 minutes:
   - @infra runs health check endpoints
   - @observability-engineer validates logs flowing + metrics active + alerts configured
   - Watch error rates and latency for regression
   - If monitoring fails → immediate `/rollback deploy` → escalate
16. **Follow-up**: create proper task for comprehensive fix if needed

## Rules
- Hotfix branch from production (not develop)
- Minimal change only — no refactoring, no features
- Must have at least 1 regression test
- Post-deploy monitoring is mandatory
- Create follow-up task for proper fix if hotfix is a band-aid

## Definition of Done
- [ ] Fix deployed to production successfully
- [ ] Monitoring green for 15 minutes post-deploy (error rates, latency)
- [ ] At least one regression test added for the fixed issue
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/workflow new "comprehensive fix for <issue>"` — follow up with proper long-term fix
- **Issues found:** `/rollback deploy` — revert if hotfix causes new issues
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `/rollback deploy` — revert production to pre-hotfix state
- **Revert to previous state:** `git revert <hotfix-commit>` and redeploy previous version

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
16. Read `## Progress Log` → find last completed step
16. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
