# Complete Command Reference — Claude Code Scanner

> 68 skills organized by workflow phase. Every command has a purpose, syntax, and shows what comes next.

---

## Quick Reference — Command Flow

```
NEW PROJECT:  /brainstorm → /product-spec → /feature-map → /domain-model → /tech-stack → /architecture → /scaffold → /deploy-strategy
              Or shorthand: /new-project "idea"  |  Full auto: /idea-to-launch "idea"

EXISTING:     /scan-codebase → /generate-environment → /validate-setup → /setup-smithery

DEVELOPMENT:  /mvp-kickoff next → /workflow new "feature" (13 phases) → /mvp-kickoff next (repeat)

LAUNCH:       /mvp-status --launch-ready → /launch-mvp --check → /launch-mvp

MAINTENANCE:  /sync --check → /sync --fix → /context-check → /dependency-check
```

---

## 1. New Project — Pre-Development Pipeline

These commands run in sequence to take an idea from concept to a ready-to-code project.

| # | Command | Purpose | Output | Next Command |
|---|---------|---------|--------|--------------|
| 1 | `/brainstorm "idea"` | Explore problem space, audience, competitive landscape | `IDEA_CANVAS.md` | `/product-spec` |
| 2 | `/product-spec` | Define MVP scope, user journeys, acceptance criteria, success metrics | `PRODUCT_SPEC.md` | `/feature-map` |
| 3 | `/feature-map` | MoSCoW prioritization, size estimation, dependency mapping | `BACKLOG.md` | `/domain-model` |
| 3b | `/domain-model` | Extract entities, glossary, bounded contexts, business rules | `DOMAIN_MODEL.md` | `/tech-stack` |
| 4 | `/tech-stack` | Choose language, framework, DB, hosting with rationale | `TECH_STACK.md` | `/architecture` |
| 5 | `/architecture` | Design data model, API, components, directory structure | `ARCHITECTURE.md` | `/scaffold` |
| 6 | `/scaffold` | Generate project files, configs, dependencies | Project files | Auto: `/scan-codebase` |
| 7 | `/deploy-strategy` | Plan CI/CD, hosting, environments, monitoring, launch checklist | `DEPLOY_STRATEGY.md` | `/methodology` |

### Flags & Variants
| Command | Flag | Effect |
|---------|------|--------|
| `/brainstorm` | `--refine` | Iterate on existing IDEA_CANVAS.md |
| `/product-spec` | `--update` | Revise existing spec |
| `/feature-map` | `--update` | Revise existing backlog |
| `/domain-model` | `--from-code` | Extract from existing codebase |
| `/domain-model` | `--sync TASK-id` | Incremental: scan feature code, merge new entities/rules |
| `/tech-stack` | `--update` | Change decisions |
| `/architecture` | `--update` | Revise design |
| `/scaffold` | `--dry-run` | Preview without creating files |
| `/deploy-strategy` | `--update` | Revise strategy |

---

## 2. New Project — Orchestrators

These run the entire pre-dev pipeline automatically.

| Command | Purpose | What It Runs |
|---------|---------|-------------|
| `/new-project "idea"` | Full 8-phase pre-dev pipeline | All of Section 1 in sequence with user approval gates |
| `/new-project "idea" --fast` | Combined phases, single approval | Phases 1+2+3 combined, then 4+5, then 6+7+8 |
| `/new-project "idea" --from-docs "path"` | Import existing docs, skip populated phases | `/import-docs` first, then remaining phases |
| `/new-project --resume` | Resume interrupted pipeline | Picks up from last completed phase |
| `/idea-to-launch "idea"` | Full automation: idea → deployed product | `/new-project` + `/mvp-kickoff` (all features) + `/launch-mvp` |
| `/idea-to-launch --resume` | Resume interrupted full lifecycle | Detects where it stopped and continues |

---

## 3. Existing Project — Setup

Run these to set up Claude Code on an existing codebase.

| # | Command | Purpose | Output | Next Command |
|---|---------|---------|--------|--------------|
| 1 | `/scan-codebase` | Fingerprint tech stack, architecture, conventions (6 parallel agents) | `TECH_MANIFEST` | `/generate-environment` |
| 2 | `/generate-environment` | Generate all Claude Code files from scan results | agents, skills, rules, hooks, settings | `/validate-setup` |
| 3 | `/validate-setup` | Verify environment (12 automated checks) | Validation report | `/setup-smithery` |
| 4 | `/setup-smithery` | Install matching MCP servers | MCP configuration | `/methodology` |

---

## 4. Configuration

