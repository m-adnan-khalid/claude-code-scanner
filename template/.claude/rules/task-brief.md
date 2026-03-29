---
paths:
  - ".claude/tasks/**/*"
  - ".claude/skills/workflow/**/*"
---
# Task Brief — Mandatory Pre-Work Gate

## The Rule
**No work begins without a completed Task Brief.**
Before touching any file, running any tool, or writing any code — create `.claude/tasks/BRIEF-{slug}.md` from the template at `.claude/templates/task-brief.md`.

## 3-Phase Workflow

### Phase 1 — Brief (BEFORE any work)
1. Read the instruction carefully
2. Create the Task Brief file
3. Fill EVERY section — no placeholders, no "TBD"
4. If scope is ambiguous → log it, ask user, wait. Do NOT guess.

### Phase 2 — Execute (DURING work)
1. Update the Audit Log in real time — every tool call, every decision
2. Stay STRICTLY within declared scope
3. Hit a blocker? Log it and surface it immediately — do not guess through it

### Phase 3 — Close (AFTER completion)
1. Append the Completion Report
2. Mark every execution step done or explain why not
3. List all artifacts with file paths
4. Flag any deviations from plan with reasons

## Enforcement
- Scope discipline: only do what is in the brief
- No silent actions: every action logged in Audit Log
- Verification mandatory: confirm output matches what was asked
- Ambiguity stops work: unclear → ask, don't guess
