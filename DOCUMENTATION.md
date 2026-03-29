# Claude Code Scanner — Complete Documentation

> Scan any codebase **or start from scratch** — generate a production-ready AI-powered development environment with 23 role-based agents, 68 workflow skills, 18 automation hooks, and full lifecycle support from idea to deployment.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [Quick Start (5 Minutes)](#2-quick-start)
3. [Installation Methods](#3-installation-methods)
4. [How It Works (4-Phase Setup)](#4-how-it-works)
4b. [New Project Mode (Idea to Launch)](#4b-new-project-mode)
5. [The Agent Team (23 Roles)](#5-the-agent-team)
6. [Skills Reference (68 Skills)](#6-skills-reference)
7. [The Workflow Engine (13 Phases)](#7-the-workflow-engine)
8. [Loop Flows & Circuit Breakers](#8-loop-flows--circuit-breakers)
9. [Hooks & Automation (18 Hooks)](#9-hooks--automation)
10. [Task Tracking System](#10-task-tracking-system)
11. [Execution Reports & Scoring](#11-execution-reports--scoring)
12. [Context Budget Management](#12-context-budget-management)
13. [Drift Detection & Sync](#13-drift-detection--sync)
14. [Error Recovery](#14-error-recovery)
15. [Configuration Reference](#15-configuration-reference)
16. [File Structure](#16-file-structure)
17. [Customization Guide](#17-customization-guide)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. What Is This?

Claude Code Scanner is a tool that scans your existing codebase **or helps you start from scratch** and generates a complete Claude Code development environment tailored to your project. Instead of manually configuring agents, skills, and rules, the scanner reads your actual code (or helps you design it from an idea) and creates everything automatically.

**What you get:**
- 23 AI agents organized as a development team (tech lead, architect, QA lead, developers, code quality guardian, ideator, strategist, etc.)
- 68 workflow skills for common workflows (including 9 pre-development, 6 real-environment testing, 8 audit/compliance, 2 observability, and 8 utility skills)
- 18 automation hooks that run behind the scenes
- **NEW:** 8-phase pre-development pipeline (idea → product spec → features → tech stack → architecture → scaffolding → environment → launch plan)
- A 13-phase SDLC workflow from task intake to production deployment
- Execution analytics with success scoring and hallucination detection
- Automatic drift detection that keeps your environment in sync with your codebase

**Who it's for:**
- Development teams using Claude Code who want structured AI-assisted workflows
- Projects that need role-based agent access control (read-only reviewers, write-capable developers)
- Teams that want full SDLC automation (not just code generation)

---

## 2. Quick Start

```bash
# Step 1: Go to your project
cd /path/to/your-project

# Step 2: Install the scanner
npx claude-code-scanner init

# Step 3: Start Claude Code
claude

# Step 4: Scan your codebase (2-5 minutes)
/scan-codebase

# Step 5: Generate your environment
/generate-environment

# Step 6: Start working
/workflow new "add user notifications feature"
```

That's it. Your project now has a complete AI development team.

### Quick Start — New Project (from idea)
```bash
# Step 1: Create a new project
npx claude-code-scanner new my-awesome-app

# Step 2: Enter the project
cd my-awesome-app

# Step 3: Start Claude Code
claude

# Step 4: Run the pre-development pipeline
/new-project "Build a SaaS invoicing tool for freelancers"

# The pipeline guides you through:
# 1. Brainstorming → 2. Product Spec → 3. Features → 4. Tech Stack
# 5. Architecture → 6. Scaffolding → 7. Environment → 8. Launch Plan

# Step 5: Build MVP features
/workflow new "User authentication with email/password"
```

Or go fully automated: `/idea-to-launch "your idea"`

---

## 3. Installation Methods

### npx (Recommended — No Install)
```bash
npx claude-code-scanner init
```

### One-Line Install (macOS/Linux)
```bash
curl -fsSL https://raw.githubusercontent.com/m-adnan-khalid/claude-code-scanner/master/install.sh | bash
```

### One-Line Install (Windows PowerShell)
```powershell
irm https://raw.githubusercontent.com/m-adnan-khalid/claude-code-scanner/master/install.ps1 | iex
```

### Git Clone
```bash
git clone https://github.com/m-adnan-khalid/claude-code-scanner.git /tmp/scanner
cp /tmp/scanner/template/CLAUDE.md ./CLAUDE.md
cp -r /tmp/scanner/template/.claude ./.claude
rm -rf /tmp/scanner
```

### Global Install
```bash
npm install -g claude-code-scanner
claude-code-scanner init
```

### CLI Commands After Install
```bash
claude-code-scanner init          # Set up environment
claude-code-scanner init --force  # Overwrite existing files
claude-code-scanner status        # Check setup status
claude-code-scanner verify        # Run 170+ validation checks
claude-code-scanner update        # Update to latest version
```

### Requirements
- Node.js >= 18
- Claude Code CLI installed
- Works on Windows, macOS, and Linux

---

## 4. How It Works

The setup runs in 4 phases:

### Phase 1: Scan (`/scan-codebase`)

Spawns 6 parallel agents that read your actual code:

| Agent | What It Does |
|-------|-------------|
| Technology Fingerprinter | Reads 100+ marker files (package.json, go.mod, Cargo.toml, etc.) to identify languages, frameworks, databases, APIs, testing tools, and infrastructure |
| Directory Scanner | Maps your project tree up to 4 levels, classifying each directory (source, tests, config, generated, vendor) |
| Backend Scanner | Reads source files to identify API routes, middleware, validation, auth, database layer, background jobs, error handling |
| Frontend Scanner | Reads 3-5 components to identify framework, rendering mode, routing, state management, styling, TypeScript config |
| Architecture Mapper | Traces a request end-to-end through your system, maps module boundaries, dependency graph, deployment topology |
| Convention Extractor | Reads 20+ files to extract naming conventions, code style, error patterns, git conventions, TODOs, existing AI config |

**Output:** `.claude/scan-results.md` — a structured manifest of everything found.

### Phase 2: Generate (`/generate-environment`)

Takes the scan results and generates project-specific files:
- CLAUDE.md with your exact commands, paths, and conventions
- Rules that enforce your codebase patterns
- Agents configured for your tech stack
- Skills with your project's commands and file paths
- Templates extracted from your real code (not generic boilerplate)
- Hooks customized for your formatter, linter, and test runner

### Phase 3: Validate (`/validate-setup`)

Runs 170+ automated checks:
- CLAUDE.md under 200 lines, no placeholders
- All 23 agents compliant (frontmatter, HANDOFF, limitations)
- All skills have proper frontmatter (context:fork, argument-hint)
- Settings.json valid, all hooks registered
- Context budget under limits
- Flow engine documentation complete

### Phase 4: Extend (`/setup-smithery`)

Optionally installs community skills and MCP servers matching your tech stack (React tools, database connections, CI/CD integrations).

---

## 4b. New Project Mode (Idea to Launch)

For brand-new projects with no existing code, use `npx claude-code-scanner new <name>` followed by `/new-project "idea"`.

### The 8 Pre-Development Phases

| # | Phase | Agent(s) | Output | User Gate |
|---|-------|----------|--------|-----------|
| 1 | Ideation | @ideator | IDEA_CANVAS.md | Yes |
| 2 | Product Spec | @strategist + @ux-designer | PRODUCT_SPEC.md | Yes |
| 3 | Feature Map | @strategist | BACKLOG.md | Yes |
| 4 | Tech Selection | @architect | TECH_STACK.md | Yes |
| 5 | Architecture | @architect + @ux-designer | ARCHITECTURE.md | Yes |
| 6 | Scaffolding | @scaffolder + @infra | Project files | No |
| 7 | Environment | auto (scan/generate/validate) | .claude/ config | No |
| 8 | Launch Planning | @infra | DEPLOY_STRATEGY.md | No |

### How It Connects to SDLC

After pre-development completes, the project is `READY_FOR_DEV`. Each Must-Have feature from the backlog becomes a `/workflow new` task that runs through the existing 13-phase SDLC. The SDLC phases automatically reference pre-dev documents:

- **Phase 1 (Intake):** Pre-populates scope from BACKLOG.md
- **Phase 3 (Architecture):** References ARCHITECTURE.md instead of designing from scratch
- **Phase 4 (Business):** References PRODUCT_SPEC.md for acceptance criteria
- **Phase 11 (Deploy):** References DEPLOY_STRATEGY.md for deployment approach

### Variants

- `/new-project "idea" --fast` — Combines phases 1+2+3 into single pass
- `/new-project "idea" --skip-brainstorm` — Starts at phase 2
- `/new-project --resume` — Resumes from last completed phase
- `/idea-to-launch "idea"` — Full automation: pre-dev + SDLC for all MVP features

### Project State Files

All pre-dev state persists in `.claude/project/`:
- `PROJECT.md` — master tracker with phase progress
- `IDEA_CANVAS.md` — brainstorming output
- `PRODUCT_SPEC.md` — product specification
- `BACKLOG.md` — prioritized feature list
- `TECH_STACK.md` — technology decisions
- `ARCHITECTURE.md` — system design
- `DEPLOY_STRATEGY.md` — deployment plan

See `.claude/docs/pre-dev-flow-engine.md` for detailed phase documentation and `.claude/docs/new-project-guide.md` for usage guide.

---

## 5. The Agent Team

### Understanding Agent Roles

The scanner creates a 23-agent team organized like a real development organization. Each agent has:

- **Specific tools** — what it can read/write/execute
- **Permission mode** — read-only agents can't modify code
- **Model assignment** — opus for complex reasoning, sonnet for routine work
- **Memory** — persists context across sessions
- **Structured output** — standardized HANDOFF blocks for agent-to-agent communication
- **Explicit limitations** — what the agent must NOT do

### SDLC Role Agents (Leadership)

These 4 agents manage the development process. Three are **read-only** — they review, plan, and decide, but never write code. The @team-lead has Read/Write access to orchestrate work.

#### @team-lead (Tech Lead)
```
Model: opus | Access: Read/Write | MaxTurns: 50
```
The orchestrator. Assigns tasks to agents, tracks progress, resolves blockers, provides tech sign-off. The only agent that coordinates work across the entire team.

**When to use:** You don't call @team-lead directly — the `/workflow` skill invokes it automatically. But you can ask it to check task status or resolve a blocker.

**Example:**
```
@team-lead what's the status of TASK-001?
@team-lead assign the auth refactor to @api-builder
```

#### @architect (Software Architect)
```
Model: opus | Access: Read-only | MaxTurns: 25
```
Designs solutions with alternatives and trade-offs. Reviews architecture impact of changes. Creates Mermaid diagrams.

**When to use:** Before making structural changes, when evaluating multiple approaches, or when you need a design document.

**Example:**
```
@architect design the migration from REST to GraphQL
@architect review the impact of splitting the user service
```

**Output includes:** Design options table, recommendation with rationale, Mermaid diagram, decision record.

#### @product-owner (Product Owner)
```
Model: opus | Access: Read-only | MaxTurns: 20
```
Writes acceptance criteria in GIVEN/WHEN/THEN format. Validates business requirements against implementation. Provides business sign-off.

**When to use:** When defining what a feature should do, when verifying requirements are met, or during business sign-off.

**Example:**
```
@product-owner write acceptance criteria for the password reset feature
@product-owner verify TASK-001 meets the business requirements
```

**Output includes:** Acceptance criteria table (GIVEN/WHEN/THEN with PENDING/VERIFIED/FAILED status), sign-off decision.

#### @qa-lead (QA Lead)
```
Model: sonnet | Access: Read-only | MaxTurns: 25
```
Creates QA test plans, triages bugs by severity (P0-P4), provides QA sign-off. Distinct from @tester — @qa-lead plans strategy, @tester writes and runs tests.

**When to use:** When you need a test plan, when triaging bugs, or during QA sign-off.

**Example:**
```
@qa-lead create a QA plan for the checkout flow changes
@qa-lead triage these 5 bugs and recommend which block release
```

**Output includes:** Scenario table (happy path, edge cases, regression, security, accessibility), bug severity classification, sign-off decision.

### Core Agents (Specialists)

#### @explorer (Codebase Navigator)
```
Model: sonnet | Access: Read-only | MaxTurns: 30
```
Investigates how code works. Traces data flow, maps dependencies, assesses change impact.

**When to use:** When you need to understand unfamiliar code, trace a bug's path, or assess what a change will affect.

**Example:**
```
@explorer how does the auth middleware work?
@explorer what would be affected if I change the User model?
@explorer trace the order creation flow from API to database
```

**Output includes:** File:line references, dependency graph, impact assessment with risk level.

#### @reviewer (Code Reviewer)
```
Model: sonnet | Access: Read-only | MaxTurns: 20
```
Reviews code changes for quality, conventions, and correctness. Generates comments with file:line references.

**When to use:** After writing code, before creating a PR, or when reviewing someone else's changes.

**Example:**
```
@reviewer review my changes in the last 3 commits
@reviewer check the auth module for best practices
```

**Output includes:** Review summary (APPROVE/REQUEST_CHANGES), comments table with file:line and severity.

#### @security (Security Reviewer)
```
Model: opus | Access: Read-only | MaxTurns: 20
```
Reviews code for vulnerabilities, auth issues, and OWASP Top 10 risks. Checks for injection, XSS, broken auth, PII exposure, hardcoded secrets.

**When to use:** Before any code touches auth, user input, database queries, or handles sensitive data.

**Example:**
```
@security audit the new payment endpoint
@security check for PII exposure in the logging module
```

**Output includes:** Findings table with severity/category/recommendation, risk level (LOW/MEDIUM/HIGH/CRITICAL).

#### @debugger (Bug Fixer)
```
Model: opus | Access: Read/Write | MaxTurns: 40
```
Finds root causes and applies minimal fixes. Uses structured reasoning: reproduce, hypothesize, narrow, verify, fix, regress.

**When to use:** When tests fail, CI breaks, or there's a bug in production.

**Example:**
```
@debugger the user creation test is failing with "null reference"
@debugger fix the CI failure in the auth pipeline
```

**Output includes:** Debug report (error, root cause, evidence, fix), regression test, files modified.

#### @tester (Test Writer)
```
Model: sonnet | Access: Read/Write | MaxTurns: 30
```
Writes automated tests (unit, integration, e2e) following your project's existing patterns. Runs test suites and measures coverage.

**When to use:** After implementing a feature, when coverage is low, or when you need regression tests.

**Example:**
```
@tester write tests for the new order service
@tester check coverage for the auth module
```

**Output includes:** Test report (tests written, passing/failing, coverage before/after).

### Dev Agents (Builders)

#### @api-builder (Backend Developer)
```
Model: sonnet | Access: Read/Write + Worktree | MaxTurns: 30
```
Builds API endpoints, services, middleware, validation. Follows your project's existing patterns exactly.

**When to use:** When building backend features — routes, handlers, services, database operations.

**Example:**
```
@api-builder create POST /api/orders endpoint with validation
@api-builder add pagination to the users list endpoint
```

**Output includes:** Implementation summary (endpoint, files, auth, validation, response format).

#### @frontend (Frontend Developer)
```
Model: sonnet | Access: Read/Write + Worktree | MaxTurns: 30
```
Builds UI components, pages, styling. Ensures accessibility (ARIA, keyboard, screen reader support).

**When to use:** When building UI — components, pages, forms, styling.

**Example:**
```
@frontend create a UserProfile component with edit mode
@frontend add a dashboard page with charts
```

**Output includes:** Implementation summary (files, component API, accessibility notes).

#### @infra (DevOps Engineer)
```
Model: sonnet | Access: Read/Write | MaxTurns: 30
```
Manages Docker, CI/CD, deployment, cloud resources. Never hardcodes secrets.

**When to use:** For infrastructure changes — Dockerfiles, CI pipelines, deployment scripts, environment configuration.

**Example:**
```
@infra add a staging deployment to the GitHub Actions workflow
@infra optimize the Docker build for faster CI
```

**Output includes:** Infrastructure changes, new env vars, rollback plan.

### Pre-Development Agents (New Project Lifecycle)

#### @ideator (Brainstorming Specialist)
```
Model: opus | Access: Read-only | MaxTurns: 25
```
Creative brainstorming specialist. Explores problem spaces, identifies audiences, articulates value propositions through structured questioning.

**When to use:** Starting a new project, exploring an idea, evaluating viability.

**Example:**
```
@ideator help me think through this idea for a freelancer invoicing tool
```

**Output includes:** Idea Canvas with Problem Statement, Target Audience, Value Proposition, SWOT, Risks, Viability Assessment.

#### @strategist (Product Strategy Specialist)
```
Model: opus | Access: Read/Write (project docs only) | MaxTurns: 30
```
Converts ideas into concrete product specs with MVP scope, user journeys, and prioritized feature backlogs using MoSCoW method.

**When to use:** Defining MVP scope, writing user stories, prioritizing features.

**Example:**
```
@strategist define the MVP for this invoicing tool
@strategist prioritize the feature backlog using MoSCoW
```

**Output includes:** Product Spec, Feature Backlog with MoSCoW categories, sized features, implementation order.

#### @scaffolder (Project Generation Specialist)
```
Model: sonnet | Access: Read/Write + Bash | MaxTurns: 40
```
Generates real project directory structures, configs, and boilerplate from architecture decisions. Uses official generators when available.

**When to use:** Setting up a new project from approved architecture.

**Example:**
```
@scaffolder generate the project structure from ARCHITECTURE.md
```

**Output includes:** Scaffolding Report with files created, dependencies installed, verification results.

#### @ux-designer (UX Design Specialist)
```
Model: opus | Access: Read-only | MaxTurns: 20
```
Creates user flows (Mermaid), wireframe descriptions, information architecture, and interaction patterns.

**When to use:** Designing user experiences, mapping user flows, planning screens.

**Example:**
```
@ux-designer create user flows for the invoicing workflow
@ux-designer design the dashboard screen layout
```

**Output includes:** User Flows (Mermaid), Page Hierarchy, Wireframe Descriptions, Accessibility Notes.

#### @code-quality (Principal Engineer & Code Quality Guardian)
```
Model: opus | Access: Read-only | MaxTurns: 40
```
30+ years of experience building planet-scale systems. Enforces design patterns (SOLID, GoF), detects code duplication, runs SonarQube-style static analysis, and recommends optimal architecture for scalability. Works in two modes: **pre-implementation** (pattern selection & quality gates) and **post-implementation** (audit & scoring).

**When to use:** Before starting implementation (choose the right patterns), after implementation (verify quality), when refactoring, when evaluating scalability.

**Example:**
```
@code-quality review this use case and recommend design patterns
@code-quality audit src/services/ for SOLID violations and duplication
@code-quality is this architecture ready for 100x scale?
```

**Output includes:** Design Pattern Recommendations, SOLID Compliance Score (0-100), Code Duplication Report, Complexity Hotspots, Scalability Risks, Technical Debt Estimate.

#### @mobile (Mobile Development Specialist)
```
Model: opus | Access: Read/Write + worktree | MaxTurns: 35
```
Senior mobile engineer covering all major platforms: iOS (Swift/SwiftUI), Android (Kotlin/Jetpack Compose), React Native, Flutter, and Kotlin Multiplatform. Handles screens, navigation, state management, offline-first, push notifications, deep linking, platform APIs, and app store submission.

**When to use:** Building mobile screens/features, mobile-specific architecture decisions, platform integration (camera, notifications, biometrics), app store preparation.

**Example:**
```
@mobile build the login screen with biometric auth support
@mobile set up push notifications for iOS and Android
@mobile implement offline-first data sync for the orders feature
```

**Output includes:** Implementation Summary, Platform, Architecture Pattern, Offline Support, Accessibility Notes, Platform-Specific Notes.

**Related skill:** `/mobile-audit` — comprehensive mobile quality audit (performance, UX, accessibility, store readiness, security).

#### @database (Database Engineer)
```
Model: sonnet | Access: Read/Write | MaxTurns: 30
```
Designs schemas, writes migrations, optimizes queries, manages indexes. Handles safe schema changes with rollback plans and zero-downtime migration strategies.

**When to use:** Schema design, creating or modifying migrations, query performance issues, index optimization.

**Example:**
```
@database design the schema for the invoicing module
@database optimize the slow query on the orders table
@database create a migration to add soft deletes to users
```

**Output includes:** Schema diagrams, migration files, query analysis with EXPLAIN output, index recommendations.

#### @docs-writer (Documentation Specialist)
```
Model: sonnet | Access: Read/Write (docs only) | MaxTurns: 25
```
Writes and maintains READMEs, API documentation, Architecture Decision Records (ADRs), changelogs, and onboarding guides. Ensures documentation stays in sync with code changes.

**When to use:** Writing or updating documentation, creating ADRs, generating changelogs, onboarding guides.

**Example:**
```
@docs-writer write the API documentation for the orders service
@docs-writer create an ADR for choosing PostgreSQL over MongoDB
@docs-writer update the README with the new setup instructions
```

**Output includes:** Documentation files, ADR records, changelog entries, documentation coverage report.

#### @gatekeeper (Autonomous Quality Gate Enforcer)
```
Model: opus | Access: Read-only | MaxTurns: 30
```
Validates changes autonomously before they advance through workflow phases. Detects regressions, enforces quality standards, and ensures consistency across the codebase. Acts as the final checkpoint before phase transitions.

**When to use:** Automated change validation, regression detection, quality gate enforcement between workflow phases.

**Example:**
```
@gatekeeper validate TASK-001 changes before review
@gatekeeper check for regressions in the auth module
@gatekeeper enforce quality gates for the release candidate
```

**Output includes:** Validation report, regression analysis, quality score, gate decision (PASS/FAIL/WARN).

#### @process-coach (SDLC Methodology Specialist)
```
Model: opus | Access: Read/Write (docs only) | MaxTurns: 25
```
Selects and configures SDLC methodology (Scrum, Kanban, XP, etc.) based on team size, project type, and constraints. Adapts agents, workflows, quality gates, and ceremonies to the chosen methodology.

**When to use:** Setting up development methodology, configuring sprint cycles, adapting workflow to team preferences.

**Example:**
```
@process-coach set up Scrum for a 5-person team with 2-week sprints
@process-coach adapt the workflow for Kanban with WIP limits
@process-coach recommend a methodology for this solo side project
```

**Output includes:** Methodology configuration, ceremony schedule, role mappings, workflow adaptations, quality gate adjustments.

#### @qa-automation (QA Automation Specialist)
```
Model: sonnet | Access: Read/Write | MaxTurns: 35
```
Deploys the application, runs end-to-end test flows, performs visual verification, and validates user journeys across environments. Bridges the gap between unit tests and manual QA.

**When to use:** Running E2E test suites, visual regression testing, validating deployment health, smoke testing after deploys.

**Example:**
```
@qa-automation run the full E2E suite against staging
@qa-automation verify the checkout flow after the payment update
@qa-automation check for visual regressions on the dashboard
```

**Output includes:** E2E test results, visual diff report, environment health check, user journey verification status.

### Agent Communication

Agents communicate through structured **HANDOFF** blocks:

```
HANDOFF:
  from: @tester
  to: @team-lead
  reason: testing complete — 3 failures found
  artifacts:
    - test-results.json
    - coverage-report.html
  context: |
    3 tests fail in auth module. Root cause appears to be
    missing null check in token validation.
  iteration: 2/5
  execution_metrics:
    turns_used: 12
    files_read: 8
    files_modified: 3
    tests_run: 47 (44 pass / 3 fail / 0 skip)
    coverage_delta: "+2%"
    hallucination_flags: CLEAN
    regression_flags: CLEAN
    confidence: HIGH
```

**All routing goes through the orchestrator.** Agents never call each other directly — subagents can't spawn subagents in Claude Code.

---

## 6. Skills Reference

Skills are slash commands you type in Claude Code. Here's every skill and how to use it.

### Setup Skills

#### /scan-codebase
```
/scan-codebase
/scan-codebase /path/to/project
```
Scans your codebase with 6 parallel agents. Takes 2-5 minutes. Outputs scan results to `.claude/scan-results.md`. Run this first before generating the environment.

#### /generate-environment
```
/generate-environment
```
Takes scan results and generates all Claude Code files (CLAUDE.md, agents, skills, hooks, rules, templates, profiles). Must run `/scan-codebase` first — will error if scan results are missing.

#### /validate-setup
```
/validate-setup
```
Runs 170+ automated checks on your environment. Reports PASS/FAIL/WARN with specific fix instructions. Run after `/generate-environment` to verify everything is correct.

#### /setup-smithery
```
/setup-smithery
```
Installs community Smithery skills and MCP servers matching your tech stack. Optional — enhances the environment with third-party tools.

### Workflow Skills

#### /workflow
```
/workflow new "add user notifications"      # Start full 13-phase SDLC
/workflow new --hotfix "fix login crash"     # Fast-track hotfix (tighter limits)
/workflow new --spike "evaluate Redis"       # Research only (no code)
/workflow status                             # Show all active tasks
/workflow resume TASK-001                    # Resume ON_HOLD task
/workflow cancel TASK-001                    # Cancel with cleanup
/workflow dev TASK-001                       # Jump to development phase
/workflow review TASK-001                    # Jump to review phase
/workflow deploy TASK-001                    # Jump to deployment phase
```
The main orchestrator. Coordinates all 23 agents through 13 phases. Includes automatic drift detection at Phase 1, context budget checks between phases, and execution reports after each phase.

#### /task-tracker
```
/task-tracker create "implement search"      # Create new task
/task-tracker status                         # Dashboard of all tasks
/task-tracker status TASK-001                # Single task detail
/task-tracker update TASK-001 phase=6 status=DEV_TESTING
/task-tracker update TASK-001 blocked="waiting on API team"
/task-tracker update TASK-001 unblocked
/task-tracker report TASK-001                # Full detail report
/task-tracker dashboard                      # Visual dashboard
/task-tracker history TASK-001               # Timeline of events
/task-tracker blockers                       # All open blockers
/task-tracker metrics                        # Aggregate performance
```
Manages task lifecycle from BACKLOG to CLOSED. Tracks every phase, loop iteration, handoff, blocker, and decision.

### Analysis Skills

#### /impact-analysis
```
/impact-analysis "replace the auth middleware"
/impact-analysis "upgrade React from 18 to 19"
```
Runs @explorer + @security in parallel to assess blast radius. Outputs: files affected, transitive dependencies, test coverage %, security flags, risk level, Mermaid dependency diagram.

#### /context-check
```
/context-check                  # Check current context usage
/context-check --compact        # Check and auto-compact if over budget
```
Measures context window usage against the 60% working budget. Reports GREEN/YELLOW/ORANGE/RED status. Recommends compaction when needed. Runs automatically between workflow phases.

### Reporting Skills

#### /execution-report
```
/execution-report TASK-001              # Full task report
/execution-report TASK-001 --phase 6    # Single phase report
/execution-report last                  # Most recent task
/execution-report all --verbose         # All tasks with detail
```
Post-execution analytics. Generates:
- **Success Score (0-100):** completeness + quality + efficiency
- **Hallucination Check (0-3):** verifies file references, function names, conventions
- **Regression Impact (0-3):** test results, coverage delta, lint/type/build status
- **Agent Communication:** handoff count, loop iterations, parallel executions
- **Token/Context Usage:** estimated consumption, peak context %

#### /progress-report
```
/progress-report dev TASK-001           # Developer: files, tests, coverage
/progress-report qa TASK-001            # QA: changes, test scenarios, risks
/progress-report business               # Business: acceptance criteria, ETA
/progress-report management             # Management: portfolio table, health
/progress-report executive              # Executive: status light, key metrics
```
Generates audience-specific reports. Each audience gets different information at different detail levels.

#### /metrics
```
/metrics velocity                       # Tasks/week, throughput, WIP
/metrics quality                        # Test pass rate, coverage, bug escape rate
/metrics cycle-time                     # Per-phase average, bottlenecks
/metrics agents                         # Per-agent performance, rework rate
/metrics blockers                       # Resolution time, categories
/metrics all --period 30d               # Everything, last 30 days
```
Calculates aggregate performance metrics from task records.

### Maintenance Skills

#### /sync
```
/sync --check                           # Detect drift (report only)
/sync --fix                             # Detect and auto-repair
/sync --fix --component agents          # Fix only agent files
/sync --fix --component claude-md       # Fix only CLAUDE.md
/sync --full-rescan                     # Complete re-scan + regenerate
```
Detects drift between your Claude Code environment and the actual codebase across 8 categories: agents, skills, hooks, rules, CLAUDE.md, settings, tech stack, project structure. See [Section 13](#13-drift-detection--sync) for details.

#### /rollback
```
/rollback deploy TASK-001               # Rollback failed deployment
/rollback code TASK-001                 # Revert all code changes
/rollback phase TASK-001 --to-phase 5   # Undo back to Phase 5
/rollback code --to-commit abc123       # Revert to specific commit
```
Safely undoes deployments, code changes, or workflow phases. Always creates revert commits (never rewrites history). Always runs tests after rollback.

---

## 7. The Workflow Engine

The `/workflow` skill orchestrates a 13-phase software development lifecycle. Each phase has specific entry/exit criteria, assigned agents, and quality gates.

### Phase Overview

```
Phase 1:  Task Intake       — classify, create branch, drift check
Phase 2:  Impact Analysis    — @explorer + @security blast radius scan
Phase 3:  Architecture       — @architect designs solution (skip if small+LOW)
Phase 4:  Business Analysis  — @product-owner writes acceptance criteria
Phase 5:  Development        — @api-builder / @frontend / @infra build code
Phase 6:  Dev Self-Testing   — @tester runs tests, @debugger fixes failures
Phase 7:  Code Review        — @reviewer + @security review in parallel
Phase 8:  PR + CI            — Create PR, fix CI failures
Phase 9:  QA Testing         — @qa-lead plans, @tester executes, bug loop
Phase 10: Sign-offs          — QA -> Business -> Tech sequential gates
Phase 11: Deployment         — @infra deploys with health checks
Phase 12: Post-Deploy        — Monitor, close issues, notify
Phase 13: Execution Report   — Scored analytics for the entire workflow
```

### Workflow Variants

**Normal Feature:**
All 13 phases in order.

**Hotfix (`--hotfix`):**
Skips Phase 3 (Architecture) and Phase 4 (Business). Uses tighter circuit breakers (max 3 dev-test iterations instead of 5, max 1 deploy attempt). @debugger is the primary dev agent instead of @api-builder.

**Spike (`--spike`):**
Research only. Runs Phase 1-3 (Intake, Impact, Architecture investigation). Produces a research report with findings and recommendation. No code, no tests, no deployment.

### Phase Details

#### Phase 1: Task Intake
- Automatic drift check via `/sync --check`
- Classifies: type (feature/bugfix/refactor/hotfix/spike)
- Classifies: scope (frontend/backend/fullstack/infra)
- Classifies: complexity (small/medium/large)
- Creates branch and task record in `.claude/tasks/TASK-{id}.md`
- Checks `depends-on` — blocks if dependency task not ready

#### Phase 3: Architecture Review — Skip Condition
Automatically skipped when ALL of:
- complexity == small
- risk == LOW (from Phase 2)
- type != refactor

When skipped, logged in task record. When NOT skipped, @architect produces design with alternatives, Mermaid diagrams, and decision record. User must approve before continuing.

#### Phase 5: Development — Sub-Steps

| Sub-step | Condition | Agent |
|----------|-----------|-------|
| 5a: DB migrations | Backend scope + database changes | @api-builder |
| 5b: Backend code | Backend scope | @api-builder |
| 5c: Frontend code | Frontend scope | @frontend |
| 5d: Tests | Always | @tester |

**Fullstack execution:** 5a runs first (DB must be ready). Then 5b + 5c run in parallel using `isolation: worktree` (separate git copies). Backend merges first, frontend adapts. Both must complete before Phase 6.

#### Phase 10: Sign-offs — Preservation Rules

When a sign-off gate rejects, some earlier approvals are preserved:

| Rejection | QA Approval | Biz Approval |
|-----------|-------------|-------------|
| QA rejects (bugs) | INVALIDATED | INVALIDATED |
| Business rejects (reqs) | PRESERVED | INVALIDATED |
| Business rejects (UI) | PRESERVED | INVALIDATED |
| Tech rejects (architecture) | INVALIDATED | INVALIDATED |
| Tech rejects (perf/tests) | PRESERVED | PRESERVED |

---

## 8. Loop Flows & Circuit Breakers

Every loop in the workflow has a maximum iteration count. When hit, execution STOPS and escalates to the user.

### Loop Summary

| Loop | Phase | Normal Max | Hotfix Max | Scope |
|------|-------|-----------|------------|-------|
| Dev-Test | 6 | 5 iterations | 3 | Global |
| Review-Rework | 7 | 3 iterations | 2 | Global |
| CI Fix | 8 | 3 iterations | 2 | Global |
| QA Bug | 9 | 3 per bug, 15 total | 2/bug, 6 total | Per-bug |
| Sign-off Rejection | 10 | 2 full cycles | 1 cycle | Global |
| Deploy | 11 | 2 attempts | 1 attempt | Global |

### How Loops Work

**Dev-Test Loop (Phase 6):**
```
@tester runs full test suite
  -> ALL PASS -> advance to Phase 7
  -> FAILURES -> route to fix agent by issue type:
       test logic -> @debugger
       backend code -> @api-builder
       frontend code -> @frontend
       config issue -> @infra
     -> fix agent applies fix
     -> @tester re-runs (iteration +1)
     -> iteration 5 -> STOP, escalate to user
```

**Review-Rework Loop (Phase 7):**
```
@reviewer + @security review in parallel
  -> BOTH APPROVE -> advance to Phase 8
  -> SPLIT DECISION -> stricter verdict wins
  -> REQUEST_CHANGES -> route to dev agent by comment type
     -> fix agent addresses comments
     -> ONLY rejecting reviewer(s) re-review
     -> iteration 3 -> STOP, escalate to user
```

**QA Bug Loop (Phase 9):**
```
For each bug (P0 first, then P1, then P2):
  @debugger fixes -> @tester runs regression -> @qa-lead re-verifies
    -> VERIFIED -> close bug
    -> REOPENED -> back to @debugger (iteration +1)
    -> per-bug iteration 3 -> escalate that bug
    -> total attempts > 15 -> escalate entire Phase 9
```

### Circuit Breaker Options

When any loop hits its max, the user is presented with:
1. **Continue** — increase max by N iterations
2. **Re-plan** — go back to Phase 3 (Architecture Review)
3. **Reduce scope** — remove the problematic feature
4. **Cancel** — abandon the task
5. **Assign to human** — flag for manual intervention

### Loop Counter Resets

| Event | What Resets |
|-------|------------|
| Phase 10 rejection -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| Phase 10 rejection -> Phase 3 or 4 | ALL counters reset to 0 |
| Deploy failure -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| ON_HOLD -> resume | NO reset (all preserved) |
| Agent timeout in loop | Counts as +1 iteration |

---

## 9. Hooks & Automation

Hooks are scripts that run automatically in response to events. All hooks are cross-platform Node.js (no bash/jq dependency).

### Hook Reference

| Event | Hook | What It Does |
|-------|------|-------------|
| **SessionStart** (startup/resume/compact) | `session-start.js` | Re-injects active task context. Shows active, ON_HOLD, and BLOCKED tasks |
| **SessionStart** (startup only) | `drift-detector.js` | Checks for environment drift: stale manifest, agent count mismatch, changed dependencies, orphan hooks |
| **PreToolUse** (Edit/Write) | `protect-files.js` | Blocks edits to `.env`, `.env.local`, lock files, CI configs |
| **PreToolUse** (Bash) | `validate-bash.js` | Blocks dangerous commands: `rm -rf /`, fork bombs, `dd if=`, `curl \| bash` |
| **PostToolUse** (Edit/Write) | `post-edit-format.js` | Auto-formats edited files (Prettier, Black, gofmt, rustfmt) |
| **PostToolUse** (Edit/Write) | `track-file-changes.js` | Logs file modifications to active task's changes log |
| **PostToolUseFailure** | `tool-failure-tracker.js` | Logs tool failures for debugging and execution reports |
| **PreCompact** | `pre-compact-save.js` | Saves loop state, handoffs, blockers to disk before compaction destroys them |
| **PostCompact** | `post-compact-recovery.js` | Re-injects loop state, last handoff, open bugs, blockers after compaction |
| **Notification** (permission_prompt) | `notify-approval.js` | OS notification when Claude needs your approval (macOS/Windows/Linux) |
| **SubagentStop** | `track-file-changes.js` | Records file changes from subagent executions |
| **Stop** | `execution-report.js` + prompt | Captures execution snapshot and forces mandatory completion report |
| **StopFailure** | `stop-failure-handler.js` | Preserves task state on rate limits, auth failures, server errors. Provides recovery instructions |

### How Hooks Interact with Workflow

```
Session starts
  -> session-start.js: "ACTIVE TASK: TASK-001 | STATUS: DEV_TESTING"
  -> drift-detector.js: "DRIFT: package.json changed since last sync"

You edit a file
  -> protect-files.js: blocks if .env or lock file
  -> (edit happens)
  -> post-edit-format.js: auto-formats
  -> track-file-changes.js: logs to TASK-001_changes.log

Context hits 95%
  -> pre-compact-save.js: saves loop state to disk
  -> (compaction runs)
  -> post-compact-recovery.js: "LOOP STATE: dev-test-loop: 3/5"

Session ends
  -> execution-report.js: captures metrics snapshot
  -> Stop prompt: forces success score calculation

Session crashes
  -> stop-failure-handler.js: preserves state, logs error
  -> "Recovery: Wait 60 seconds, then resume: claude --continue"
```

---

## 10. Task Tracking System

Every task is tracked as a markdown file in `.claude/tasks/TASK-{id}.md`.

### Task Record Structure

```yaml
---
id: TASK-001
title: Add user notification system
type: feature
scope: fullstack
complexity: medium
priority: P2-medium
status: DEV_TESTING
branch: feat/TASK-001-notifications
pr: 42
assigned-to: @api-builder
depends-on: none
created: 2026-03-26T10:00:00Z
updated: 2026-03-26T14:30:00Z
---
```

### Task States

```
BACKLOG -> INTAKE -> ANALYZING -> DESIGNING -> APPROVED
  -> DEVELOPING -> DEV_TESTING -> REVIEWING -> CI_PENDING
  -> QA_TESTING -> QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF
  -> DEPLOYING -> MONITORING -> CLOSED

Special states (from any active state):
  BLOCKED    — waiting on dependency or manual resolution
  ON_HOLD    — deferred by user or product owner
  CANCELLED  — terminated with cleanup
```

### What Gets Tracked

- **Loop State:** every iteration counter, baseline values, fix agents, last failures
- **Handoff Log:** every agent-to-agent transition with timestamps
- **Timeline:** every event with phase, description, actor, duration
- **Phase Details:** specific outputs for each of 13 phases
- **Blocker Log:** timestamp, severity, owner, resolution
- **Decision Log:** what was decided, rationale, who decided, reversibility
- **Risk Register:** risks, likelihood, impact, mitigation status
- **Execution Reports:** per-phase scores, token usage, agent stats
- **Bug Records:** per-bug severity, status, fix iterations

---

## 11. Execution Reports & Scoring

After every phase and at workflow completion, an execution report is generated.

### Success Score (0-100)

| Category | Points | What It Measures |
|----------|--------|-----------------|
| Completeness | 40 | Phase exit criteria met, acceptance criteria verified, no skipped phases, task advanced |
| Quality | 30 | Tests pass, coverage maintained, no lint/type errors, review approved, security clean |
| Efficiency | 30 | Completed within expected turns, no circuit breakers, context under 60%, loops resolved quickly |

**Interpretation:**
- 90-100: EXCELLENT
- 70-89: GOOD
- 50-69: FAIR (rework detected)
- 30-49: POOR
- 0-29: FAILED

### Hallucination Check (0-3)

| Score | Level | Meaning |
|-------|-------|---------|
| 0 | CLEAN | All file:line references verified, all function names real, patterns match project |
| 1 | MINOR | Cosmetic mismatches (wrong line numbers, outdated paths) |
| 2 | MODERATE | Referenced non-existent functions or wrong imports. **Blocks advancement** |
| 3 | SEVERE | Generated code based on invented APIs. **Blocks advancement** |

### Regression Impact (0-3)

| Score | Level | Meaning |
|-------|-------|---------|
| 0 | CLEAN | No new test failures, coverage maintained |
| 1 | LOW | Coverage decreased slightly, no new failures |
| 2 | MEDIUM | New test failures introduced. **Blocks advancement** |
| 3 | HIGH | Build broken or critical regressions. **Blocks advancement** |

### Where Reports Are Saved

```
.claude/reports/executions/TASK-001_phase-6_2026-03-26T100000Z.md   # Per-phase
.claude/reports/executions/TASK-001_final.md                         # Cumulative
.claude/reports/executions/TASK-001_snapshot_1711443600000.json      # Auto-snapshot
```

---

## 12. Context Budget Management

Claude Code has a limited context window. This framework keeps usage under 60% during active work.

### What Loads at Startup (~1.2% of 128K)

| Component | Tokens | Loading |
|-----------|--------|---------|
| CLAUDE.md + rules | ~332 | Always |
| Agent descriptions (12) | ~371 | Always (metadata only) |
| Skill descriptions (13) | ~250 | Always (metadata only) |
| Settings.json | ~572 | Always |
| **Total** | **~1,500** | **1.2%** |

### What Costs Zero

| Component | Why Zero Cost |
|-----------|--------------|
| Agent full bodies | Load in subagent context (separate window) |
| Forked skills (11/13) | Run in fork context (isolated) |
| Templates, profiles, docs | Never auto-loaded |
| File reads by agents | Done in subagent context |

### What Accumulates (Danger)

| Component | Risk |
|-----------|------|
| File reads in main context | Stay in conversation history |
| Agent results returned to main | Each handoff adds content |
| Bash outputs | Especially long ones |
| Non-forked skill invocations | 2 skills: rollback, setup-smithery |

### Enforcement

1. **Between phases:** `/context-check` runs automatically
2. **At 60%:** STOP and compact before continuing
3. **At 75%:** Aggressive compact or session split
4. **At 95%:** PreCompact hook saves state, auto-compaction fires, PostCompact restores state
5. **Compact command:** `/compact "focus on TASK-001 Phase 6"`

---

## 13. Drift Detection & Sync

Over time, your codebase changes — new dependencies, new directories, team role changes. The sync system detects when the Claude Code environment goes stale.

### Automatic Detection (Every Session)

On every session start, `drift-detector.js` checks:
- Manifest age (warns if >14 days since last sync)
- Agent count matches CLAUDE.md
- Dependency file hashes changed since last scan
- Orphan or missing hooks

### Manual Sync

```bash
/sync --check                    # Report only
/sync --fix                      # Auto-repair everything
/sync --fix --component agents   # Fix only agents
/sync --full-rescan              # Re-scan + regenerate from scratch
```

### 8 Drift Categories

| Category | What's Checked |
|----------|---------------|
| Agents | Files vs CLAUDE.md vs workflow vs manifest |
| Skills | Files vs manifest vs frontmatter compliance |
| Hooks | Files vs settings.json registration |
| Rules | Path globs vs actual directories |
| CLAUDE.md | Tech versions, commands, agent table, key paths |
| Settings | Hook refs, permission patterns |
| Tech Stack | Dependency files vs last scan hashes |
| Structure | Directories vs last scan |

### Manifest

`.claude/manifest.json` tracks the state of every generated file. Updated after every `/sync --fix` or `/generate-environment`. Contains SHA-256 hashes of every agent, skill, hook, rule, and dependency file.

---

## 14. Error Recovery

### Agent Hits maxTurns
- Counts as +1 loop iteration
- @team-lead re-invokes with narrowed scope or reassigns to different agent
- If repeatedly hitting limit: escalate to user

### Tool Failure
- Logged by `tool-failure-tracker.js` to `.claude/reports/tool-failures.log`
- Agent should self-recover (retry with different approach)
- 3 consecutive failures: partial HANDOFF with `status: blocked`

### Session Crash (Rate Limit, Auth, Server Error)
- `stop-failure-handler.js` preserves task state
- Recovery depends on error type:
  - Rate limit: wait 60s, `claude --continue`
  - Auth failure: re-authenticate
  - Server error: retry with `claude --continue`
  - Max tokens: resume to continue generation
- Loop state survives (persisted in task file on disk)

### Deploy Failure
- Triaged before routing (not blind re-route to Phase 5):
  - Config issue: @infra fixes, retry directly
  - Code bug: hotfix fast-track
  - Infra issue: @infra resolves, retry
  - Unknown: `/rollback`, escalate to user

### ON_HOLD Tasks
- Resume: `/workflow resume TASK-id`
- 7+ days: session-start warns
- 30+ days: session-start suggests cancel
- All loop counters preserved on resume

### Cancelled Tasks
- Cleanup: close PR, delete branch, remove worktrees
- Task record preserved for history

---

## 15. Configuration Reference

### settings.json

```json
{
  "permissions": {
    "defaultMode": "default",
    "allow": ["Bash(git status)", "Bash(git diff *)"],
    "deny": ["Bash(rm -rf /)", "Bash(sudo *)"]
  },
  "env": {},
  "hooks": { ... }
}
```

- **permissions.defaultMode:** `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`
- **permissions.allow:** Bash command patterns to auto-approve
- **permissions.deny:** Bash command patterns to always block
- **env:** Environment variables
- **hooks:** Event-to-script mappings (see [Section 9](#9-hooks--automation))

### settings.local.json (gitignored)

```json
{
  "env": {
    "DATABASE_URL": "postgres://localhost:5432/myapp",
    "API_KEY": "sk-..."
  }
}
```

Machine-specific settings. Never committed to git.

### CLAUDE.md

Project-level instructions that Claude reads on every session. Max 200 lines (150 recommended). Contains tech stack, commands, architecture, code style, git conventions, key paths.

### Rules (.claude/rules/*.md)

Path-scoped instructions. Each rule has a `paths:` frontmatter that controls when it loads:

```yaml
---
paths:
  - "src/api/**/*.ts"
---
# API rules load only when working in src/api/
```

---

## 16. File Structure

```
your-project/
├── CLAUDE.md                              # Project instructions
├── .claude/
│   ├── manifest.json                      # Drift tracking state
│   ├── settings.json                      # Permissions + hooks
│   ├── settings.local.json                # Personal env vars (gitignored)
│   ├── agents/                            # 23 agent definitions
│   │   ├── team-lead.md                   # SDLC: orchestrator
│   │   ├── architect.md                   # SDLC: design
│   │   ├── product-owner.md               # SDLC: business
│   │   ├── qa-lead.md                     # SDLC: quality
│   │   ├── explorer.md                    # Core: investigation
│   │   ├── reviewer.md                    # Core: code review
│   │   ├── security.md                    # Core: security
│   │   ├── debugger.md                    # Core: bug fixing
│   │   ├── tester.md                      # Core: test writing
│   │   ├── api-builder.md                 # Dev: backend
│   │   ├── frontend.md                    # Dev: UI
│   │   ├── infra.md                       # Dev: DevOps
│   │   ├── ideator.md                     # Pre-dev: brainstorming
│   │   ├── strategist.md                  # Pre-dev: product strategy
│   │   ├── scaffolder.md                  # Pre-dev: project generation
│   │   ├── ux-designer.md                 # Pre-dev: user experience
│   │   ├── code-quality.md                # Core: design patterns & SOLID
│   │   ├── mobile.md                      # Dev: mobile apps
│   │   ├── database.md                    # Dev: schema & migrations
│   │   ├── docs-writer.md                 # Utility: documentation
│   │   ├── gatekeeper.md                  # Core: quality gate enforcement
│   │   ├── process-coach.md               # Utility: SDLC methodology
│   │   └── qa-automation.md               # Core: E2E & visual verification
│   ├── project/                           # Pre-development artifacts
│   │   ├── PROJECT.md                     # Master project status
│   │   ├── IDEA_CANVAS.md                 # Idea brainstorming
│   │   ├── PRODUCT_SPEC.md                # Product specification
│   │   ├── BACKLOG.md                     # Feature backlog (MoSCoW)
│   │   ├── DOMAIN_MODEL.md                # Domain entities & rules
│   │   ├── TECH_STACK.md                  # Technology decisions
│   │   ├── ARCHITECTURE.md                # System architecture
│   │   └── DEPLOY_STRATEGY.md             # Deployment strategy
│   ├── skills/                            # 68 workflow skills
│   │   ├── workflow/SKILL.md
│   │   ├── scan-codebase/SKILL.md
│   │   ├── generate-environment/SKILL.md
│   │   ├── validate-setup/SKILL.md
│   │   ├── setup-smithery/SKILL.md
│   │   ├── task-tracker/SKILL.md
│   │   ├── execution-report/SKILL.md
│   │   ├── progress-report/SKILL.md
│   │   ├── metrics/SKILL.md
│   │   ├── impact-analysis/SKILL.md
│   │   ├── context-check/SKILL.md
│   │   ├── rollback/SKILL.md
│   │   ├── sync/SKILL.md
│   │   ├── new-project/SKILL.md
│   │   ├── brainstorm/SKILL.md
│   │   ├── product-spec/SKILL.md
│   │   ├── feature-map/SKILL.md
│   │   ├── domain-model/SKILL.md
│   │   ├── tech-stack/SKILL.md
│   │   ├── architecture/SKILL.md
│   │   ├── scaffold/SKILL.md
│   │   ├── deploy-strategy/SKILL.md
│   │   ├── idea-to-launch/SKILL.md
│   │   ├── mvp-kickoff/SKILL.md
│   │   ├── mvp-status/SKILL.md
│   │   ├── launch-mvp/SKILL.md
│   │   ├── clarify/SKILL.md
│   │   ├── import-docs/SKILL.md
│   │   ├── cost-estimate/SKILL.md
│   │   ├── release-notes/SKILL.md
│   │   └── mobile-audit/SKILL.md
│   ├── hooks/                             # 18 automation scripts
│   ├── rules/                             # Path-scoped coding rules
│   ├── docs/                              # 11 reference documents
│   ├── profiles/                          # Role-based developer guides
│   ├── templates/                         # Code scaffolding templates
│   ├── scripts/                           # Verification scripts
│   ├── tasks/                             # Task records (gitignored)
│   └── reports/                           # Reports (gitignored)
│       ├── daily/
│       ├── weekly/
│       └── executions/
```

---

## 17. Customization Guide

### Adding a New Agent

1. Create `.claude/agents/my-agent.md` with YAML frontmatter:
```yaml
---
name: my-agent
description: What this agent does. Use when [trigger condition].
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
maxTurns: 30
effort: high
memory: project
---
```

2. Add structured output format, HANDOFF block with execution_metrics, and Limitations section
3. Run `/sync --fix` to update CLAUDE.md agent table and workflow references

### Adding a New Skill

1. Create directory `.claude/skills/my-skill/`
2. Create `.claude/skills/my-skill/SKILL.md`:
```yaml
---
name: my-skill
description: What this skill does.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[argument description]"
---
# My Skill: $ARGUMENTS
Instructions here...
```

3. Run `/sync --fix` to register in commands reference

### Modifying the Workflow

Edit `.claude/skills/workflow/SKILL.md`. If you add a new phase:
1. Add the phase definition with entry/exit criteria
2. Map it to a task state in the Task State Machine section
3. Update the circuit breaker table if the phase has loops
4. Update `.claude/docs/flow-engine.md` with the detailed flow

### Adding a New Hook

1. Create `.claude/hooks/my-hook.js` (Node.js, use `process.stdin` for input, `process.exit(0)` to allow, `process.exit(2)` to block)
2. Register in `.claude/settings.json` under the appropriate event
3. Run `/sync --fix` to verify registration

### Modifying Rules

Edit or create `.claude/rules/my-rule.md`. Use `paths:` frontmatter to scope when the rule loads:
```yaml
---
paths:
  - "src/payments/**"
  - "src/billing/**"
---
# Payment Rules
- All amounts in cents (integer), never floating point
- ...
```

---

## 18. Troubleshooting

### "CLAUDE.md already exists"
```bash
npx claude-code-scanner init --force
```

### Verification fails
```bash
npx claude-code-scanner verify
# Read the FAIL messages and fix each one
```

### "scan-results.md not found"
Run `/scan-codebase` before `/generate-environment`.

### Context keeps hitting 95%
- Run `/context-check` to see what's consuming space
- Use `/compact "focus on current task"` between phases
- Avoid reading large files in main context — let agents read them
- Consider starting a new session for remaining phases

### Agent hits maxTurns repeatedly
- The task may be too complex for one agent invocation
- Break into smaller sub-tasks via @team-lead
- Or increase maxTurns in the agent's .md file

### Drift warnings on every session
```bash
/sync --fix    # Auto-repair stale files
```
Or if too many warnings:
```bash
/sync --full-rescan    # Complete re-scan + regenerate
```

### ON_HOLD task won't resume
```bash
/workflow resume TASK-001
```
If task state is corrupted, read the task file in `.claude/tasks/TASK-001.md` and manually set the status.

### Tests fail after sync
`/sync --fix` updated environment files but didn't change application code. If tests fail, the issue is likely in the code itself, not the environment. Run `@debugger` to investigate.

### Hook blocks a legitimate operation
Check the hook's logic:
- `protect-files.js` blocks .env and lock files
- `validate-bash.js` blocks dangerous commands
If the operation is legitimate, temporarily remove the hook from `settings.json` or modify the hook's filter list.

---

## Summary

| Component | Count |
|-----------|-------|
| Agents | 23 (4 SDLC + 7 core + 5 dev + 7 pre-dev/utility) |
| Skills | 68 (all with proper frontmatter) |
| Hooks | 18 (covering 10 events) |
| Docs | 9 (full protocol coverage) |
| Profiles | 3 (backend, frontend, devops) |
| Workflow Phases | 13 |
| Loop Flows | 6 (all with circuit breakers) |
| Task States | 16 (forward) + 3 (special) |
| Validation Checks | 170+ |

Built for Claude Code. Cross-platform. Zero configuration after scan.
