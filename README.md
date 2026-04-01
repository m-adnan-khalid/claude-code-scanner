# Claude Code Scanner

> Scan any codebase **or start from scratch** — generate a complete Claude Code environment with 27 role-based agents, 88 skills, 18 automation hooks, 10 RBAC profiles, 9 rules, templates, and full lifecycle support from idea to deployment.

## Prerequisites

This tool requires **Node.js >= 18**. `npx` is included with Node.js/npm.

### Check if Node.js is installed:
```bash
node --version  # Should be >= 18.x.x
npm --version   # Should be >= 8.x.x
```

### Install Node.js if needed:

**macOS (using Homebrew):**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (using Chocolatey):**
```bash
choco install nodejs
```

**Or download from [nodejs.org](https://nodejs.org/)**

## Installation

### Method 1: npx (Recommended)
```bash
cd /path/to/your-project
npx claude-code-scanner init
```

### Method 2: One-line install (macOS/Linux)
```bash
cd /path/to/your-project
curl -fsSL https://raw.githubusercontent.com/m-adnan-khalid/claude-code-scanner/master/install.sh | bash
```

### Method 2b: One-line install (Windows PowerShell)
```powershell
cd C:\path\to\your-project
irm https://raw.githubusercontent.com/m-adnan-khalid/claude-code-scanner/master/install.ps1 | iex
```

### Method 3: Git clone
```bash
git clone https://github.com/m-adnan-khalid/claude-code-scanner.git /tmp/scanner
cp /tmp/scanner/template/CLAUDE.md ./CLAUDE.md
cp -r /tmp/scanner/template/.claude ./.claude
chmod 755 .claude/hooks/*.js              # Make hooks executable
mkdir -p .claude/tasks .claude/reports/daily .claude/reports/executions
rm -rf /tmp/scanner
```
> **Note:** Method 1 (`npx`) is preferred — it also creates `session.env`, updates `.gitignore`, and merges VS Code settings automatically.

### Method 4: Global install
```bash
npm install -g claude-code-scanner
cd /path/to/your-project
claude-code-scanner init
```

### Cross-Platform Support

Works on **Windows**, **macOS**, and **Linux**. All hooks and scripts use Node.js (no bash/jq dependency). The only requirement is Node.js >= 18.

## Usage

### Existing Project (scan and enhance)
```bash
cd /path/to/your-project
npx claude-code-scanner init
claude
/setup-workspace             # Set your role (each team member)
/scan-codebase               # Scan your tech stack (2-5 min)
/generate-environment        # Generate all Claude Code files
/validate-setup              # Verify everything works
```

### New Project (idea to launch)
```bash
npx claude-code-scanner new my-project
cd my-project
claude
/setup-workspace             # Set your role (each team member)
/new-project "Build a SaaS invoicing tool for freelancers"
```

The new project pipeline runs 8 pre-development phases:
1. **Brainstorm** — problem, audience, value proposition (`/brainstorm`)
2. **Product Spec** — MVP scope, user journeys (`/product-spec`)
3. **Feature Map** — MoSCoW prioritization (`/feature-map`)
4. **Tech Stack** — language, framework, DB recommendations (`/tech-stack`)
5. **Architecture** — data model, API design, components (`/architecture`)
6. **Scaffolding** — generate project files and configs (`/scaffold`)
7. **Environment** — auto-scan and generate Claude Code environment
8. **Launch Plan** — CI/CD, hosting, monitoring (`/deploy-strategy`)

Then build each MVP feature: `/workflow new "feature description"`

Or go fully automated: `/idea-to-launch "your idea"`

## Token Optimization & Quality Assurance

Built-in enforcement rules that minimize token usage and maximize accuracy:

| Feature | What It Does |
|---------|-------------|
| **prompt-efficiency rule** | Forces concise output — no preamble, answer-first, targeted reads, code diffs only |
| **accuracy rule** | Forces verification — Glob before citing paths, Grep before referencing functions, re-read after edits |
| **context-monitor hook** | Auto-tracks context usage after every tool call, warns at 45%/60%/75% thresholds |
| **prompt-stats hook** | Shows session stats on exit — tool calls, tokens used, files changed, hallucination risk |
| **context-budget rule** | Hard 60% working budget with auto-compaction guidance |
| **Agent model optimization** | Read-only agents use sonnet (cheaper), deep-reasoning agents use opus |
| **maxTurns tuning** | Advisory agents capped at 15-20 turns to prevent runaway token spend |

## What It Creates

```
your-project/
├── CLAUDE.md                     <- Project instructions (auto-loaded)
├── .claude/
│   ├── settings.json             <- Permissions + 10 hook events
│   ├── settings.local.json       <- Your env vars (gitignored)
│   ├── session.env               <- Your role (gitignored, set via /setup-workspace)
│   ├── rules/                    <- Path-specific coding rules
│   ├── agents/                   <- 27 role-based AI agents
│   │   ├── team-lead.md          <- Orchestrator, assigns work, tech sign-off
│   │   ├── architect.md          <- Architecture design & review
│   │   ├── product-owner.md      <- Acceptance criteria, business sign-off
│   │   ├── qa-lead.md            <- QA planning, QA sign-off
│   │   ├── explorer.md           <- Codebase navigation & impact analysis
│   │   ├── reviewer.md           <- Code review & conventions
│   │   ├── security.md           <- Security & vulnerability review
│   │   ├── debugger.md           <- Root cause analysis & bug fixing
│   │   ├── tester.md             <- Test writing & coverage
│   │   ├── frontend.md           <- UI component development
│   │   ├── api-builder.md        <- API endpoint development
│   │   ├── infra.md              <- Docker, CI/CD, deployment
│   │   ├── ideator.md            <- Brainstorming & idea refinement
│   │   ├── strategist.md         <- Product strategy & features
│   │   ├── scaffolder.md         <- Project generation & boilerplate
│   │   ├── ux-designer.md        <- User flows & wireframes
│   │   ├── code-quality.md      <- Design patterns, SOLID, static analysis
│   │   └── mobile.md            <- iOS, Android, React Native, Flutter, KMP
│   ├── skills/                   <- 88 workflow skills
│   │   ├── workflow/             <- /workflow — Full 13-phase SDLC
│   │   ├── scan-codebase/        <- /scan-codebase
│   │   ├── generate-environment/ <- /generate-environment
│   │   ├── task-tracker/         <- /task-tracker
│   │   ├── progress-report/      <- /progress-report
│   │   ├── metrics/              <- /metrics
│   │   ├── impact-analysis/      <- /impact-analysis
│   │   ├── execution-report/     <- /execution-report — Post-execution analytics
│   │   ├── context-check/        <- /context-check — Context budget enforcement
│   │   ├── rollback/             <- /rollback — Deploy/code/phase rollback
│   │   ├── sync/                 <- /sync — Drift detection & repair
│   │   ├── setup-smithery/       <- /setup-smithery
│   │   ├── validate-setup/       <- /validate-setup
│   │   ├── new-project/          <- /new-project — Full pre-dev pipeline
│   │   ├── brainstorm/           <- /brainstorm — Idea exploration
│   │   ├── product-spec/         <- /product-spec — MVP scope & journeys
│   │   ├── feature-map/          <- /feature-map — MoSCoW prioritization
│   │   ├── domain-model/         <- /domain-model — Entity modeling
│   │   ├── tech-stack/           <- /tech-stack — Technology selection
│   │   ├── architecture/         <- /architecture — System design
│   │   ├── scaffold/             <- /scaffold — Project generation
│   │   ├── deploy-strategy/      <- /deploy-strategy — CI/CD & hosting
│   │   ├── idea-to-launch/       <- /idea-to-launch — Full automation
│   │   ├── mvp-kickoff/          <- /mvp-kickoff — Feature workflow bridge
│   │   ├── mvp-status/           <- /mvp-status — Progress dashboard
│   │   ├── launch-mvp/           <- /launch-mvp — Launch orchestrator
│   │   ├── clarify/              <- /clarify — Requirement Q&A
│   │   ├── import-docs/          <- /import-docs — Document parsing
│   │   ├── cost-estimate/        <- /cost-estimate — Infrastructure costs
│   │   ├── release-notes/        <- /release-notes — Release documentation
│   │   ├── mobile-audit/         <- /mobile-audit — Mobile quality & store readiness
│   │   └── ...                   <- + more utility skills
│   ├── hooks/                    <- 18 automation hooks (10 events)
│   ├── project/                  <- Pre-development artifacts (idea, spec, backlog, etc.)
│   ├── profiles/                 <- Developer role profiles
│   ├── templates/                <- Code scaffolding (extracted from real code)
│   ├── docs/                     <- 14 reference documents
│   ├── scripts/                  <- Verification scripts
│   ├── tasks/                    <- Task tracking (gitignored)
│   └── reports/                  <- Progress & execution reports (gitignored)
```

## Agent Team (Role-Based)

### SDLC Role Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@team-lead` | Orchestrator — assigns work, resolves blockers, tech sign-off | Read/Write | opus |
| `@cto` | Executive oversight — org health, framework governance | Read-only | opus |
| `@architect` | Architecture design & review | Read-only | opus |
| `@product-owner` | Acceptance criteria, business sign-off | Read-only | opus |
| `@qa-lead` | QA planning, QA sign-off, bug triage | Read-only | sonnet |

### Core Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@explorer` | Codebase investigation & impact mapping | Read-only | sonnet |
| `@reviewer` | Code quality & convention review | Read-only | sonnet |
| `@security` | Vulnerability & OWASP review | Read-only | opus |
| `@debugger` | Root cause analysis & bug fixes | Read/Write | opus |
| `@tester` | Automated test writing & coverage | Read/Write | sonnet |
| `@code-quality` | Design patterns, SOLID, duplication detection, static analysis | Read-only | opus |

### Dev Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@api-builder` | Backend endpoints & services | Read/Write + worktree | sonnet |
| `@frontend` | UI components & pages | Read/Write + worktree | sonnet |
| `@infra` | Docker, CI/CD, deployment | Read/Write | sonnet |
| `@mobile` | Mobile apps — iOS, Android, React Native, Flutter, KMP | Read/Write + worktree | opus |

### Pre-Dev Agents (New Project Lifecycle)
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@ideator` | Brainstorming — problem space, audience, value proposition | Read-only | opus |
| `@strategist` | Product strategy — MVP scope, features, prioritization | Read/Write (project docs) | opus |
| `@scaffolder` | Project generation — directory structure, configs, boilerplate | Read/Write + Bash | sonnet |
| `@ux-designer` | UX design — user flows, wireframes, information architecture | Read-only | opus |

### Quality & Process Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@qa-automation` | E2E testing — deploy app, run flows, visual verification | Read/Write + worktree | opus |
| `@gatekeeper` | Auto-approve/block changes, regression detection | Read-only | sonnet |
| `@process-coach` | SDLC methodology selection and configuration | Read/Write (project docs) | opus |
| `@database` | Schema design, migrations, query optimization | Read/Write + worktree | sonnet |
| `@docs-writer` | READMEs, API docs, ADRs, changelogs | Read/Write (docs only) | sonnet |
| `@output-validator` | Validates agent output quality, consistency checks | Read-only | sonnet |
| `@analyst` | Data analysis, reporting, insights extraction | Read-only | sonnet |
| `@version-manager` | Version bumps, release management, changelog maintenance | Read/Write | sonnet |

All agents include: structured handoff protocol with execution metrics, explicit limitations, cross-session memory, and self-check for hallucinations and regressions.

## Team Setup & RBAC

Every team member runs `/setup-workspace` on their first session to set their role. The role is stored in `.claude/session.env` (gitignored — per-developer).

| Role | Allowed Paths | Key Commands |
|------|---------------|-------------|
| **CTO** | Full audit, framework governance | `/audit-system`, `/org-report`, `/progress-report executive` |
| **Architect** | Read-only docs, architecture PRs | `/architecture`, `/design-review`, `/impact-analysis` |
| **Tech Lead** | Agents, hooks, ADRs (via PR) | `/architecture`, `/org-report`, `/dependency-check` |
| **Backend Dev** | `src/api/`, `src/services/`, `tests/` | `/add-endpoint`, `/api-test`, `/fix-bug`, `/migrate` |
| **Frontend Dev** | `src/ui/`, `src/components/`, `src/styles/` | `/add-component`, `/add-page`, `/e2e-browser` |
| **Full Stack Dev** | `src/` full access | All dev commands + `/impact-analysis` |
| **QA / SDET** | `tests/` full, `src/` read-only | `/qa-plan`, `/e2e-browser`, `/api-test`, `/load-test` |
| **DevOps** | `infra/`, `.github/`, `scripts/` | `/deploy`, `/infrastructure-audit`, `/cicd-audit` |
| **PM** | Read docs, write requirements | `/product-spec`, `/feature-map`, `/progress-report` |
| **Designer** | `src/styles/`, read UI | `/design-review`, `/accessibility-audit`, `/visual-regression` |

Role-based scope is enforced by the `scope-guard` hook on every tool call.

## Commands After Setup

### New Project Skills (Idea to Launch)
```bash
/new-project "your idea"                   # Full 8-phase pre-dev pipeline
/idea-to-launch "your idea"                # Pre-dev + SDLC for all features
/brainstorm "your idea"                    # Brainstorm problem & audience
/product-spec                              # Generate product specification
/feature-map                               # MoSCoW feature prioritization
/tech-stack                                # Technology stack recommendation
/architecture                              # System architecture design
/scaffold                                  # Generate project files
/deploy-strategy                           # Deployment & launch planning
/domain-model                              # Domain entities, glossary, bounded contexts
/import-docs "path/to/docs"                # Import existing PRDs/requirements/specs
/clarify                                   # Q&A to clear requirement doubts & gaps
/clarify --before-dev                      # Pre-development checkpoint
/clarify --existing                        # Scan existing codebase for gaps
/mvp-kickoff next                          # Start next MVP feature (auto-order)
/mvp-status                                # MVP progress dashboard
/launch-mvp                                # Final launch pipeline
```

### Team Workflow Skills
```bash
/setup-workspace                           # Set your role (REQUIRED per team member)
/daily-sync                                # Pull latest, check version, show next step
/feature-start "add notifications"         # Create branch + task + scope
/feature-done                              # QA gate, lint, tests, prepare PR
/standup                                   # Daily standup report
/org-report                                # Organization health (CTO/Tech Lead)
```

### Existing Project Skills
```bash
/scan-codebase                             # Scan your tech stack
/generate-environment                      # Generate all Claude Code files
/validate-setup                            # Verify everything works
/workflow new "add user notifications"     # Full 13-phase SDLC lifecycle
/workflow new --hotfix "fix login crash"   # Fast-track hotfix
/workflow new --spike "evaluate Redis"     # Research only
/workflow status                           # Dashboard
/task-tracker status                       # Task dashboard
/progress-report dev TASK-001             # Developer report
/progress-report business                 # Business stakeholder report
/metrics all                              # Velocity, quality, cycle-time
/impact-analysis "replace auth"           # Blast radius check
/execution-report TASK-001               # Post-execution analytics
/context-check                            # Verify context under 60% budget
/rollback deploy TASK-001                # Rollback failed deployment
/sync --check                            # Detect environment drift
/sync --fix                              # Auto-repair stale files
/setup-smithery                           # Install community skills
```

### Testing & Audit Skills
```bash
/e2e-browser                               # Run Playwright/Cypress E2E tests
/e2e-mobile                                # Run Maestro/Detox/Appium tests
/api-test                                  # Run API test suites (Newman, Hurl)
/load-test                                 # Run k6/Artillery performance tests
/visual-regression                         # Screenshot comparison tests
/coverage-track                            # Parse coverage reports, track deltas
/security-audit                            # OWASP Top 10, dependency vulns, secrets
/accessibility-audit                       # WCAG 2.1 AA/AAA (axe-core, Pa11y)
/performance-audit                         # Lighthouse, Core Web Vitals, bundle size
/privacy-audit                             # GDPR/CCPA compliance, PII detection
/infrastructure-audit                      # SOC 2, IaC scanning, container security
/license-audit                             # SPDX validation, copyleft risk
/cicd-audit                                # Pipeline security, deployment gates
/docs-audit                                # API docs, README, ADR, changelog quality
/incident-readiness                        # DR plans, runbooks, backup, RTO/RPO
```

### Dev & Quality Skills
```bash
/add-endpoint "POST /api/orders"  # Create API endpoint
/add-component "UserAvatar"       # Create UI component
/add-page "dashboard"             # Add page with route + layout
/fix-bug "cart total wrong"       # Systematic debugging
/hotfix "login crash"             # Emergency fast-track fix
/migrate "add user roles"         # Database migration
/refactor "extract auth service"  # Targeted refactoring
/review-pr 123                    # Code review
/qa-plan                          # Generate QA test plan
/signoff qa TASK-001              # Request sign-off
/deploy staging 456               # Deploy to staging
```

## Workflow (13 Phases)

```
Phase 1:  Task Intake — classify, branch, create task record
Phase 2:  Impact Analysis — @explorer + @security parallel scan
Phase 3:  Architecture Review — @architect designs (skip if small + LOW risk)
Phase 4:  Business Analysis — @product-owner writes acceptance criteria
Phase 5:  Development — @api-builder / @frontend / @infra (parallel worktrees)
Phase 6:  Dev Self-Testing — @tester + @debugger loop (max 5 iterations)
Phase 7:  Code Review — @reviewer + @security loop (max 3 iterations)
Phase 8:  PR + CI — create PR, fix CI failures
Phase 9:  QA Testing — @qa-lead plans, @tester executes, bug loop
Phase 10: Sign-offs — QA -> Business -> Tech (with rejection routing)
Phase 11: Deployment — @infra deploys, health check, rollback on failure
Phase 12: Post-Deploy — monitor, close issues, notify stakeholders
Phase 13: Execution Report — success score, hallucination check, regression audit
```

Mandatory `/context-check` between every phase transition to enforce 60% context budget.

## Hook Events (18 hooks across 10 events)

| Event | Hook | Trigger | Purpose |
|-------|------|---------|---------|
| SessionStart | session-start.js | startup, resume, compact | Role check, context recovery, hook health |
| SessionStart | drift-detector.js | startup | Detect environment drift |
| PreToolUse | protect-files.js | Edit, Write | Block edits to .env, lock files, CI configs |
| PreToolUse | gatekeeper-check.js | Edit, Write | Block secrets, skipped tests, scope violations |
| PreToolUse | validate-bash.js | Bash | Block dangerous commands (rm -rf, fork bomb) |
| PostToolUse | context-monitor.js | Read, Bash, Agent | Track context usage, warn at 45%/60%/75% |
| PostToolUse | audit-logger.js | Edit, Write, Bash | Log all mutations to branch audit log |
| PostToolUse | test-results-parser.js | Bash | Parse test output, detect regressions |
| PostToolUse | post-edit-format.js | Edit, Write | Auto-format (Prettier, Black, gofmt) |
| PostToolUse | track-file-changes.js | Edit, Write | Log file changes for task tracking |
| PostToolUseFailure | tool-failure-tracker.js | any | Track tool errors for debugging |
| PreCompact | pre-compact-save.js | any | Save loop state before compaction |
| PostCompact | post-compact-recovery.js | any | Restore workflow state after compaction |
| Notification | notify-approval.js | permission_prompt | OS notification when approval needed |
| SubagentStop | subagent-tracker.js | any | Track agent completion for metrics |
| Stop | execution-report.js | any | Generate execution metrics snapshot |
| Stop | prompt-stats.js | any | Session stats — tools, tokens, hallucination risk |
| StopFailure | stop-failure-handler.js | rate_limit, auth, billing | Preserve state on session failures |

## Execution Reports

Every phase generates a scored report:
- **Success Score (0-100)** — completeness + quality + efficiency
- **Hallucination Check (0-3)** — verifies file refs, function names, conventions
- **Regression Impact (0-3)** — test suite, coverage delta, lint/type/build
- **Agent Communication** — handoff count, loop iterations, parallel executions
- **Token/Context Usage** — estimated consumption, peak context %

## Context Budget

Everything is designed to keep working context under 60%:

| What | Context Cost | When Loaded |
|------|-------------|-------------|
| CLAUDE.md + rules | ~332 tokens | Always (startup) |
| Agent descriptions | ~371 tokens | Always (metadata only) |
| Skill descriptions | ~250 tokens | Always (metadata only) |
| Agent full bodies | 0 on parent | Subagent context (isolated) |
| Forked skills (88/88) | 0 on parent | Fork context (isolated) |
| Templates/profiles/docs | 0 | Never auto-loaded |
| **Total startup** | **~1,500 tokens** | **~1.2% of 128K** |

Runtime enforcement: `/context-check` between phases, PreCompact hook saves state, PostCompact hook restores it.

## Keeping In Sync

The environment tracks its own state via `.claude/manifest.json`. When the codebase changes (new dependencies, new directories, team role changes), drift is detected automatically:

- **On session start:** `drift-detector.js` hook checks for stale agents, modified dependencies, orphan hooks
- **On workflow start:** Phase 1 runs `/sync --check` before intake
- **Manually:** `/sync --check` (report) or `/sync --fix` (auto-repair)
- **Full reset:** `/sync --full-rescan` re-scans and regenerates everything

## CLI Commands

```bash
npx claude-code-scanner init       # Initialize in existing project
npx claude-code-scanner setup      # Interactive setup wizard (7-step)
npx claude-code-scanner new <name> # Create new project from scratch
npx claude-code-scanner status     # Check setup status
npx claude-code-scanner verify     # Run verification checks (170+ checks)
npx claude-code-scanner update     # Smart update — add new files, preserve customizations
npx claude-code-scanner help       # Show help

# Flags
npx claude-code-scanner init --force         # Overwrite existing files
npx claude-code-scanner init --interactive   # Same as 'setup' command
npx claude-code-scanner init --no-smithery   # Skip Smithery instructions
npx claude-code-scanner new my-app --here    # New project in current directory
npx claude-code-scanner update --force       # Overwrite ALL template files
```

## How It Works

1. **`/scan-codebase`** spawns 6 parallel agents that read your actual code:
   - Technology fingerprinter (100+ framework markers)
   - Directory structure mapper
   - Backend deep scanner (API routes, DB, auth, logging)
   - Frontend deep scanner (components, state, styling, routing)
   - Architecture mapper (data flow, dependencies, security)
   - Domain & convention extractor (naming, patterns, gotchas)

2. **`/generate-environment`** uses scan results to create project-specific:
   - CLAUDE.md with your exact commands, paths, and conventions
   - Rules that enforce YOUR codebase patterns
   - 27 agents configured for YOUR tech stack
   - Skills with YOUR project's commands and file paths
   - Templates extracted from YOUR existing code
   - Profiles for backend, frontend, and devops roles

3. **`/workflow`** orchestrates the full 13-phase SDLC with your agent team:
   - Structured handoff protocol between every agent transition
   - Loop limits with circuit breakers (dev-test 5x, review 3x, QA 3x)
   - Rejection routing from sign-off gates back to correct phase
   - Mandatory execution report with scoring after every phase
   - Context budget enforcement between every phase transition

## Uninstalling

To remove the Claude Code environment from a project:
```bash
rm CLAUDE.md
rm -rf .claude/
# Also remove the gitignore entries added by the scanner
```

To uninstall the CLI globally:
```bash
npm uninstall -g claude-code-scanner
```

## License

MIT