| Command | Purpose | Output |
|---------|---------|--------|
| `/methodology` | Choose SDLC model (Scrum, Kanban, XP, DevOps, etc.) | `METHODOLOGY.md` + adapted workflow |
| `/methodology --show` | View available models without changing | Model comparison |
| `/methodology --adapt` | Reconfigure if methodology changes | Updated config |

---

## 5. Requirement Validation

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/clarify --before-dev` | Validate all requirements before starting development | After `/new-project`, before `/mvp-kickoff` |
| `/clarify --before-launch` | Validate launch readiness | Before `/launch-mvp` |
| `/clarify --feature "name"` | Validate one feature's requirements | Before `/workflow new` |
| `/clarify --existing` | Scan existing codebase for gaps | For existing projects |
| `/clarify --quick` | Focus on top 5 gaps only | Quick check |
| `/import-docs "path/"` | Import PRDs, requirements, specs into project files | When starting with existing documents |

---

## 6. MVP Orchestration

| Command | Purpose | Next Command |
|---------|---------|--------------|
| `/mvp-kickoff next` | Auto-select next Must-Have feature, create workflow task | `/workflow dev TASK-{id}` |
| `/mvp-kickoff "feature name"` | Start specific feature | `/workflow dev TASK-{id}` |
| `/mvp-kickoff --status` | Show feature pipeline status | Address blockers |
| `/mvp-kickoff --all` | Kick off all features sequentially | Auto-chains workflows |
| `/mvp-status` | Progress dashboard (features, quality, readiness) | `/mvp-kickoff next` or `/launch-mvp` |
| `/mvp-status --launch-ready` | Launch readiness checklist | `/launch-mvp --check` |
| `/launch-mvp --check` | Dry run — validate without deploying | `/launch-mvp` |
| `/launch-mvp` | Full launch (validate → integration test → deploy → monitor) | `/mvp-kickoff --post-mvp` |
| `/launch-mvp --post-mvp` | Transition to Should-Have features | `/mvp-kickoff next` |

---

## 7. Development Workflow — 13-Phase SDLC

| Command | Purpose |
|---------|---------|
| `/workflow new "description"` | Start full 13-phase workflow |
| `/workflow new --hotfix "issue"` | Fast-track (skip design/business, tighter loops) |
| `/workflow new --spike "question"` | Research only (Phase 1-3, no code) |
| `/workflow status [TASK-id]` | Show task progress, subtasks, loop state |
| `/workflow advance TASK-id` | Check subtasks and advance to next phase |
| `/workflow done TASK-id subtask-N "evidence"` | Mark subtask complete with proof |
| `/workflow block TASK-id subtask-N "reason"` | Mark subtask blocked |
| `/workflow unblock TASK-id subtask-N "reason"` | Unblock subtask (@team-lead only) |
| `/workflow subtasks TASK-id` | Show full subtask decomposition |
| `/workflow resume TASK-id` | Resume ON_HOLD task |
| `/workflow pause TASK-id` | Put task on hold |
| `/workflow cancel TASK-id` | Cancel with cleanup (PR close, branch delete) |
| `/workflow [plan\|dev\|review\|qa\|deploy] TASK-id` | Jump to specific phase |

### The 13 Phases
| Phase | Name | Agent(s) | What Happens |
|-------|------|----------|-------------|
| 1 | Task Intake | — | Classify, create branch, create task record |
| 2 | Impact Analysis | @explorer + @security | Blast radius, risk assessment |
| 3 | Architecture Review | @architect + @code-quality | Design solution (skip if small+LOW risk) |
| 4 | Business Analysis | @product-owner | Acceptance criteria (GIVEN/WHEN/THEN) |
| 5 | Development | @api-builder / @frontend / @mobile | Write code on feature branch |
| 6 | Dev Self-Testing | @tester + @debugger | Test loop (max 5 iterations) |
| 7 | Dual Code Review | @code-quality → @reviewer (R1) + @security (R2) | Both must APPROVE |
| 8 | PR + CI | Dev agent | Create PR, wait for CI green |
| 9 | QA Testing | @qa-lead + @tester + @qa-automation | Test plan → execute → bug loop |
| 10 | Sign-offs | @qa-lead → @product-owner → @team-lead | Sequential approval gates |
| 11 | PR Merge + Deploy | @team-lead merges → @infra deploys | Merge PR, deploy, health check |
| 12 | Post-Deploy | @infra | Monitor 30min, close issues |
| 13 | Execution Report | Orchestrator | Generate analytics report |

---

## 8. Development Utilities

| Command | Purpose | Agent |
|---------|---------|-------|
| `/fix-bug "description"` | Quick 5-step bug fix (reproduce → diagnose → fix → test → review) | @debugger |
| `/hotfix "issue"` | Emergency production fix (fast-track workflow) | @debugger |
| `/add-endpoint "POST /api/resource"` | Scaffold API endpoint (route, service, model, tests) | @api-builder |
| `/add-component "Name"` | Scaffold UI component (template, styles, tests, Storybook) | @frontend |
| `/add-page "route"` | Add page with layout, data fetching, navigation | @frontend |
| `/migrate "description"` | Create database migration | @database |
| `/migrate run` | Execute pending migrations | @database |
| `/migrate rollback` | Rollback last migration | @database |
| `/refactor "target" --type extract\|rename\|move\|split` | Targeted code refactoring | @code-quality |
| `/parallel-dev --analyze` | Find independent tasks for parallel work | @team-lead |
| `/parallel-dev --start` | Launch parallel development agents | @team-lead |

---

## 9. Review & Quality

| Command | Purpose | Agent |
|---------|---------|-------|
| `/review-pr [PR-number]` | Full code review (quality, security, architecture) | @reviewer + @security |
| `/impact-analysis "change"` | Blast radius analysis before making changes | @explorer + @security |
| `/design-review` | Architecture and design pattern review | @architect + @code-quality |
| `/security-audit` | OWASP Top 10, dependency scan, secret scan, auth review | @security |
| `/qa-plan "feature"` | Create QA test plan with test cases and risk areas | @qa-lead |
| `/mobile-audit` | Mobile quality audit (performance, UX, accessibility, store readiness) | @mobile |
| `/dependency-check` | Check for outdated, vulnerable, or unused dependencies | — |

---

## 10. Deployment & Operations

| Command | Purpose | Agent |
|---------|---------|-------|
| `/signoff tech TASK-id` | Tech sign-off (architecture, performance, tests) | @team-lead |
| `/signoff qa TASK-id` | QA sign-off (test coverage, acceptance criteria) | @qa-lead |
| `/signoff business TASK-id` | Business sign-off (requirements met, UX acceptable) | @product-owner |
| `/deploy staging` | Deploy to staging (pre-checks → deploy → health check → monitor) | @infra |
| `/deploy production` | Deploy to production | @infra |
| `/rollback deploy TASK-id` | Rollback failed deployment | @infra |
| `/rollback code TASK-id` | Revert code changes (git revert) | — |
| `/rollback phase TASK-id` | Undo work to previous phase | — |

---

## 11. Reporting & Analytics

| Command | Purpose | Output |
|---------|---------|--------|
| `/task-tracker status` | Dashboard of all active tasks | Visual dashboard |
| `/task-tracker create "title"` | Create new task record | `.claude/tasks/TASK-{id}.md` |
| `/standup` | Daily standup (yesterday/today/blockers) | Standup report |
| `/progress-report dev` | Developer-focused report (files, coverage, tests) | Report |
| `/progress-report business` | Business stakeholder report (criteria, timeline) | Report |
| `/progress-report executive` | Executive summary (velocity, quality, risks) | Report |
| `/metrics` | Aggregate metrics (velocity, quality, cycle-time, bottlenecks) | Metrics dashboard |
| `/execution-report` | Post-task analytics (tokens, context, success score, hallucinations) | `.claude/reports/executions/` |
| `/cost-estimate` | Infrastructure cost projections | Cost report |
| `/changelog` | Generate changelog from git history | `CHANGELOG.md` |
| `/release-notes [version]` | Generate release documentation | Release notes |
| `/api-docs` | Generate/update OpenAPI specs from code | API documentation |
| `/onboard` | Onboard new developer (structure, conventions, how-to) | Onboarding guide |

---

## 12. Real-Environment Testing

| Command | Purpose | Agent |
|---------|---------|-------|
| `/e2e-browser` | Run Playwright/Cypress headless browser E2E tests | @qa-automation |
| `/e2e-mobile` | Run Maestro/Detox/Appium emulator/device mobile tests | @qa-automation |
| `/api-test` | Run Newman/Hurl/HTTPyac real HTTP API test suites | @tester |
| `/load-test` | Run k6/JMeter/Locust/Artillery concurrent load tests | @tester |
| `/visual-regression` | Playwright/BackstopJS screenshot pixel-diff comparison | @qa-automation |
| `/coverage-track` | Istanbul/c8/coverage.py real coverage parsing + delta tracking | @tester |

---

## 13. Audit & Compliance

| Command | Purpose | Agent |
|---------|---------|-------|
| `/accessibility-audit` | WCAG 2.1 AA/AAA with axe-core, Pa11y, Lighthouse | @qa-automation |
| `/privacy-audit` | GDPR/CCPA data flow mapping, PII detection, consent validation | @security |
| `/performance-audit` | Lighthouse, Core Web Vitals, bundle size, performance budgets | @qa-automation |
| `/infrastructure-audit` | SOC 2 controls, IaC scanning, container/network security | @infra |
| `/license-audit` | OSS license compliance, SPDX validation, copyleft risk | @security |
| `/docs-audit` | README quality, API docs completeness, ADR validation, changelog | @docs-writer |
| `/cicd-audit` | Pipeline secrets, deployment gates, supply chain security | @infra |
| `/incident-readiness` | DR plans, runbooks, backup/restore, monitoring, on-call | @infra |

---

## 14. Observability

| Command | Purpose | Agent |
|---------|---------|-------|
| `/setup-observability` | Set up structured logging, tracing (OpenTelemetry), metrics, error tracking | @infra |
| `/logging-audit` | Audit logging practices — PII leaks, log levels, correlation IDs | @security |

---

## 15. Story Management

| Command | Purpose | Agent |
|---------|---------|-------|
| `/create-story "title"` | Create user story/bug/defect with role-based subtasks, BDD acceptance criteria | @strategist |

---

## 16. Maintenance & Context

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/sync --check` | Detect drift between environment and codebase | Weekly or before major work |
| `/sync --fix` | Auto-repair drift | When drift detected |
| `/sync --full-rescan` | Complete re-scan and regenerate | After major refactors |
| `/context-check` | Check context usage against 60% budget | Between workflow phases |
| `/compact "focus"` | Compact context with focus hint | When context > 60% |

