---
name: standup
description: Daily standup report — what was done, what's planned, any blockers. Reads task files for accurate status.
user-invocable: true
allowed-tools: Read, Grep, Glob
argument-hint: "[--yesterday] [--team]"
---

# Standup: $ARGUMENTS

## Process
1. Read `.claude/tasks/` for all active, completed (today), and blocked tasks
2. Read `.claude/reports/` for recent execution reports
3. Generate standup report:
   - **Done**: tasks completed or phases advanced since last standup
   - **Today**: current active task, next planned work
   - **Blockers**: any blocked tasks with reasons
   - **Metrics**: velocity, items in progress, items in review
