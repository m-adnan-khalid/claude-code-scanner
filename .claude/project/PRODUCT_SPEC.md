# PRODUCT SPEC — Claude Code Scanner

**Version:** 2.2.0
**Owner:** @strategist
**Created:** 2026-04-01
**Story:** STORY-002
**Status:** IN_REVIEW

---

## 1. Vision & Mission

**Vision:** Every development team has a production-ready, enterprise-grade Claude Code environment — generated in minutes, not days.

**Mission:** Scan any existing codebase or start from a new idea and generate a complete Claude Code environment with agents, skills, hooks, rules, RBAC, and workflows — fully configured, validated, and ready for team use.

- Source: README.md (tagline), package.json (description)

---

## 2. Product Overview

Claude Code Scanner is an open-source CLI tool (Node.js >= 18, zero external dependencies) that automates the creation of Claude Code development environments. It operates in two modes:

1. **Existing Codebase Mode:** Scans a project, fingerprints the tech stack, and generates a tailored Claude Code environment.
2. **New Project Mode:** Takes an idea through 8 pre-development phases (brainstorm → spec → features → domain → tech → architecture → scaffold → deploy) to produce both the project and its Claude Code environment.

- Source: README.md, DOCUMENTATION.md

---

## 3. Features

| ID | Feature | User Story | Priority | Status |
|----|---------|-----------|----------|--------|
| FEAT-001 | 4-Phase Pipeline | As a developer, I want to scan my codebase and get a complete Claude Code environment so that I don't spend days configuring it manually | Must Have | Done |
| FEAT-002 | New Project Mode | As a PM/CTO, I want to go from an idea to a scaffolded project with full Claude Code setup so that I can start development immediately | Must Have | Done |
| FEAT-003 | 30 Role-Based Agents | As a tech lead, I want pre-configured agents for every team role so that each role has AI assistance tailored to their work | Must Have | Done |
| FEAT-004 | 93 Workflow Skills | As a developer, I want skill commands for common tasks (add-endpoint, fix-bug, deploy, etc.) so that I follow consistent patterns | Must Have | Done |
| FEAT-005 | 44 Automation Hooks | As a tech lead, I want hooks that enforce standards, guard scope, and log actions so that quality is maintained automatically | Must Have | Done |
| FEAT-006 | 8 Path-Scoped Rules | As an architect, I want rules that constrain behavior by file path so that agents work within their boundaries | Must Have | Done |
| FEAT-007 | 10-Role RBAC | As a CTO, I want role-based access control so that team members only access files and commands appropriate to their role | Must Have | Done |
| FEAT-008 | 13-Phase Feature Workflow | As a tech lead, I want a structured workflow from feature-start to feature-done so that every feature follows the same lifecycle | Must Have | Done |
| FEAT-009 | Execution Reports & Scoring | As a QA lead, I want execution reports with hallucination detection and regression monitoring so that I can track agent output quality | Must Have | Done |
| FEAT-010 | Context Budget Management | As an architect, I want context budget enforcement (<20% startup, <60% working) so that agents don't exhaust their context window | Must Have | Done |
| FEAT-011 | Drift Detection & Sync | As a tech lead, I want automatic drift detection between CLAUDE.md and actual project state so that configuration stays in sync | Must Have | Done |
| FEAT-012 | Error Recovery | As a developer, I want retry logic and circuit breakers so that transient failures don't halt my workflow | Must Have | Done |
| FEAT-013 | 7-Phase System Audit | As a CTO, I want a comprehensive system audit command so that I can verify the entire environment is correctly configured | Must Have | Done |
| FEAT-014 | npm Distribution | As a user, I want to install via `npx claude-code-scanner` so that setup is one command | Should Have | Backlog |
| FEAT-015 | Interactive CLI Mode | As a user, I want an interactive mode that guides me through options so that I don't need to memorize commands | Should Have | Backlog |
| FEAT-016 | Plugin System | As a developer, I want to extend the scanner with plugins so that I can add custom agents, skills, or hooks | Could Have | Backlog |
| FEAT-017 | Video Walkthrough | As a new user, I want a video demo so that I can see the tool in action before installing | Could Have | Backlog |

- Source: README.md, TODO.md, DOCUMENTATION.md, CLAUDE.md

---

## 4. MVP Definition

### In Scope (MVP — v2.2.0, DONE)
All features FEAT-001 through FEAT-013 are complete and verified:
- Complete 4-phase pipeline (scan → generate → validate → smithery)
- Full agent team (30 agents), skill library (93), hook system (25 root + 19 template hooks)
- Enterprise RBAC (10 roles) with PreToolUse enforcement
- 13-phase workflow with QA gates
- Execution reports, context budget, drift detection
- Framework certified: 100% pass, 69/69 checks (CERT-20260329-FINAL)
- Source: TODO.md (all active items checked), docs/verification/CERT-20260329-FINAL.md