---

## 17. Git Workflow (Built Into `/workflow`)

```
Phase 1:  git checkout -b feature/TASK-{id}/{slug}     ← Branch from main/dev
Phase 5:  All commits on feature branch                  ← Development
Phase 7:  @reviewer (R1) + @security (R2) both approve  ← Dual code review
Phase 8:  gh pr create --base {base} --title "TASK-{id}" ← Create PR
Phase 8:  CI pipeline runs                               ← Automated checks
Phase 11: gh pr merge --squash --delete-branch           ← @team-lead merges
Phase 11: @infra deploys                                 ← Production deployment
```

**Branch naming:** `feature/`, `fix/`, `hotfix/`, `refactor/` + `TASK-{id}/{slug}`

---

## 18. Agent Team (23 Agents)

| Agent | Role | Access | Use For |
|-------|------|--------|---------|
| `@team-lead` | Tech Lead | Read/Write | Orchestration, merge PRs, tech sign-off |
| `@architect` | Architect | Read-only | System design, design review |
| `@product-owner` | Product Owner | Read-only | Acceptance criteria, business sign-off |
| `@qa-lead` | QA Lead | Read-only | QA planning, QA sign-off |
| `@explorer` | Investigator | Read-only | Codebase exploration, impact analysis |
| `@reviewer` | Reviewer 1 | Read-only | Code quality, conventions (dual review) |
| `@security` | Reviewer 2 | Read-only | Security review, vulnerabilities (dual review) |
| `@api-builder` | Backend Dev | Read/Write | API endpoints, services, backend logic |
| `@frontend` | Frontend Dev | Read/Write | UI components, pages, client logic |
| `@tester` | Tester | Read/Write | Automated tests, coverage |
| `@debugger` | Debugger | Read/Write | Bug diagnosis, root cause analysis |
| `@infra` | DevOps | Read/Write | Docker, CI/CD, deployment, monitoring |
| `@mobile` | Mobile Dev | Read/Write | iOS, Android, React Native, Flutter |
| `@database` | Database | Read/Write | Schema design, migrations, query optimization |
| `@ideator` | Brainstorming | Read-only | Problem exploration, idea refinement |
| `@strategist` | Product Strategy | Read/Write docs | Product spec, features, backlog |
| `@scaffolder` | Scaffolding | Read/Write | Project generation, boilerplate |
| `@ux-designer` | UX Design | Read-only | User flows, wireframes, IA |
| `@code-quality` | Code Quality | Read-only | Design patterns, SOLID, static analysis |
| `@qa-automation` | QA Automation | Read/Write | E2E testing, visual verification |
| `@gatekeeper` | Change Gate | Read-only | Auto-validate changes, regression detection |
| `@process-coach` | Process Coach | Read/Write docs | SDLC methodology configuration |
| `@docs-writer` | Documentation | Read/Write docs | READMEs, API docs, ADRs, changelogs |
