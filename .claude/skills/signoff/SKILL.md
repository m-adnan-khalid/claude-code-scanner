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

## 3-Way Gate Enforcement
After approving the requested gate, you MUST enforce the 3-way check:

1. Read the task file and extract current sign-off status:
   - `tech_signoff: APPROVED | REJECTED | PENDING`
   - `qa_signoff: APPROVED | REJECTED | PENDING`
   - `business_signoff: APPROVED | REJECTED | PENDING`

2. If ALL THREE are APPROVED:
   - Output: "All sign-offs complete. Task is ready for Phase 11 merge."
   - Update task status to TECH_SIGNOFF (ready for merge)

3. If the requested gate is APPROVED but others are PENDING:
   - Output: "Gate approved. Remaining gates pending: {list pending gates}"
   - Output: "Run `/signoff {type} TASK-{id}` for each remaining gate before merge."
   - Do NOT advance task status to merge-ready

4. If ANY gate is REJECTED:
   - Output: "Gate REJECTED. Reason: {reasons}. Task cannot proceed to merge."
   - Route rejection per flow-engine.md:
     - QA rejects (bugs) → Phase 5 re-flow (QA + Biz approval INVALIDATED)
     - Biz rejects (requirements) → Phase 4 (QA approval PRESERVED)
     - Biz rejects (UI) → Phase 5c frontend fix (QA approval PRESERVED)
     - Tech rejects (architecture) → Phase 3 (ALL approvals INVALIDATED)
     - Tech rejects (perf/tests) → Phase 5 (QA + Biz approvals PRESERVED)

5. Circuit breaker: If this is the 2nd full rejection cycle at Phase 10, STOP and escalate to user.

## Rollback
- **Undo changes:** Revoke approval by updating task file status back to pre-sign-off phase
- **Revert to previous state:** `/task-tracker update TASK-{id} status=REVIEWING`

### Final Output
```
NEXT ACTION: {gate_type} sign-off: {APPROVED|REJECTED}. {remaining gates status or merge readiness}.
```