### Out of Scope (Post-MVP)
- FEAT-014: npm publish (next priority)
- FEAT-015: Interactive CLI mode
- FEAT-016: Plugin system
- FEAT-017: Video walkthrough
- Source: TODO.md (backlog section)

**MVP Boundary:** The tool is fully functional via `git clone` and `node bin/cli.js`. npm distribution is the bridge to mainstream adoption but not required for core functionality.

---

## 5. User Journeys

### Journey 1: Existing Codebase Setup (Primary)
**Persona:** Full Stack Developer joining a project
**Flow:** Install → `npx claude-code-scanner` → scanner detects tech stack → generates CLAUDE.md, agents, skills, hooks, rules → validates → developer runs `/setup-workspace` → starts working
**AC:** GIVEN a Node.js project exists WHEN the developer runs the scanner THEN a complete Claude Code environment is generated and validated within one session

### Journey 2: New Project from Idea
**Persona:** CTO/PM with a product idea
**Flow:** `/new-project "idea"` → brainstorm → spec → features → domain → tech → architecture → scaffold → deploy strategy → full environment ready
**AC:** GIVEN a product idea WHEN the CTO runs new-project THEN all 8 pre-dev phases produce populated documents and a scaffolded project

### Journey 3: Team Onboarding
**Persona:** New team member (any of 10 roles)
**Flow:** Clone repo → `/setup-workspace` → select role → role-specific profile loaded → `/daily-sync` → start first task
**AC:** GIVEN a new team member WHEN they run setup-workspace THEN their role is stored in session.env AND they see role-appropriate commands and agents
- Source: docs/ONBOARDING.md

### Journey 4: Ongoing Governance
**Persona:** CTO/Tech Lead
**Flow:** `/audit-system` → 7-phase check → execution report → `/sync --check` → drift detection → `/org-report`
**AC:** GIVEN a configured environment WHEN the CTO runs audit-system THEN all 7 phases report pass/fail with specific findings
- Source: CLAUDE.md, docs/DOMAIN-TEST-GUIDE.md

---

## 6. Success Metrics / KPIs

| # | Metric | Target | Current | Source |
|---|--------|--------|---------|--------|
| KPI-001 | Framework verification score | 100% | 100% (69/69) | CERT-20260329-FINAL |
| KPI-002 | Integration test pass rate | 100% | 100% (18/18) | TODO.md |
| KPI-003 | Agent coverage (roles) | 10/10 | 10/10 (30 agents) | CLAUDE.md |
| KPI-004 | Skill coverage (workflow phases) | 13/13 | 13/13 (93 skills) | README.md |
| KPI-005 | Hook coverage (events) | 10/10 | 10/10 (25 root + 19 template hooks) | settings.json |
| KPI-006 | npm weekly downloads | 100+ | [?] Not published yet | TODO.md |
| KPI-007 | Setup time (existing project) | < 5 min | [?] Not benchmarked | [INFERRED] |
| KPI-008 | GitHub stars | 50+ | [?] Not tracked | [INFERRED] |

---

## 7. Constraints

| Type | Constraint | Source |
|------|-----------|--------|
| Technical | Node.js >= 18 required | package.json |
| Technical | Zero external dependencies (Node.js built-ins only) | CONTRIBUTING.md |
| Technical | Cross-platform (Windows, macOS, Linux) | CONTRIBUTING.md |
| Legal | MIT license | package.json |
| Distribution | npm registry (preferGlobal: true) | package.json |
| Quality | Framework verification must pass 100% before release | docs/verification/ |

---

## 8. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| OQ-001 | What is the target npm publish date? | Blocks distribution | @cto | OPEN |
| OQ-002 | What features should interactive CLI mode include? | Scopes FEAT-015 | @strategist | OPEN |
| OQ-003 | What plugin API surface should be exposed? | Scopes FEAT-016 | @architect | OPEN |
| OQ-004 | Are there competing tools to benchmark against? | Competitive positioning | @strategist | OPEN — see STORY-009 |
| OQ-005 | Skill count discrepancy: README says 79, CLAUDE.md says 86 | Documentation accuracy | @docs-writer | RESOLVED — Verified: 93 skills (88 base + 5 output-format), all docs updated 2026-04-03 |

---

## 9. Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R-001 | npm publish blocked by unknown issue | LOW | HIGH | Run `npm pack --dry-run` first (per MEMORY.md) |
| R-002 | Node.js 18 EOL forces upgrade | MED | MED | Monitor Node.js release schedule |
| R-003 | Claude API changes break agent contracts | MED | HIGH | Version-pin agent model references |
| R-004 | Context window limits constrain complex workflows | MED | MED | Context budget system already in place |
| R-005 | Low adoption due to lack of marketing | HIGH | MED | Video walkthrough (FEAT-017), npm presence |

---

## Changelog
| Date | Author | Change |
|------|--------|--------|
| 2026-04-01 | @installer | Story created from document scan |
| 2026-04-01 | @strategist | PRODUCT_SPEC populated from 16 source documents |
