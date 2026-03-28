---
name: rollback
description: Rollback a failed deployment, revert code changes, or undo a workflow phase. Use when deployment fails, regressions are found, or a phase needs to be undone.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[deploy|code|phase] [task-id] [--to-commit SHA]"
context: fork
---

# Rollback: $ARGUMENTS

## Commands
- `/rollback deploy TASK-id` — Rollback a failed deployment
- `/rollback code TASK-id` — Revert all code changes from a task
- `/rollback phase TASK-id --to-phase N` — Undo work back to phase N
- `/rollback code --to-commit SHA` — Revert to a specific commit

## Deploy Rollback
1. **Identify**: Read task record for deployment details (Phase 11)
2. **Verify**: Confirm which deployment to rollback (staging/production)
3. **Execute**: Run rollback procedure:
   ```bash
   # If merge-based deployment:
   git revert --no-commit HEAD
   git commit -m "revert: rollback TASK-{id} deployment"
   # Push and trigger deploy pipeline
   ```
4. **Health Check**: Verify service is healthy after rollback
5. **Update Task**: Set status back to appropriate phase

## Code Rollback
1. **Identify**: Read changes log (`.claude/tasks/TASK-{id}_changes.log`) for all modified files
2. **Branch State**: Check if changes are committed, staged, or unstaged
3. **Revert Strategy**:
   - If PR not merged: close PR, delete branch
   - If committed but not pushed: `git reset` to pre-task commit
   - If pushed but not merged: revert commits on branch
   - If merged: create revert commit on main
4. **Verify**: Run test suite to confirm clean state
5. **Update Task**: Set status to CANCELLED or route back to earlier phase

## Phase Rollback
1. **Identify**: Read task record for phase history
2. **Determine Scope**: What artifacts were created in the target phase range
3. **Revert Files**: Undo file changes from phases N+1 through current
4. **Preserve**: Keep task record timeline (add rollback event)
5. **Reset State**: Update task status to target phase
6. **Re-enter**: Resume workflow from target phase

## Safety Checks
- NEVER rollback without confirming with user first
- NEVER force-push to main/master
- ALWAYS create a revert commit rather than rewriting history
- ALWAYS run tests after rollback to verify clean state
- ALWAYS update the task record with rollback event in timeline

## Output Format
### Rollback Report
- **Type:** deploy / code / phase
- **Task:** TASK-{id}
- **Rolled Back From:** phase/commit/deployment
- **Rolled Back To:** phase/commit/state
- **Files Reverted:** list
- **Test Suite:** PASS/FAIL after rollback
- **Status:** SUCCESS / PARTIAL / FAILED

### HANDOFF
```
HANDOFF:
  from: /rollback
  to: @team-lead
  reason: rollback [complete/failed]
  artifacts: [revert commit, task record]
  context: [what was rolled back and current state]
```

## Definition of Done
- [ ] System restored to previous known-good state
- [ ] Health checks pass after rollback
- [ ] Root cause identified and documented in task record
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/fix-bug "root cause of rollback"` — address the underlying issue
- **Issues found:** Escalate to user — manual intervention required
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- Rolling back a rollback is not supported — fix forward instead with `/fix-bug` or `/hotfix`
