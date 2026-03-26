# Claude Code Scanner

> Scan any codebase and generate a complete Claude Code environment — 12 role-based agents, 13 skills, 12 hooks, rules, templates, full SDLC workflow with execution analytics.

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
curl -fsSL https://raw.githubusercontent.com/adnan-prompts/claude-code-scanner/main/install.sh | bash
```

### Method 2b: One-line install (Windows PowerShell)
```powershell
cd C:\path\to\your-project
irm https://raw.githubusercontent.com/adnan-prompts/claude-code-scanner/main/install.ps1 | iex
```

### Method 3: Git clone
```bash
git clone https://github.com/adnan-prompts/claude-code-scanner.git /tmp/scanner
cp /tmp/scanner/template/CLAUDE.md ./CLAUDE.md
cp -r /tmp/scanner/template/.claude ./.claude
rm -rf /tmp/scanner
```

### Method 4: Global install
```bash
npm install -g claude-code-scanner
cd /path/to/your-project
claude-code-scanner init
```

### Cross-Platform Support

Works on **Windows**, **macOS**, and **Linux**. All hooks and scripts use Node.js (no bash/jq dependency). The only requirement is Node.js >= 18.

## Usage

After installing, 3 commands set up everything:

```bash
claude                      # Start Claude Code session
/scan-codebase              # Scan your tech stack (2-5 min)
/generate-environment       # Generate all Claude Code files
```

That's it. Your project now has a complete AI-powered development environment.

## What It Creates

```
your-project/
├── CLAUDE.md                     <- Project instructions (auto-loaded)
├── .claude/
│   ├── settings.json             <- Permissions + 10 hook events
│   ├── settings.local.json       <- Your env vars (gitignored)
│   ├── rules/                    <- Path-specific coding rules
│   ├── agents/                   <- 12 role-based AI agents
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
│   │   └── infra.md              <- Docker, CI/CD, deployment
│   ├── skills/                   <- 13 slash commands
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
│   │   └── validate-setup/       <- /validate-setup
│   ├── hooks/                    <- 12 automation scripts (10 events)
│   ├── profiles/                 <- Developer role profiles
│   ├── templates/                <- Code scaffolding (extracted from real code)
│   ├── docs/                     <- 9 reference documents
│   ├── scripts/                  <- Verification scripts
│   ├── tasks/                    <- Task tracking (gitignored)
│   └── reports/                  <- Progress & execution reports (gitignored)
```

## Agent Team (Role-Based)

### SDLC Role Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@team-lead` | Orchestrator — assigns work, resolves blockers, tech sign-off | Read/Write | opus |
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

### Dev Agents
| Agent | Role | Access | Model |
|-------|------|--------|-------|
| `@api-builder` | Backend endpoints & services | Read/Write + worktree | sonnet |
| `@frontend` | UI components & pages | Read/Write + worktree | sonnet |
| `@infra` | Docker, CI/CD, deployment | Read/Write | sonnet |

All agents include: structured handoff protocol with execution metrics, explicit limitations, cross-session memory, and self-check for hallucinations and regressions.

## Commands After Setup

### Built-in Skills
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

### Generated Skills (created by /generate-environment based on your stack)
```bash
/add-feature "password reset"     # Scaffold feature
/add-endpoint "POST /api/orders"  # Create API endpoint
/add-component "UserAvatar"       # Create UI component
/fix-bug "cart total wrong"       # Systematic debugging
/migrate "add user roles"         # Database migration
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

## Hook Events (10 registered)

| Event | Hook | Purpose |
|-------|------|---------|
| SessionStart | session-start.js | Re-inject active task context |
| PreToolUse | protect-files.js, validate-bash.js | Block dangerous operations |
| PostToolUse | post-edit-format.js, track-file-changes.js | Auto-format, log changes |
| PostToolUseFailure | tool-failure-tracker.js | Track tool errors for debugging |
| PreCompact | pre-compact-save.js | Save loop state before compaction |
| PostCompact | post-compact-recovery.js | Restore workflow state after compaction |
| Notification | notify-approval.js | OS notification on permission prompt |
| SubagentStop | track-file-changes.js | Record subagent file changes |
| Stop | execution-report.js + prompt | Mandatory execution report |
| StopFailure | stop-failure-handler.js | Preserve state on failures |

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
| Forked skills (11/13) | 0 on parent | Fork context (isolated) |
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
npx claude-code-scanner init       # Initialize in current directory
npx claude-code-scanner status     # Check setup status
npx claude-code-scanner verify     # Run verification checks (170+ checks)
npx claude-code-scanner update     # Update to latest version
npx claude-code-scanner help       # Show help

# Flags
npx claude-code-scanner init --force         # Overwrite existing files
npx claude-code-scanner init --no-smithery   # Skip Smithery instructions
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
   - 12 agents configured for YOUR tech stack
   - Skills with YOUR project's commands and file paths
   - Templates extracted from YOUR existing code
   - Profiles for backend, frontend, and devops roles

3. **`/workflow`** orchestrates the full 13-phase SDLC with your agent team:
   - Structured handoff protocol between every agent transition
   - Loop limits with circuit breakers (dev-test 5x, review 3x, QA 3x)
   - Rejection routing from sign-off gates back to correct phase
   - Mandatory execution report with scoring after every phase
   - Context budget enforcement between every phase transition

## License

MIT
