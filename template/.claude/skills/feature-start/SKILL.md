---
name: feature-start
description: Start a new feature with role-prefixed branch, task file creation, and scope assignment. Enforces branch naming convention.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @process-coach]
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


# Feature Start

Start a new feature with proper branch naming and task setup.

## Process

### Step 1: Read Role
Read `.claude/session.env` for `CURRENT_ROLE`.
If not set: "Run /setup-workspace first to set your role."

Map role to branch prefix:
- CTO -> cto
- Architect -> architect
- TechLead -> techlead
- BackendDev -> backend
- FrontendDev -> frontend
- FullStackDev -> fullstack
- QA -> qa
- DevOps -> devops
- PM -> pm
- Designer -> designer

### Step 2: Get Task Details
Ask user:
1. "Ticket ID (e.g., PROJ-42):" — required
2. "Short description (e.g., auth-service):" — required
3. "Scope (backend/frontend/fullstack/infra/docs):" — required

### Step 3: Create Branch
```bash
BRANCH="${prefix}/${ticket_id}/${description}"
# Lowercase, spaces to hyphens
BRANCH=$(echo "$BRANCH" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
git checkout -b "$BRANCH"
```

### Step 4: Create Task File
Create `.claude/tasks/task-{ticket_id}.md`:
```markdown
---
id: {ticket_id}
title: {description}
status: DEVELOPING
phase: 5
assigned-to: @{dev-agent}
scope: {scope}
role: {CURRENT_ROLE}
branch: {BRANCH}
session_id: {SESSION_ID from session.env}
created: {ISO timestamp}
updated: {ISO timestamp}
depends-on: none
---

# {ticket_id}: {description}

## Requirements
(Fill in requirements)

## Acceptance Criteria
- [ ] (Define criteria)

## Subtasks
| # | Subtask | Owner | Status | Phase | Completed |
|---|---------|-------|--------|-------|-----------|

## Loop State
- dev-test-loop: iteration 0/5
- review-loop: iteration 0/3
- ci-fix-loop: iteration 0/3
- signoff-rejection-cycle: 0/2
- deploy-loop: iteration 0/2

## Timeline
| Timestamp | Event | Agent | Details | Result | Next |
|-----------|-------|-------|---------|--------|------|

## Files Changed
(Updated automatically by hooks)
```

### Step 5: Output
```
Feature started!

Branch: {BRANCH}
Task: .claude/tasks/task-{ticket_id}.md
Scope: {scope}
Role: {CURRENT_ROLE}

Next: implement your feature, then run /feature-done when complete.
```

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
