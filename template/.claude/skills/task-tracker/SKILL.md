---
name: task-tracker
description: Track task progress across all SDLC phases. Use when asking about task status, progress, blockers, or needing reports.
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
context: fork
argument-hint: "create|status|update|report|dashboard|history|blockers|metrics [args]"
---

# Task Tracker: $ARGUMENTS

## Commands
- `/task-tracker create "title"` — Create task in `.claude/tasks/TASK-{id}.md`
- `/task-tracker status [TASK-id]` — Dashboard or single task status
- `/task-tracker update TASK-id phase=N status=STATE` — Update state
- `/task-tracker update TASK-id blocked="reason" owner="who"` — Log blocker
- `/task-tracker update TASK-id unblocked` — Clear blocker
- `/task-tracker report [TASK-id]` — Full detail report
- `/task-tracker dashboard` — Visual dashboard
- `/task-tracker history [TASK-id]` — Timeline of events
- `/task-tracker blockers` — All open blockers
- `/task-tracker metrics` — Aggregate performance

## Task States
BACKLOG → INTAKE → ANALYZING → DESIGNING → APPROVED → DEVELOPING → DEV_TESTING → REVIEWING → CI_PENDING → QA_TESTING → QA_SIGNOFF → BIZ_SIGNOFF → TECH_SIGNOFF → DEPLOYING → MONITORING → CLOSED
(+ BLOCKED, CANCELLED, ON_HOLD at any state)

## Task Record (`.claude/tasks/TASK-{id}.md`)
Frontmatter: id, title, type, scope, complexity, priority, status, branch, pr, created, updated
Sections: Current Status, Timeline (every event with timestamp/agent/duration), Phase Details (1-12), Blockers Log, Decision Log, Risk Register

## Bug Tracking
Bugs logged as: BUG-{task_id}-{number} with severity (P0-P4), steps to reproduce, expected/actual, evidence, status tracking (OPEN → IN_PROGRESS → FIXED → QA_VERIFY → VERIFIED/REOPENED → CLOSED)

## Reports (use /progress-report for stakeholder-specific)
- dev: files changed, test results, agent activity, commands
- qa: what changed, test scenarios, regression risks, environment
- business: acceptance criteria status, progress bar, ETA
- management: portfolio table, health indicators, blockers
- executive: status light, key metrics, trends

## Definition of Done
- [ ] Task state accurately reflects current progress
- [ ] All phase transitions recorded with timestamps
- [ ] Blockers logged with owner and resolution path
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/workflow resume TASK-{id}` — continue work on tracked task
- **Issues found:** `/standup` — surface blockers in daily standup report
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Revert task status:** `/task-tracker update TASK-{id} --status {previous-status}`
- **Undo phase change:** Edit `.claude/tasks/TASK-{id}.md` — restore previous phase in frontmatter
- **View history:** `git log --oneline .claude/tasks/TASK-{id}.md` to find previous state
