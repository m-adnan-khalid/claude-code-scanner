---
paths:
  - ".claude/tasks/**/*"
  - ".claude/skills/workflow/**/*"
---
# Task Lifecycle Rules — MANDATORY

## Rule 0: Every task MUST have a completed Task Brief before work begins
Create `.claude/tasks/BRIEF-{TASK-id}.md` from `.claude/templates/task-brief.md`.
All sections filled, no placeholders. Audit Log updated in real time by `audit-logger` hook.
Completion Report appended when done. See `.claude/docs/task-brief-example.md` for reference.

## Rule 1: Every task MUST have subtasks before development starts
Before Phase 5, decompose the task into subtasks:
```markdown
## Subtasks
| # | Subtask | Owner | Status | Phase | Completed |
|---|---------|-------|--------|-------|-----------|
| 1 | Backend API endpoint | @api-builder | DONE | 5 | 2026-03-28T10:00Z |
| 2 | Unit + integration tests | @tester | DONE | 6 | 2026-03-28T11:00Z |
| 3 | Code review | @reviewer | IN_PROGRESS | 7 | — |
| 4 | QA automation run | @qa-automation | PENDING | 9 | — |
```

## Rule 2: Phase advancement requires ALL subtasks for that phase to be DONE
- `/workflow advance TASK-{id}` — check all subtasks, advance if all done
- `/workflow status TASK-{id}` — show subtask progress
- If any subtask is not DONE → BLOCK advancement, show what's missing

## Rule 3: Mark subtask done with evidence
```
/workflow done TASK-{id} subtask-{N} "evidence: tests pass, 95% coverage"
```
Updates the subtask table + writes to timeline + saves to task memory.

## Rule 4: Phase completion checklist (auto-verified)
| Phase | Must be DONE before advancing |
|-------|-------------------------------|
| 5→6 | All dev subtasks DONE, code compiles, no lint errors |
| 6→7 | All test subtasks DONE, tests pass, coverage ≥ baseline |
| 7→8 | Review subtasks DONE, all critical comments addressed |
| 8→9 | CI green, PR ready |
| 9→10 | QA automation DONE, all P0/P1 bugs fixed and verified |
| 10→11 | All sign-offs (QA + biz + tech) DONE |
| 11→12 | Deploy DONE, health check green |
| 12→13 | Monitoring period passed, docs updated, task CLOSED |

## Rule 5: Persistent state — nothing gets lost
- Subtask/phase completions → task file + changes.log + execution report
- Session boundaries → pre-compact saves, post-compact restores