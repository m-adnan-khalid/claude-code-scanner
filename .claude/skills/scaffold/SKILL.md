---
name: scaffold
description: >
  Generate project scaffolding — directory structure, boilerplate files, configs, and
  dependency setup based on architecture and tech stack decisions. Creates actual runnable
  project files.
  Trigger: after /architecture completes or when user needs project scaffolding.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-architecture | --template web|api|cli]'
effort: high
roles: [TechLead, Architect, FullStackDev]
agents: [@scaffolder, @architect, @team-lead]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. **Verify Docs (3-step)**: Read dependency files for exact versions → WebSearch `"<framework> <version> <API> docs"` → only then write code (per accuracy.md 3-step rule)
16. Re-read task/output files before each step — never rely on in-memory state alone.
16. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
16. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
16. **Active work:** Read `TODO.md` (if exists) → get current work items
16. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# /scaffold — Project Scaffolding Generator

## Overview
Generate a real, runnable project from architecture and tech stack decisions. Creates
directory structure, boilerplate files, configurations, and installs dependencies.

## Usage
```
/scaffold                              # Auto-reads from ARCHITECTURE.md + TECH_STACK.md
/scaffold --from-architecture          # Explicitly read from architecture
/scaffold --template web               # Use a predefined template (web|api|cli|mobile)
/scaffold --dry-run                    # Show what would be created without creating
```

## Process

### Step 1: Gather Context
- Read `.claude/project/ARCHITECTURE.md` for directory structure and data model
- Read `.claude/project/TECH_STACK.md` for technology choices and versions
- Read `.claude/project/PRODUCT_SPEC.md` for project name and description
- Verify both documents exist — ABORT if missing with guidance to run prerequisites

### Step 2: Determine Scaffolding Strategy
Based on TECH_STACK.md, choose the approach:

**Official generator available:**
| Stack | Generator Command |
|-------|-------------------|
| Next.js | `npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir` |
| Vite + React | `npm create vite@latest -- --template react-ts` |
| Vue/Nuxt | `npx nuxi init` |
| SvelteKit | `npm create svelte@latest` |
| Django | `django-admin startproject {name}` |
| Rails | `rails new {name} --api --database=postgresql` |
| Go | `go mod init {module}` |
| Rust | `cargo init` |
| .NET | `dotnet new webapi` |
| Express | Manual (no official generator with good defaults) |
| NestJS | `npx @nestjs/cli new` |
| FastAPI | Manual (use cookiecutter if available) |

**Strategy:** Use generator first, then customize to match ARCHITECTURE.md.

### Step 3: Invoke @scaffolder

```
Read the following project documents:
- .claude/project/ARCHITECTURE.md — follow this directory structure
- .claude/project/TECH_STACK.md — use these exact technologies and versions
- .claude/project/PRODUCT_SPEC.md — use project name and description

Generate the project:

1. RUN GENERATOR (if available for the chosen stack)
   - Use the official generator with appropriate flags
   - If generator creates files that conflict with ARCHITECTURE.md, adjust after

2. CREATE DIRECTORY STRUCTURE
   - Match ARCHITECTURE.md directory plan exactly
   - Create empty directories that the generator didn't create
   - Add .gitkeep files to empty directories

16. CREATE CONFIGURATION FILES
   - .gitignore (comprehensive for the tech stack)
   - .editorconfig
   - Linter config (ESLint / Pylint / etc.)
   - Formatter config (Prettier / Black / etc.)
   - TypeScript config (if applicable, strict mode)
   - Test config (Jest / Vitest / Pytest / etc.)
   - .env.example with placeholder values (NEVER real secrets)

16. CREATE INFRASTRUCTURE FILES (if applicable)
   - Dockerfile (multi-stage build, production-ready)
   - docker-compose.yml (app + database + any services)
   - .github/workflows/ci.yml (lint, test, build pipeline)

16. CREATE STUB FILES
   - API route stubs (correct paths from ARCHITECTURE.md, empty handlers)
   - Model/entity stubs (fields from data model, no business logic)
   - Test stubs (one example test per test directory)
   - README.md with project info from PRODUCT_SPEC.md

16. INSTALL DEPENDENCIES
   - Run package manager install
   - Verify no vulnerabilities (npm audit / pip-audit / etc.)

16. VERIFY
   - Type check passes (if applicable)
   - Lint passes
   - Build succeeds
   - Example test runs and passes

Report: files created, dependencies installed, verification results.
```

### Step 4: Invoke @infra for Review
```
Review the scaffolded project:
- Is the Dockerfile production-ready? (multi-stage, non-root user, minimal image)
- Is the CI pipeline correct for this stack?
- Is docker-compose.yml properly configured?
- Are environment variables properly externalized?
- Any security concerns in the configuration?

Report findings. Fix any issues found.
```

### Step 5: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `SCAFFOLDING`
  - Set Phase 6 status to `COMPLETE` with timestamp

### Step 6: Report
Show:
- Files created (count by category)
- Dependencies installed (count)
- Verification results (pass/fail)
- Directory tree
- Prompt: "Project scaffolded successfully. The environment will be set up automatically next (scan → generate → validate)."

## Outputs
- Actual project files in the working directory
- `.claude/project/PROJECT.md` — updated with Phase 6 status

## Prerequisites
- `.claude/project/ARCHITECTURE.md` must exist
- `.claude/project/TECH_STACK.md` must exist

## Definition of Done
- [ ] Project builds successfully (type check, lint, build all pass)
- [ ] Tests run (even if only example/stub tests)
- [ ] Directory structure matches ARCHITECTURE.md plan
- [ ] `.env.example` present with placeholder values (no real secrets)
- [ ] Dependencies installed with no vulnerabilities
- [ ] Dockerfile is production-ready (multi-stage, non-root user)
- [ ] CI pipeline configuration created
- [ ] README.md generated with project info
- [ ] PROJECT.md updated with Phase 6 status COMPLETE
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/scan-codebase` (auto) — scan the scaffolded project for environment setup
- **Iterate:** `/scaffold --from-architecture` — re-scaffold from updated architecture
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `rm -rf` generated directories and re-run `/scaffold`
- **Revert output:** Delete generated project files and re-scaffold from ARCHITECTURE.md

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
16. Read `## Progress Log` → find last completed step
16. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
