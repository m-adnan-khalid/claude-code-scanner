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
---

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

3. CREATE CONFIGURATION FILES
   - .gitignore (comprehensive for the tech stack)
   - .editorconfig
   - Linter config (ESLint / Pylint / etc.)
   - Formatter config (Prettier / Black / etc.)
   - TypeScript config (if applicable, strict mode)
   - Test config (Jest / Vitest / Pytest / etc.)
   - .env.example with placeholder values (NEVER real secrets)

4. CREATE INFRASTRUCTURE FILES (if applicable)
   - Dockerfile (multi-stage build, production-ready)
   - docker-compose.yml (app + database + any services)
   - .github/workflows/ci.yml (lint, test, build pipeline)

5. CREATE STUB FILES
   - API route stubs (correct paths from ARCHITECTURE.md, empty handlers)
   - Model/entity stubs (fields from data model, no business logic)
   - Test stubs (one example test per test directory)
   - README.md with project info from PRODUCT_SPEC.md

6. INSTALL DEPENDENCIES
   - Run package manager install
   - Verify no vulnerabilities (npm audit / pip-audit / etc.)

7. VERIFY
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

## Next Step
Automatic: `/scan-codebase` → `/generate-environment` → `/validate-setup` (Pre-Phase 7)
