---
name: progress-report
description: Generate progress reports for different stakeholders. Use when someone asks for status updates, reports, or summaries.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[dev|qa|business|management|executive] [task-id|all]"
roles: [CTO, TechLead, PM, QA, Architect, BackendDev, FrontendDev, FullStackDev, DevOps, Designer]
agents: [@team-lead, @product-owner, @qa-lead]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Progress Report: $ARGUMENTS

Read task files from `.claude/tasks/` and generate audience-appropriate report.

## dev — Developer Report
What's done (file:line refs), what's in progress, what's next, test results, coverage, build/lint status, agent activity, open questions, commands to run.

## qa — QA Report
Change summary (plain language), backend/frontend/DB changes with what to test, automated test results, manual testing needed (step-by-step), regression risks, known limitations, environment setup.

## business — Business Report
One paragraph summary, acceptance criteria status table (VERIFIED/IN_PROGRESS/NOT_MET), progress bar per phase, estimated completion, risks in business terms, impact when delivered, decisions needed.

## management — Management Report
Portfolio table (all tasks with phase/status/%/ETA), health indicators (on track/at risk/overdue), blocker summary, this week's completions, key decisions needed, 30-day metrics.

## executive — Executive Summary
Status light (green/yellow/red), key metrics table with trends (tasks completed, cycle time, quality, deploy success, blocked), highlights, risks, needs attention.

## Definition of Done
- Report generated with accurate data for target audience, blockers highlighted.

## Next Steps
- Address blockers listed, `/standup` for team sync.

## Rollback
- N/A (read-only report).

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
