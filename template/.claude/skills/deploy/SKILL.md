---
name: deploy
description: Deploy to staging or production — run pre-deploy checks, execute deployment, verify health, monitor.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[staging|production] [--dry-run] [--rollback]"
roles: [DevOps, TechLead, CTO]
agents: [@infra, @gatekeeper, @security]
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


# Deploy: $ARGUMENTS

## Process
1. Pre-deploy checks: all tests pass, sign-offs complete, no open blockers
2. Invoke @infra for deployment execution
3. Run health checks after deployment
4. Monitor for 5 minutes (error rates, latency)
5. If issues detected: auto-rollback and notify

## Safety
- Production deploys require explicit user confirmation
- Always deploy to staging first
- Keep rollback plan ready

## Definition of Done
- [ ] Deployment successful (no errors during deploy process)
- [ ] Health check endpoints return 200 OK
- [ ] Monitoring green for 5 minutes (error rates, latency, CPU/memory)
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/execution-report` — generate post-deployment analytics
- **Post-deploy validation:** `/logging-audit` — verify observability coverage, `/incident-readiness` — verify DR readiness
- **Issues found:** `/rollback deploy` — revert to previous stable version
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `/rollback deploy TASK-{id}` — automated rollback to previous deployment
- **Revert to previous state:** `git revert <deploy-commit>` and trigger redeployment pipeline

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
