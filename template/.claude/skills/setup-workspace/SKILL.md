---
name: setup-workspace
description: Initialize workspace for a specific team role. Sets CURRENT_ROLE in session.env, verifies CLAUDE.md version, runs setup checks.
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


# Setup Workspace

Initialize your workspace with role-based configuration.

## Process

### Step 1: Role Selection
Ask the user: "What is your role?"

Options:
1. **CTO** — Executive oversight, framework governance
2. **Architect** — System design, architecture review
3. **TechLead** — Technical leadership, orchestration
4. **BackendDev** — Backend API, services, database
5. **FrontendDev** — UI components, pages, styles
6. **FullStackDev** — Full stack development
7. **QA** — Testing, quality assurance
8. **DevOps** — Infrastructure, CI/CD, deployment
9. **PM** — Product management, requirements
10. **Designer** — UX/UI design, accessibility

### Step 2: Write Session Environment
Create `.claude/session.env`:
```
CURRENT_ROLE={selected_role}
WORKSPACE_INITIALIZED=true
INITIALIZED_AT={ISO timestamp}
```

### Step 3: Verify CLAUDE.md Version
1. Read `CLAUDE.md` — check for `## FRAMEWORK VERSION:` header
2. Compare with `git show HEAD:CLAUDE.md` version
3. If mismatch: warn user to `git pull`

### Step 4: Run Setup Checks
1. Verify all required docs exist:
   - docs/STANDARDS.md
   - docs/GLOSSARY.md
   - docs/ARCHITECTURE.md
   - docs/ONBOARDING.md
2. Verify hooks are registered in .claude/settings.json
3. Verify agent files exist in .claude/agents/

### Step 5: Output
```
Workspace ready for {ROLE}

Role: {role}
Allowed paths: {paths from CLAUDE.md RBAC}
Available agents: {agents for this role}
Available commands: {commands for this role}

Next steps:
1. Read docs/ONBOARDING.md ({role} section)
2. Run /daily-sync
3. Start work with /feature-start or /workflow new
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
