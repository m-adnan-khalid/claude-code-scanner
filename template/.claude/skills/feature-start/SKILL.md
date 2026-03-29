---
name: feature-start
description: Start a new feature with role-prefixed branch, task file creation, and scope assignment. Enforces branch naming convention.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @process-coach]
---

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
scope: {scope}
role: {CURRENT_ROLE}
branch: {BRANCH}
created: {ISO timestamp}
---

# {ticket_id}: {description}

## Requirements
(Fill in requirements)

## Acceptance Criteria
- [ ] (Define criteria)

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
