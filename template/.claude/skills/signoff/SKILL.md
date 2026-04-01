---
name: signoff
description: Sign-off gate — get tech, QA, or business approval for a task. Checks all criteria before approving.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[tech|qa|business] [TASK-id]"
roles: [TechLead, QA, PM, CTO]
agents: [@team-lead, @qa-lead, @product-owner, @gatekeeper]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Sign-off: $ARGUMENTS

## Process
1. Read task file for current status and requirements
2. For tech sign-off: invoke @team-lead (architecture, code quality, test coverage)
3. For QA sign-off: invoke @qa-lead (all tests pass, QA plan complete, no open bugs)
4. For business sign-off: invoke @product-owner (acceptance criteria met, UX approved)
5. Output: APPROVED / REJECTED with specific reasons

## Definition of Done
- [ ] All sign-off criteria met for the requested type (tech/QA/business)
- [ ] Evidence attached (test reports, review links, demo screenshots)
- [ ] No open P0/P1 bugs against this task
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/deploy staging` — approved task is ready for deployment
- **Issues found:** `/fix-bug "rejection reason"` — address sign-off feedback
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## 3-Way Gate Check
Before marking the task as fully signed off:
1. Read the task file and check for:
   - `tech_signoff: APPROVED`
   - `qa_signoff: APPROVED`
   - `business_signoff: APPROVED`
2. If ANY of the three is missing or REJECTED, the task CANNOT proceed to merge.
3. All three must be APPROVED before PR merge is allowed.

## Rollback
- **Undo changes:** Revoke approval by updating task file status back to pre-sign-off phase
- **Revert to previous state:** `/task-tracker update TASK-{id} status=REVIEWING`

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
