---
name: onboard
description: >
  Onboard a new developer — explain codebase structure, key files, conventions, how to run/test/deploy,
  team workflow, active work status, and how to make your first contribution. Generates a persistent
  onboarding guide and includes current task context for mid-sprint joining.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Agent, Bash, Write
argument-hint: "[--role backend|frontend|mobile|fullstack] [--quick]"
effort: high
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@explorer, @team-lead, @docs-writer]
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


# Onboard: $ARGUMENTS

Generate a comprehensive onboarding guide for a developer joining this project.

## Process

### Step 1: Project Context
1. Read `CLAUDE.md` for project overview, tech stack, key commands
2. Read `.claude/project/PROJECT.md` for project status and phase
3. Read `.claude/project/PRODUCT_SPEC.md` for what the product does (if exists)
4. Read `.claude/project/ARCHITECTURE.md` for system design (if exists)
5. Read `.claude/project/DOMAIN_MODEL.md` for domain glossary and entities (if exists)
6. Read `.claude/project/FEATURES_BUILT.md` for what's been built so far (if exists)
7. Read `.claude/project/METHODOLOGY.md` for team process (if exists)

### Step 2: Codebase Analysis
1. Invoke @explorer to map: directory structure, key entry points, dependency graph
2. Identify: main source dirs, test dirs, config files, build files
3. Detect: language, framework, package manager, test runner, linter
4. Find: README, CONTRIBUTING, CHANGELOG for existing team guidance
5. If `--role` specified: focus on that area (backend routes/services, frontend components/pages, etc.)

### Step 3: Active Work Status
1. Scan `.claude/tasks/` for active tasks — show what's in progress
2. For each active task: show phase, assigned agent, pending subtasks
3. Check `.claude/project/BACKLOG.md` for upcoming features
4. Run `/standup --yesterday` output format: what was done recently
5. If tasks exist with status ON_HOLD or BLOCKED: explain why and what's needed

### Step 4: Generate Onboarding Guide
Save to `.claude/docs/ONBOARDING.md` with these sections:

```markdown
# Developer Onboarding Guide
Generated: {date}

## 1. Project Overview
- What this project does (from PRODUCT_SPEC or README)
- Current status: {PROJECT.md status or "no pre-dev setup"}
- Tech stack: {languages, frameworks, databases}
- Architecture: {high-level description from ARCHITECTURE.md}

## 2. Getting Started
- Prerequisites: {Node.js version, tools needed}
- Setup commands:
  1. git clone {repo}
  2. {install command: npm install / pip install / etc.}
  3. {env setup: cp .env.example .env}
  4. {database setup if applicable}
  5. {run command: npm run dev / python manage.py runserver / etc.}
- Verify it works: {health check URL, test command}

## 3. Key Files & Directories
- {src/} — {description}
- {tests/} — {description}
- {config files} — {what they control}
- Entry points: {main file, API routes, page routes}

## 4. Code Conventions
- Naming: {camelCase/snake_case/kebab-case}
- File structure: {how files are organized}
- Import patterns: {absolute/relative, barrel exports}
- Error handling: {pattern used}
- Logging: {structured/console, levels}

## 5. How to Run, Test, Deploy
- Run locally: {command}
- Run tests: {command}
- Run linter: {command}
- Build: {command}
- Deploy: {command or "see /deploy"}

## 6. Domain Knowledge
- Key entities: {from DOMAIN_MODEL.md}
- Business rules: {critical rules to know}
- Glossary: {domain terms and definitions}
- Read: `.claude/rules/domain-terms.md` for full glossary

## 7. Current Work Status
- Active tasks: {list with phase and assignee}
- Recently completed: {last 3 features from FEATURES_BUILT.md}
- Upcoming: {next 3 features from BACKLOG.md}
- Blockers: {any blocked tasks}

## 8. Team Workflow
- Methodology: {Scrum/Kanban/etc. from METHODOLOGY.md}
- Branch strategy: {feature/TASK-id/slug from main/dev}
- PR process: Dual review (@reviewer + @security) required
- How to start work: `/workflow new "description"` or pick from backlog
- How to track progress: `/workflow status TASK-id` or `/task-tracker status`

## 9. Making Your First Contribution
1. Pick a task: check `.claude/tasks/` for unassigned subtasks or run `/mvp-kickoff next`
2. Create branch: `git checkout -b feature/TASK-{id}/{slug}`
3. Make changes following the conventions above
4. Run tests: {test command}
5. Create PR: the workflow handles this at Phase 8
6. Or for a quick contribution: `/fix-bug "description"` for small fixes

## 10. Useful Commands
| Command | When to Use |
|---------|-------------|
| `/workflow new "task"` | Start a new feature or task |
| `/workflow status` | See all active tasks |
| `/fix-bug "description"` | Quick bug fix (< 50 lines) |
| `/hotfix "issue"` | Production emergency |
| `/standup` | Daily status report |
| `/sync --check` | Check if environment is current |
| `/clarify --existing` | Find gaps in codebase |
```

### Step 5: Present Guide
1. Print a summary to console (key sections only)
2. Full guide saved at: `.claude/docs/ONBOARDING.md`
3. Suggest: "Read the full guide at `.claude/docs/ONBOARDING.md`"

## Quick Mode (`--quick`)
Skip Steps 2-3, generate a minimal guide from project docs only (no codebase analysis).
Output: 1-page summary with setup commands, key files, and active tasks.

## Definition of Done
- Developer understands: what the project does, how to run it, how to contribute
- Developer knows: active work, upcoming features, team process
- Developer can: make their first change following conventions
- Guide persisted at `.claude/docs/ONBOARDING.md`

## Next Steps
- `/workflow new "task"` — start your first task
- `/standup` — see daily status
- `/clarify --existing` — find gaps in the codebase

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
