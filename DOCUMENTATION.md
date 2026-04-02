# Claude Code Scanner — Complete Documentation

> Scan any codebase **or start from scratch** — generate a production-ready AI-powered development environment with 30 role-based agents, 88 workflow skills, 44 automation hooks (25 root + 19 template), and full lifecycle support from idea to deployment.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [Quick Start (5 Minutes)](#2-quick-start)
3. [Installation Methods](#3-installation-methods)
4. [How It Works (4-Phase Setup)](#4-how-it-works)
4b. [New Project Mode (Idea to Launch)](#4b-new-project-mode)
5. [The Agent Team (30 Roles)](#5-the-agent-team)
6. [Skills Reference (88 Skills)](#6-skills-reference)
7. [The Workflow Engine (13 Phases)](#7-the-workflow-engine)
8. [Loop Flows & Circuit Breakers](#8-loop-flows--circuit-breakers)
9. [Hooks & Automation (44 Hooks)](#9-hooks--automation)
10. [Task Tracking System](#10-task-tracking-system)
11. [Execution Reports & Scoring](#11-execution-reports--scoring)
12. [Context Budget Management](#12-context-budget-management)
13. [Drift Detection & Sync](#13-drift-detection--sync)
14. [Error Recovery](#14-error-recovery)
15. [Configuration Reference](#15-configuration-reference)
16. [Model Aliases & Effort Levels](#16-model-aliases--effort-levels)
17. [MCP Server Integration](#17-mcp-server-integration)
18. [Plugin System](#18-plugin-system)
19. [Auto Memory System](#19-auto-memory-system)
20. [Worktree Isolation](#20-worktree-isolation)
21. [CLI Reference](#21-cli-reference)
22. [Extended Thinking](#22-extended-thinking)
23. [Agent Teams](#23-agent-teams)
24. [Sandbox & Security](#24-sandbox--security)
25. [IDE Integration](#25-ide-integration)
26. [Keybindings](#26-keybindings)
27. [Notifications](#27-notifications)
28. [Enterprise Features](#28-enterprise-features)
29. [Output Styles](#29-output-styles)
30. [Remote Sessions & Web App](#30-remote-sessions--web-app)
31. [File Structure](#31-file-structure)
32. [Customization Guide](#32-customization-guide)
33. [Troubleshooting](#33-troubleshooting)

---

## 1. What Is This?

Claude Code Scanner is a tool that scans your existing codebase **or helps you start from scratch** and generates a complete Claude Code development environment tailored to your project. Instead of manually configuring agents, skills, and rules, the scanner reads your actual code (or helps you design it from an idea) and creates everything automatically.

**What you get:**
- 30 AI agents organized as a development team (tech lead, architect, QA lead, developers, code quality guardian, ideator, strategist, etc.)
- 88 workflow skills for common workflows (including 9 pre-development, 6 real-environment testing, 8 audit/compliance, 2 observability, and 8 utility skills)
- 44 automation hooks (25 root + 19 template) that run behind the scenes
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
- All 30 agents compliant (frontmatter, HANDOFF, limitations)
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

The scanner creates a 30-agent team organized like a real development organization. Each agent has:

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

#### @cto (Executive Oversight)
```
Model: opus | Access: Read-only (plan mode) | MaxTurns: 25
```
Strategic oversight, framework governance, team health audits, and organizational reporting. Provides executive-level audits and cross-team coordination.

**When to use:** Framework upgrades, organizational health checks, executive status reports.

**Example:**
```
@cto audit the framework for compliance
@cto generate an executive progress report
```

**Output includes:** Org health report, framework compliance status, team velocity summary.

#### @analyst (Requirements & Domain Specialist)
```
Model: sonnet | Access: Read/Write (docs) | MaxTurns: 25
```
Requirements analysis, BRD generation, domain modeling, process flows, and design briefs. Creates STORY entries in TASK_REGISTRY before producing output.

**When to use:** Gathering requirements, writing BRDs, modeling domain entities, creating process flows.

**Example:**
```
@analyst write a BRD for the payment module
@analyst create a domain model for the invoicing system
```

**Output includes:** BRD, domain model, process flow diagrams, RACI matrix, design brief.

#### @version-manager (Git Governance)
```
Model: sonnet | Access: Read/Write | MaxTurns: 15
```
Enforces branch naming, validates commit messages, checks task completion, blocks secrets, runs pre-push quality gates, and manages PR creation.

**When to use:** Before any git push, PR creation, or merge operation. Runs automatically via hooks.

**Example:**
```
@version-manager validate TASK-001 for merge readiness
@version-manager create PR for the current branch
```

**Output includes:** Quality gate results, branch validation, commit message compliance, PR template.

#### @output-validator (Consistency Checker)
```
Model: sonnet | Access: Read-only (plan mode) | MaxTurns: 10
```
Validates subagent output for naming violations, scope violations, pattern violations, and contract compliance. Runs after every subagent call.

**When to use:** Automated — runs after subagent completions to ensure consistency against GLOSSARY and STANDARDS.

**Output includes:** Validation report, naming compliance, scope check, pattern adherence score.

#### @observability-engineer (Monitoring Specialist)
```
Model: sonnet | Access: Read/Write + Worktree | MaxTurns: 25
```
Sets up structured logging, distributed tracing (OpenTelemetry), metrics collection, alerting rules, dashboards, and health check endpoints. Owns Phase 12 post-deploy monitoring.

**When to use:** Setting up observability, validating post-deploy health, diagnosing monitoring gaps.

**Example:**
```
@observability-engineer set up structured logging for the API service
@observability-engineer add health check endpoints and alerting
```

**Output includes:** Logging config, tracing setup, metrics endpoints, alerting rules, dashboard config.

#### @incident-responder (Production Incidents)
```
Model: sonnet | Access: Read/Write + Worktree | MaxTurns: 30
```
Handles production incidents, coordinates triage, executes runbooks, tracks SLA compliance, writes post-mortems, and validates disaster recovery procedures.

**When to use:** P0/P1 production issues, incident response, post-mortem writing, DR validation.

**Example:**
```
@incident-responder triage this P0 database outage
@incident-responder write a post-mortem for the auth service incident
```

**Output includes:** Incident timeline, triage report, runbook execution log, post-mortem, SLA compliance status.

#### @performance-engineer (Optimization Specialist)
```
Model: sonnet | Access: Read/Write + Worktree | MaxTurns: 25
```
Profiles applications, identifies bottlenecks, optimizes critical paths, analyzes load test results, detects memory leaks, and enforces performance budgets.

**When to use:** Performance audits, load test analysis, optimization, memory leak investigation.

**Example:**
```
@performance-engineer profile the checkout API for bottlenecks
@performance-engineer analyze the k6 load test results and recommend fixes
```

**Output includes:** Profiling report, bottleneck analysis, optimization recommendations, performance budget status.

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
The main orchestrator. Coordinates all 30 agents through 13 phases. Includes automatic drift detection at Phase 1, context budget checks between phases, and execution reports after each phase.

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

**Fullstack execution:** 5a runs first (DB must be ready). Then 5b + 5c run in parallel using `isolation: worktree` (separate git copies). Backend merges first (defines API contract), @team-lead resolves conflicts, then frontend merges second (adapts to backend). Tests (5d) run only after both worktrees are merged. Both must complete before Phase 6. See [Section 20](#20-worktree-isolation) for the full merge flow diagram.

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

### Configuration Files & Scopes

| Scope | File | Committed | Purpose |
|-------|------|-----------|---------|
| **Project (shared)** | `.claude/settings.json` | Yes | Team-wide permissions, hooks |
| **Project (local)** | `.claude/settings.local.json` | No | Personal env vars |
| **User** | `~/.claude/settings.json` | No | Cross-project personal prefs |
| **User CLAUDE.md** | `~/.claude/CLAUDE.md` | No | Personal instructions (all projects) |
| **Managed (org)** | `/Library/Application Support/ClaudeCode/` (macOS) | Admin | Org-level policy |
| **Managed (Linux)** | `/etc/claude-code/` | Admin | Org-level policy |

**Precedence:** Managed > CLI flags > Local project > Shared project > User > Defaults

### settings.json — Full Schema

```json
{
  "permissions": {
    "defaultMode": "default",
    "allow": ["Bash(git status)", "Read(/src/**)"],
    "ask": ["Bash(npm run *)"],
    "deny": ["Bash(rm -rf /)", "Bash(sudo *)"],
    "disableBypassPermissionsMode": false,
    "disableAutoMode": false
  },
  "env": { "KEY": "value" },
  "model": "opus",
  "effortLevel": "high",
  "availableModels": ["claude-opus-4-6", "claude-sonnet-4-6"],
  "autoMemoryEnabled": true,
  "claudeMdExcludes": ["legacy-docs/**"],
  "additionalDirectories": ["../shared-lib"],
  "disableAllHooks": false,
  "disableFileSuggestions": false,
  "sandbox": {
    "enabled": true,
    "filesystem": { "allowRead": ["/tmp"], "denyRead": ["/etc/secrets"] },
    "network": { "allowedDomains": ["api.example.com"] }
  },
  "hooks": { "...": "see Section 9" }
}
```

### Permission Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `default` | Prompt on first use of each tool | Standard development |
| `acceptEdits` | Auto-accept file edits | Trusted workflows |
| `plan` | Analysis-only (no execution) | Safe code review |
| `auto` | Auto-approve with safety checks | Requires Team/Enterprise |
| `dontAsk` | Deny unless pre-approved | Restricted environments |
| `bypassPermissions` | Skip prompts | Containers/VMs only |

### Permission Rule Syntax

```
Tool                           # Match all uses of a tool
Tool(*)                        # Explicit wildcard
Tool(exact-command)            # Exact string match
Bash(npm run test *)           # Prefix wildcard
Read(/src/**)                  # File path patterns (gitignore syntax)
Edit(./.env)                   # Relative to current directory
WebFetch(domain:example.com)   # Domain-specific matching
mcp__server-name__tool-name    # MCP tool matching
Agent(ExploreAgent)            # Subagent control
```

**Precedence:** Deny > Ask > Allow (first matching rule wins)

### CLAUDE.md

Project-level instructions that Claude reads on every session. Max 200 lines (150 recommended). Contains tech stack, commands, architecture, code style, git conventions, key paths.

**Import syntax:** Use `@path/to/file.md` to split large files (max 5 hops deep). Example:
```markdown
## Architecture
@docs/ARCHITECTURE.md
```

**Loading order:** Walk up directory tree → load all CLAUDE.md files → load `.claude/CLAUDE.md` → load path-matched rules on-demand.

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

### Rules (.claude/rules/*.md)

Path-scoped instructions with `paths:` frontmatter for conditional loading:

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "src/services/**/*.{ts,tsx}"
---
# These rules load only when Claude reads matching files
```

Rules **without** `paths:` load at session startup. Rules **with** `paths:` load on-demand.

### Agent File Format

```yaml
---
name: agent-name              # Required: lowercase, hyphens, max 64 chars
description: "..."            # Required: when to delegate to this agent
model: opus                   # Optional: model override
effort: high                  # Optional: low/medium/high/max
tools: Read, Edit, Write      # Optional: restrict available tools
disallowedTools: Bash         # Optional: block specific tools
maxTurns: 30                  # Optional: iteration limit
memory: project               # Optional: enable persistent memory
permissionMode: plan          # Optional: force permission mode
isolation: worktree           # Optional: run in isolated worktree
mcpServers: [server-name]     # Optional: scope MCP servers
skills: [skill1, skill2]      # Optional: preload skills
hooks: {}                     # Optional: agent-specific hooks
disable: false                # Optional: disable without deleting
---
```

### Skill File Format

```yaml
---
name: skill-name                    # Required
description: "..."                  # Required: 250 chars ideal
user-invocable: true                # Default true
argument-hint: "[args]"             # Autocomplete hint
context: fork                       # Run in isolated context
allowed-tools: "Read Grep Glob"     # Restrict tools
model: sonnet                       # Model override
effort: high                        # Effort level
agent: "Explore"                    # Subagent type to use
paths: ["src/**/*.ts"]              # Auto-load on file match
shell: bash                         # bash or powershell
disable-model-invocation: false     # User-only invocation
hooks: {}                           # Skill-scoped hooks
---
```

**String substitutions:** `$ARGUMENTS`, `$0`..`$N`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`

### Hook Handler Types

| Type | Purpose | Example |
|------|---------|---------|
| `command` | Run a shell command | `node hooks/my-hook.js` |
| `http` | Call a webhook URL | `https://api.example.com/hook` |
| `prompt` | Inject text into conversation | `"Remember to check tests"` |
| `agent` | Spawn an agent | `{ "agent": "reviewer" }` |

### All Hook Events (24+)

| Event | Trigger |
|-------|---------|
| `SessionStart` | Session begins, resumes, or compacts |
| `SessionEnd` | Session terminates |
| `InstructionsLoaded` | CLAUDE.md or rules loaded |
| `UserPromptSubmit` | Before processing user prompt |
| `Notification` | When Claude sends notifications |
| `PreToolUse` | Before tool executes (can block with exit 2) |
| `PostToolUse` | After tool succeeds |
| `PostToolUseFailure` | After tool fails |
| `PermissionRequest` | Permission dialog appears |
| `PermissionDenied` | Auto mode denies tool |
| `SubagentStart` | Subagent spawned |
| `SubagentStop` | Subagent finishes |
| `Stop` | Claude finishes responding |
| `StopFailure` | Turn ends due to API error |
| `TeammateIdle` | Agent team member about to go idle |
| `TaskCreated` | Task being created |
| `TaskCompleted` | Task marked completed |
| `FileChanged` | Watched file changes on disk |
| `CwdChanged` | Working directory changes |
| `ConfigChange` | Configuration file changes |
| `PreCompact` | Before context compaction |
| `PostCompact` | After context compaction |
| `WorktreeCreate` | Worktree being created |
| `WorktreeRemove` | Worktree being removed |
| `Elicitation` | MCP server requests user input |

---

## 16. Model Aliases & Effort Levels

### Model Aliases

| Alias | Maps To | Use Case |
|-------|---------|----------|
| `default` | Account tier default | Clears overrides |
| `best` | Latest Opus | Most capable |
| `opus` | Claude Opus 4.6 | Complex reasoning, architecture |
| `sonnet` | Claude Sonnet 4.6 | Daily coding tasks |
| `haiku` | Claude Haiku 4.5 | Fast, simple tasks |
| `opusplan` | Opus (plan) → Sonnet (exec) | Hybrid approach |
| `sonnet[1m]` | Sonnet with 1M context | Long sessions |
| `opus[1m]` | Opus with 1M context | Long sessions |

### Effort Levels

| Level | Behavior | Availability |
|-------|----------|--------------|
| `low` | Fast reasoning, minimal exploration | Opus 4.6, Sonnet 4.6 |
| `medium` | Balanced (default) | Opus 4.6, Sonnet 4.6 |
| `high` | Deep reasoning, thorough exploration | Opus 4.6, Sonnet 4.6 |
| `max` | Deepest, no limits | Opus 4.6 only |

### Setting Models

```bash
claude --model opus              # At startup
/model sonnet                    # Mid-session
ANTHROPIC_MODEL=opus             # Environment variable
```

In settings.json: `"model": "claude-opus-4-6"`. In agent/skill frontmatter: `model: haiku`.

### Enterprise Model Pinning

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export CLAUDE_CODE_SUBAGENT_MODEL='claude-haiku'
```

---

## 17. MCP Server Integration

### Configuration Scopes

| Scope | File | Shared | Discovery |
|-------|------|--------|-----------|
| **Project** | `.claude/.mcp.json` | Yes (git) | Automatic |
| **User** | `~/.claude/.mcp.json` | No | Automatic |
| **Managed** | Admin-configured | Yes (org) | Automatic |
| **CLI flag** | `--mcp-config path` | Session-only | One-time |

### Server Types

| Type | Protocol | Use Case |
|------|----------|----------|
| **Stdio** | Local process (stdin/stdout) | Local tools, databases |
| **HTTP** | Remote endpoint | Cloud services, APIs |
| **SSE** | Server-Sent Events | Real-time updates, OAuth |

### Configuration Example

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://..." }
    },
    "github": {
      "url": "sse://api.github.com/mcp",
      "headers": { "Authorization": "Bearer $GITHUB_TOKEN" }
    }
  }
}
```

### Tool Naming & Permissions

MCP tools follow the pattern `mcp__server-name__tool-name`. Permission rules:
```
mcp__postgres__query           # Allow specific MCP tool
mcp__github__*                 # Allow all tools from a server
```

### Scoping to Agents

Add `mcpServers:` to agent frontmatter to limit which agents can access which servers:
```yaml
---
name: database
mcpServers:
  - postgres
---
```

**Recommended limit:** Max 5 MCP servers per session to stay within context budget.

---

## 18. Plugin System

### Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Manifest (required)
├── skills/                  # Custom skills
│   └── my-skill/SKILL.md
├── agents/                  # Custom agents
│   └── my-agent.md
├── hooks/
│   └── hooks.json           # Hook configuration
├── .mcp.json                # MCP servers
├── .lsp.json                # LSP servers (code intelligence)
├── settings.json            # Default settings
└── README.md
```

### Plugin Manifest (plugin.json)

```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": { "name": "Author Name" },
  "license": "MIT"
}
```

### Installing Plugins

```bash
claude plugin install my-plugin          # From marketplace
claude --plugin-dir ./my-plugin          # From local directory
claude --plugin-dir ./p1 --plugin-dir ./p2  # Multiple plugins
```

### Namespacing

Plugin skills are namespaced automatically: `/plugin-name:skill-name`. This prevents conflicts with project skills.

---

## 19. Auto Memory System

### How It Works

Claude Code maintains persistent, file-based memory across sessions:

| Component | Location | Loaded |
|-----------|----------|--------|
| Memory index | `~/.claude/projects/<project>/memory/MEMORY.md` | First 200 lines at startup |
| Topic files | `~/.claude/projects/<project>/memory/*.md` | On-demand when relevant |

### Memory Types

| Type | Purpose | Example |
|------|---------|---------|
| `user` | User role, preferences, expertise | "Senior backend dev, prefers Go" |
| `feedback` | Corrections and confirmed approaches | "Don't mock DB in integration tests" |
| `project` | Ongoing work, goals, deadlines | "Merge freeze begins March 5th" |
| `reference` | Pointers to external resources | "Bugs tracked in Linear INGEST project" |

### Configuration

```json
// In settings.json
{
  "autoMemoryEnabled": true,     // Default: true
  "autoMemoryDirectory": "path"  // Custom memory location
}
```

### Commands

```bash
/memory                         # View memory index
# Memory is saved automatically when Claude learns important context
```

Memory is **machine-local** — all worktrees share one memory store. Memory files are never committed to git.

---

## 20. Worktree Isolation

### What Are Worktrees?

Git worktrees let you run multiple Claude Code sessions on different branches simultaneously, each with an isolated copy of the repository. Each worktree has its own working directory and index but shares the same `.git` history.

### Creating Worktrees

| Method | Command | Use Case |
|--------|---------|----------|
| **CLI flag** | `claude -w feature-auth` | Start worktree session with name |
| **CLI auto-name** | `claude --worktree` | Random name (e.g., `bright-running-fox`) |
| **With tmux** | `claude -w feature-auth --tmux` | Background worktree in tmux pane |
| **Agent frontmatter** | `isolation: worktree` | Automatic per subagent invocation |

**Worktree location:** `<repo-root>/.claude/worktrees/<name>/`
**Branch naming:** `worktree-<name>` (branched from `origin/HEAD`)

### Worktrees vs Fork-Session

| Feature | `claude -w` (Worktree) | `claude --fork-session` |
|---------|----------------------|------------------------|
| **Directory** | Separate checkout | Same directory |
| **Git branch** | New `worktree-<name>` | Same branch |
| **Files** | Fully isolated | Shared (conflict risk) |
| **Context** | Fresh (empty) | Inherits conversation history |
| **Use case** | Parallel work on different branches | Try alternative approach, same branch |

### Which Agents Use Worktrees? (13 agents)

| Agent | When | Why |
|-------|------|-----|
| `@team-lead` | Orchestration | Coordinates from isolated context |
| `@api-builder` | Phase 5b (backend code) | Builds backend in isolation |
| `@frontend` | Phase 5c (frontend code) | Builds UI in isolation |
| `@mobile` | Phase 5 (mobile code) | Builds mobile in isolation |
| `@database` | Phase 5a (migrations) | Schema changes in isolation |
| `@tester` | Phase 6 (testing) | Runs tests in clean environment |
| `@debugger` | Bug fixes | Fix without affecting main |
| `@infra` | Infrastructure | DevOps changes in isolation |
| `@scaffolder` | Project generation | Generate files safely |
| `@qa-automation` | E2E testing | Deploy and test in isolation |
| `@observability-engineer` | Phase 12 (monitoring) | Adds monitoring safely |
| `@incident-responder` | Hotfix | Emergency fix in isolation |
| `@performance-engineer` | Optimization | Profile without affecting main |

### Context Window in Worktrees

**Each worktree gets a completely fresh context window:**

| What | Behavior |
|------|----------|
| Conversation history | NOT inherited — starts empty |
| Context window size | Full size (same as any new session) |
| CLAUDE.md | Re-loaded fresh from worktree's directory tree |
| Rules (`.claude/rules/`) | Re-loaded, path-matched against worktree files |
| Skills | Loaded on-demand (same as regular session) |
| Agent definitions | Loaded fresh from `.claude/agents/` |
| MCP servers | Loaded from project + user config (same access as parent) |
| Session permissions | NOT inherited — must re-approve on first tool use |
| Auto memory | First 200 lines of MEMORY.md loaded (shared store) |

**What does NOT carry over from parent:**
- Conversation history
- Session-scoped permission approvals
- Temporary environment variables set during parent session
- Open file handles or tool state

### Memory in Worktrees

| Aspect | Behavior |
|--------|----------|
| **Memory location** | `~/.claude/projects/<project>/memory/` (shared) |
| **Shared across worktrees?** | Yes — all worktrees share one memory store |
| **Independent learning?** | No — worktree writes to same MEMORY.md as parent |
| **Loaded at startup?** | Yes — first 200 lines of MEMORY.md |
| **Committed to git?** | No — memory is machine-local, never committed |

Memory is **machine-local and project-scoped**. All worktrees for the same project read and write to the same memory store. This means learnings from one worktree are available to others on the same machine.

### Settings & Permissions in Worktrees

**Permissions precedence (same as regular sessions):**
```
Managed settings > CLI flags > Local project > Shared project > User > Defaults
```

| Setting | Worktree Behavior |
|---------|-------------------|
| Permission mode | Inherits parent's default, can override with `--permission-mode` |
| Session approvals | Reset — first tool use requires re-approval |
| `settings.json` | Loaded from worktree's `.claude/settings.json` |
| `settings.local.json` | Loaded from worktree's local settings |
| Environment variables | Inherited from shell, worktree changes don't affect parent |

### Hooks in Worktrees

**All standard hooks fire in worktree context** with the worktree's `cwd`:

| Hook Event | Fires in Worktree? | Notes |
|------------|-------------------|-------|
| `SessionStart` | Yes | Fresh session, loads worktree CLAUDE.md |
| `PreToolUse` | Yes | Runs with worktree's `$CLAUDE_PROJECT_DIR` |
| `PostToolUse` | Yes | Logs to worktree's audit trail |
| `PreCompact` | Yes | Saves worktree's loop state |
| `PostCompact` | Yes | Restores worktree's loop state |
| `Stop` | Yes | Generates worktree execution report |
| `StopFailure` | Yes | Preserves worktree state on crash |
| `WorktreeCreate` | Yes | Fires before worktree is created (can customize) |
| `WorktreeRemove` | Yes | Fires before worktree cleanup (non-blocking) |

**`WorktreeCreate` hook** can replace default git behavior entirely:
- Input: `worktree_name`, `target_branch`, `base_branch`, `cwd`
- Must return `worktreePath` to stdout
- Non-zero exit prevents worktree creation
- Use case: custom VCS, alternative git workflows

**Orphan detection:** `session-start.js` and `stop-persist-state.js` hooks detect and warn about orphaned worktrees on every session start/stop.

### .worktreeinclude (Gitignored File Copying)

Gitignored files (`.env`, secrets, local config) are NOT present in new worktrees by default. To auto-copy them:

```text
# .worktreeinclude (in repo root)
.env
.env.local
config/secrets.json
docker/.dockerignore
```

Files matching `.gitignore` patterns listed in `.worktreeinclude` are copied from main repo to each new worktree. Applies to CLI worktrees, subagent worktrees, and desktop app parallel sessions.

### MCP Servers in Worktrees

| Aspect | Behavior |
|--------|----------|
| **Access** | Worktree loads all MCP servers from project + user config |
| **Scoping** | Same servers available as parent session |
| **Per-worktree config** | Not supported — MCP config is not worktree-aware |
| **Agent scoping** | Agents with `mcpServers:` frontmatter get only those servers |

### Communication Between Parent and Worktree

**There is NO built-in inter-session messaging.** Parent and worktree are completely independent sessions:

| Communication Method | Works? | Details |
|---------------------|--------|---------|
| Direct messaging | No | No inter-session message passing |
| Real-time progress | No | Parent doesn't see worktree activity |
| Shared context | No | Each has independent context window |
| Git commits | Yes | Worktree commits to branch; parent can fetch |
| Shared filesystem | Yes | Both can read/write `.claude/worktrees/` |
| Shared memory | Yes | Both read/write same MEMORY.md |
| Task list (agent teams) | Yes | If using agent teams, shared task coordination |
| Session resumption | Independent | `/resume` shows both sessions separately |

**Results flow back via git merge** — the orchestrator fetches worktree branch commits and merges them into the task branch.

### Fullstack Merge Flow (Phase 5)

When a fullstack task runs, multiple agents work in parallel worktrees. The merge follows a strict order:

```
Phase 5 — Fullstack Parallel Execution:

Step 1: 5a — DB migrations run FIRST (on main branch)
         @api-builder creates schema changes
         DB must be ready before any code runs
              │
Step 2: 5b + 5c run in PARALLEL (each in its own worktree)
              │                          │
     ┌────────┴────────┐       ┌────────┴────────┐
     │  WORKTREE A      │       │  WORKTREE B      │
     │  @api-builder    │       │  @frontend        │
     │  Backend code    │       │  Frontend code    │
     │  API endpoints   │       │  UI components    │
     │  Services        │       │  Pages            │
     └────────┬────────┘       └────────┬────────┘
              │                          │
Step 3: Backend worktree merges FIRST
         (backend defines the API contract)
              │
Step 4: @team-lead resolves any type/interface conflicts
              │
Step 5: Frontend worktree merges SECOND
         (adapts to final backend API)
              │
Step 6: 5d — @tester runs AFTER merge
         (tests against fully merged code)
```

**Key rules:**
- **Merge order is fixed:** Backend always merges first because it defines the API contract that frontend depends on
- **No early advancement:** If one agent finishes early, it waits. The orchestrator does NOT advance that agent to Phase 6 independently — both must complete Phase 5 before either enters Phase 6
- **Conflict resolution:** `@team-lead` resolves any type/interface conflicts between the two worktrees after backend merges
- **Tests run on merged code:** `@tester` (Phase 5d) only runs after both worktrees are merged, ensuring tests validate the integrated result

### Subagent Worktree Lifecycle

Subagents with `isolation: worktree` have a different cleanup behavior than CLI worktrees:

```
1. Parent invokes subagent (with isolation: worktree)
      │
2. WorktreeCreate hook fires
      │
3. Fresh worktree created (new branch from origin/HEAD)
      │
4. Subagent runs in worktree (fresh context, loads CLAUDE.md/rules)
      │
5. Subagent completes
      │
6. If changes exist:
      │   → Commits preserved on worktree branch
      │   → Orchestrator merges into task branch
      │   → Worktree removed
      │
7. If no changes:
      │   → Worktree + branch auto-removed
      │
8. WorktreeRemove hook fires
      │
9. HANDOFF back to parent with execution metrics
```

**Key difference from CLI worktrees:** Subagent worktrees are auto-cleaned after the subagent finishes. There is no "keep or remove?" prompt — the orchestrator handles the merge decision.

**Subagent limitations in worktrees:**
- Subagents in worktrees **cannot spawn their own subagents** (no nesting)
- Worktree agents are leaf nodes in the agent hierarchy

### Agent Timeout in Worktrees

If an agent hits `maxTurns` during worktree work:
1. `subagent-tracker` hook saves a checkpoint with partial work
2. Orchestrator checks the checkpoint — if >70% done, re-invoke with remaining scope only
3. If <70% done, split the work into new subtasks and re-invoke
4. Each re-invocation counts as +1 loop iteration toward the circuit breaker
5. **Never re-invoke with the full original scope** — always narrow to what's left

### Error Handling in Worktrees

| Error | What Happens | Recovery |
|-------|-------------|----------|
| **Agent crashes** | Worktree left orphaned, commits preserved | `cd .claude/worktrees/<name> && claude` to resume |
| **Merge conflicts** | Standard git conflicts on merge | `@team-lead` resolves manually, or escalate to user |
| **Session crash (rate limit)** | `stop-failure-handler.js` preserves state | Wait 60s, resume with `claude -c` |
| **Disk full** | Worktree creation fails | Free space, retry |
| **Orphaned worktrees** | Detected by `session-start.js` on next session | `git worktree remove <path>` |
| **Locked worktree** | Another session using it | `git worktree remove --force <path>` |

### Worktree Limitations

| Category | Limitation |
|----------|-----------|
| **Communication** | No inter-session messaging between parent and worktree |
| **Progress** | Parent doesn't see worktree progress in real-time |
| **Context** | No shared context — each session is independent |
| **Nesting** | Cannot nest worktrees (worktree in a worktree) |
| **Mid-session** | Cannot convert a running session to a worktree |
| **File conflicts** | If parent and worktree edit same file, manual resolution needed |
| **Gitignored files** | Not auto-copied unless `.worktreeinclude` is configured |
| **Subagent nesting** | Worktree agents cannot spawn their own subagents |
| **Session resume** | Cannot resume parent and worktree together |

### Manual Worktree Commands

```bash
git worktree list                # List active worktrees
git worktree prune               # Remove stale worktree metadata
git worktree remove <path>       # Remove specific worktree
git worktree remove --force <path>  # Force remove locked worktree
git branch -D worktree-<name>   # Delete worktree branch after removal
```

**Recommended `.gitignore` entry:**
```gitignore
.claude/worktrees/
```

---

## 21. CLI Reference

### Session Management

```bash
claude                           # Start interactive session
claude "query"                   # Start with prompt
claude -p "query"                # Print mode (non-interactive)
claude -c                        # Continue last session
claude -r "session-name"         # Resume by name or ID
claude --from-pr 123             # Resume PR review session
claude --fork-session            # New session ID on resume
```

### Configuration Flags

```bash
claude --model opus              # Set model
claude --effort high             # Set effort level
claude --permission-mode plan    # Set permission mode
claude -n "session-name"         # Name the session
claude --add-dir ../shared       # Add working directory
```

### Advanced

```bash
claude -w feature-auth           # Create worktree session
claude -w feature-auth --tmux    # Worktree with tmux
claude --bare -p "query"         # Minimal mode (fast, no hooks)
claude --chrome                  # Enable browser control
claude --remote "task"           # Create web session
claude --teleport                # Resume web session locally
```

### Management Commands

```bash
claude agents                    # List available subagents
claude mcp                       # Configure MCP servers
claude plugin install <name>     # Install plugin
claude plugin list               # List installed plugins
claude auth login                # Authenticate
claude auth status               # Check auth status
claude update                    # Update Claude Code
claude auto-mode defaults        # Print auto mode rules
claude auto-mode config          # Show effective config
```

---

## 22. Extended Thinking

Claude Code supports extended thinking — a mode where Claude reasons through complex problems step-by-step before responding.

### How It Works

| Aspect | Detail |
|--------|--------|
| **Activation** | Automatic when effort level is `high` or `max` |
| **Budget tokens** | Controls how many tokens Claude uses for reasoning |
| **Visibility** | Thinking is visible in the UI (expandable) |
| **Cost** | Thinking tokens count toward usage but NOT toward context window |

### Effort Levels & Thinking

| Effort | Thinking Behavior | When to Use |
|--------|-------------------|-------------|
| `low` | Minimal/no thinking | Simple edits, quick questions |
| `medium` | Brief thinking (default) | Standard tasks |
| `high` | Extended thinking | Architecture, debugging, complex logic |
| `max` | Maximum thinking depth | Critical decisions, Opus only |

### Configuration

```bash
claude --effort high                     # CLI flag
/model opus --effort max                 # Mid-session
```

In settings.json:
```json
{ "effortLevel": "high" }
```

In agent/skill frontmatter:
```yaml
effort: high
```

### When Extended Thinking Activates

- Complex code generation (multi-file changes)
- Debugging with unclear root cause
- Architecture design decisions
- Security review with multiple vectors
- Any task where Claude needs to reason about trade-offs

---

## 23. Agent Teams

Agent teams allow multiple Claude Code instances to work together as teammates on the same project.

### How Agent Teams Work

```bash
claude --agent-team "my-team"            # Join/create a team
claude --agent-team "my-team" --tmux     # Join with tmux split panes
```

### Team Coordination

| Feature | Behavior |
|---------|----------|
| **Shared task list** | All teammates see and can claim tasks |
| **Task claiming** | File-locking prevents race conditions |
| **Dependencies** | Tasks can block other tasks |
| **Communication** | Via shared task list (no direct messaging) |
| **Idle handling** | `TeammateIdle` hook fires when a teammate is about to go idle |

### Tmux Mode

```bash
claude --agent-team "my-team" --tmux     # Creates split panes per teammate
```

Each teammate gets its own tmux pane. Useful for monitoring parallel work.

### Team vs Worktree vs Subagent

| Feature | Agent Team | Worktree | Subagent |
|---------|-----------|----------|----------|
| **Separate context** | Yes | Yes | Yes |
| **Separate branch** | Optional | Yes | Optional |
| **Communication** | Shared tasks | Git only | HANDOFF block |
| **Coordination** | Autonomous | Manual | Orchestrated |
| **Persistence** | Long-lived | Session-scoped | Single task |

---

## 24. Sandbox & Security

### Sandbox Configuration

Claude Code can run in a sandboxed mode that restricts filesystem and network access:

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowRead": ["/tmp", "$HOME/.config"],
      "denyRead": ["/etc/secrets", "$HOME/.ssh"],
      "allowWrite": ["$CLAUDE_PROJECT_DIR"],
      "denyWrite": ["/usr", "/etc"]
    },
    "network": {
      "allowedDomains": ["api.example.com", "registry.npmjs.org"],
      "deniedDomains": ["*.internal.corp"]
    }
  }
}
```

### Managed Policies (Organization-Level)

Organizations can enforce security policies that users cannot override:

| Platform | Policy Location |
|----------|----------------|
| **macOS** | `/Library/Application Support/ClaudeCode/settings.json` |
| **Linux/WSL** | `/etc/claude-code/settings.json` |
| **Windows** | `C:\Program Files\ClaudeCode\settings.json` |

Managed settings take highest precedence — they override all user and project settings.

**Managed CLAUDE.md:** Same paths with `CLAUDE.md` filename — loaded for every project.

### Security Features

| Feature | How It's Enforced |
|---------|-------------------|
| **File protection** | `protect-files.js` hook blocks .env, lock files, CI configs |
| **Command blocking** | `validate-bash.js` blocks rm -rf, fork bombs, dd, curl\|bash |
| **Secret detection** | `gatekeeper-check.js` scans for API keys, tokens, passwords |
| **Scope guard** | `scope-guard` hook restricts file access by RBAC role |
| **Permission modes** | 6 modes from `plan` (read-only) to `bypassPermissions` (containers only) |
| **Deny rules** | Highest-priority rules that cannot be overridden |

---

## 25. IDE Integration

### VS Code Extension

Claude Code integrates with VS Code via the official extension:

| Feature | Description |
|---------|-------------|
| **Inline chat** | Chat with Claude from the editor |
| **Code actions** | Quick fixes, refactoring suggestions |
| **Diagnostics** | Real-time error and warning integration |
| **Terminal** | Integrated Claude Code terminal |
| **Status bar** | Shows active session, model, context usage |

**Installation:** Search "Claude Code" in VS Code Extensions marketplace.

### JetBrains Extension

Available for IntelliJ IDEA, WebStorm, PyCharm, and other JetBrains IDEs:

| Feature | Description |
|---------|-------------|
| **Tool window** | Dedicated Claude Code panel |
| **Code context** | Sends selected code as context |
| **Terminal integration** | Run Claude Code in IDE terminal |

### Desktop App

Available for macOS and Windows:

```bash
# Install desktop app
claude desktop install

# Or download from claude.ai/code
```

Features: native window, menu bar integration, system notifications, multi-session tabs.

### VS Code Settings Integration

The scanner generates `.vscode/settings.json` with Claude Code-aware configuration:

```json
{
  "editor.formatOnSave": true,
  "files.exclude": {
    ".claude/tasks": true,
    ".claude/reports": true,
    ".claude/worktrees": true
  }
}
```

---

## 26. Keybindings

Claude Code supports customizable keyboard shortcuts via `~/.claude/keybindings.json`:

### Default Keybindings

| Shortcut | Action |
|----------|--------|
| `Enter` | Submit prompt |
| `Escape` | Cancel current generation |
| `Shift+Tab` | Cycle permission modes |
| `Up/Down` | Navigate history |
| `Ctrl+C` | Interrupt / exit |
| `Ctrl+L` | Clear screen |
| `Tab` | Accept autocomplete suggestion |

### Custom Keybindings

```json
// ~/.claude/keybindings.json
[
  {
    "key": "ctrl+shift+s",
    "command": "submit",
    "description": "Submit prompt"
  },
  {
    "key": "ctrl+shift+r",
    "command": "skill",
    "args": "/review-pr",
    "description": "Run PR review"
  }
]
```

### Chord Bindings

Multi-key sequences (press keys in sequence, not simultaneously):

```json
{
  "key": "ctrl+k ctrl+c",
  "command": "skill",
  "args": "/compact"
}
```

---

## 27. Notifications

### OS Notifications

The `notify-approval.js` hook sends desktop notifications when Claude needs permission approval:

| Platform | Mechanism |
|----------|-----------|
| **macOS** | `osascript` (native notification center) |
| **Linux** | `notify-send` (libnotify) |
| **Windows** | `powershell` toast notification |

### Terminal Bell

Claude Code can ring the terminal bell on completion:

```json
// In settings.json
{ "notifications": { "terminalBell": true } }
```

### Custom Notification Hooks

Use the `Notification` hook event to send notifications to any system:

```json
{
  "hooks": {
    "Notification": [{
      "matcher": "permission_prompt",
      "hooks": [{
        "type": "command",
        "command": "node hooks/notify-slack.js"
      }]
    }]
  }
}
```

---

## 28. Enterprise Features

### Authentication

| Method | Configuration |
|--------|---------------|
| **API Key** | `ANTHROPIC_API_KEY` environment variable |
| **OAuth/SSO** | `claude auth login` (redirects to browser) |
| **AWS Bedrock** | `CLAUDE_CODE_USE_BEDROCK=1` + AWS credentials |
| **Google Vertex** | `CLAUDE_CODE_USE_VERTEX=1` + GCP credentials |

### Bedrock/Vertex Model Pinning

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-20250514-v1:0'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6-20250514-v1:0'
```

### Managed Policies

Organization admins can enforce:
- Allowed/denied tools and commands
- Required permission modes
- Model restrictions
- Sandbox configuration
- MCP server allowlists
- CLAUDE.md instructions that apply to all projects

### Team/Enterprise Plan Features

| Feature | Team | Enterprise |
|---------|------|-----------|
| Auto mode | Yes | Yes |
| Usage dashboard | Yes | Yes |
| SSO/SAML | No | Yes |
| Managed policies | No | Yes |
| Audit logs | No | Yes |
| Custom model routing | No | Yes |

### Telemetry

Claude Code collects anonymized usage metrics by default. Opt-out:

```bash
claude config set telemetry disabled
```

What's collected: session duration, tool usage counts, error rates (never code content).

---

## 29. Output Styles

Claude Code supports customizable output formatting via output style files:

### Configuration

```json
// In settings.json
{ "outputStyle": "concise" }
```

### Custom Output Styles

Create `.claude/output-styles/<name>.md` with formatting instructions:

```markdown
# Concise Style

- Maximum 3 sentences per response
- No code blocks unless specifically asked
- Use bullet points instead of paragraphs
- Skip explanations — just show the result
```

### Built-in Styles

| Style | Behavior |
|-------|----------|
| `default` | Standard Claude Code output |
| `concise` | Shorter responses, fewer explanations |
| `verbose` | Detailed explanations, step-by-step reasoning |

---

## 30. Remote Sessions & Web App

### Web App (claude.ai/code)

Claude Code is available as a web app at `claude.ai/code`:

| Feature | Description |
|---------|-------------|
| **Browser-based** | No installation required |
| **Full CLI features** | Same capabilities as terminal CLI |
| **Session persistence** | Sessions persist across browser tabs |
| **File access** | Sandboxed filesystem in cloud |

### Remote Sessions

```bash
claude --remote "implement user authentication"    # Create remote session
```

Creates a cloud-hosted session that runs autonomously. Check status at claude.ai/code.

### Teleport (Resume Remote Locally)

```bash
claude --teleport                                   # Resume a remote session locally
```

Transfers a remote session to your local machine, preserving all context and state.

### Scheduled Remote Agents

```bash
claude --remote --schedule "0 9 * * MON"           # Run every Monday at 9 AM
```

Or use the `/schedule` skill to manage recurring remote agents.

---

## 31. File Structure

```
your-project/
├── CLAUDE.md                              # Project instructions
├── .claude/
│   ├── manifest.json                      # Drift tracking state
│   ├── settings.json                      # Permissions + hooks
│   ├── settings.local.json                # Personal env vars (gitignored)
│   ├── agents/                            # 30 agent definitions
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
│   │   ├── qa-automation.md               # Core: E2E & visual verification
│   │   ├── cto.md                         # SDLC: executive oversight
│   │   ├── analyst.md                     # Pre-dev: requirements & domain
│   │   ├── version-manager.md             # Utility: git governance
│   │   ├── output-validator.md            # Core: consistency checking
│   │   ├── observability-engineer.md      # Specialist: monitoring & logging
│   │   ├── incident-responder.md          # Specialist: production incidents
│   │   └── performance-engineer.md        # Specialist: optimization & profiling
│   ├── project/                           # Pre-development artifacts
│   │   ├── PROJECT.md                     # Master project status
│   │   ├── IDEA_CANVAS.md                 # Idea brainstorming
│   │   ├── PRODUCT_SPEC.md                # Product specification
│   │   ├── BACKLOG.md                     # Feature backlog (MoSCoW)
│   │   ├── DOMAIN_MODEL.md                # Domain entities & rules
│   │   ├── TECH_STACK.md                  # Technology decisions
│   │   ├── ARCHITECTURE.md                # System architecture
│   │   └── DEPLOY_STRATEGY.md             # Deployment strategy
│   ├── skills/                            # 88 workflow skills
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
│   ├── hooks/                             # 19 automation scripts (template) + 25 root = 44 total
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

## 32. Customization Guide

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

## 33. Troubleshooting

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

| Component | Count / Detail |
|-----------|---------------|
| Agents | 30 (5 SDLC + 7 core + 4 dev + 14 pre-dev/utility/specialist) |
| Skills | 88 (all with proper frontmatter, `context: fork`) |
| Hooks | 44 (25 root + 19 template, covering 24+ events) |
| Rules | 11 (path-scoped with `paths:` frontmatter) |
| Profiles | 10 (architect, backend, cto, data-engineer, devops, frontend, fullstack, mobile, qa-engineer, tech-lead) |
| Workflow Phases | 13 |
| Loop Flows | 6 (all with circuit breakers) |
| Task States | 16 (forward) + 3 (special) |
| Hook Events | 24+ (session, tool, agent, file, compact, worktree, MCP) |
| Permission Modes | 6 (default, acceptEdits, plan, auto, dontAsk, bypassPermissions) |
| Model Aliases | 8 (default, best, opus, sonnet, haiku, opusplan, sonnet[1m], opus[1m]) |
| Effort Levels | 4 (low, medium, high, max) |
| MCP Server Types | 3 (stdio, HTTP, SSE) |
| Plugin Support | Full (manifest, skills, agents, hooks, MCP, LSP) |
| IDE Integration | VS Code, JetBrains, Desktop App |
| Enterprise | Bedrock, Vertex, SSO/SAML, managed policies |
| Validation Checks | 170+ |
| Documentation Sections | 33 |

### Claude Code Feature Coverage

| Feature | Status |
|---------|--------|
| Multi-agent orchestration (30 agents) | Fully documented |
| 88 workflow skills (T1-T5 lifecycle) | Fully documented |
| 44 automation hooks (24+ event types) | Fully documented |
| RBAC with 10 role profiles | Fully documented |
| 13-phase SDLC workflow | Fully documented |
| 8-phase new project pipeline | Fully documented |
| Context budget enforcement | Fully documented |
| Worktree isolation (13 agents) | Fully documented |
| MCP server integration | Fully documented |
| Plugin system | Fully documented |
| Auto memory system | Fully documented |
| Extended thinking & effort levels | Fully documented |
| Agent teams & tmux mode | Fully documented |
| Sandbox & managed policies | Fully documented |
| IDE integration (VS Code, JetBrains, Desktop) | Fully documented |
| Custom keybindings | Fully documented |
| Notifications (OS, terminal, custom) | Fully documented |
| Enterprise (Bedrock, Vertex, SSO) | Fully documented |
| Output styles | Fully documented |
| Remote sessions & web app | Fully documented |
| Drift detection & sync | Fully documented |
| Execution reports & scoring | Fully documented |
| Git governance (branch, commit, push gates) | Fully documented |

Built for Claude Code. Cross-platform. Zero configuration after scan. 100% Claude Code feature coverage.
