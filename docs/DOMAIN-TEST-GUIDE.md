# Claude Code Scanner Framework — Domain Test Guide

**Version:** 1.0.0 | **Date:** 2026-03-29 | **Purpose:** Comprehensive testing reference

---

## 1. WHAT THIS FRAMEWORK IS

A production-ready system that scans codebases (or starts from scratch) and generates complete Claude Code environments. It automates setup for **27 agents, 88 skills, 8 rules, 35 hooks**, and enterprise **RBAC across 10 roles**.

### Core Pipeline (4 Phases)

```
Phase 1: SCAN ──> Phase 2: GENERATE ──> Phase 3: VALIDATE ──> Phase 4: SMITHERY
   │                   │                     │                     │
   6 parallel       Produces all          Line counts,          Install MCP
   agents scan      .claude/ artifacts    JSON validity,        servers matching
   codebase         from TECH_MANIFEST    hook perms,           tech stack
   │                   │                  context budget         │
   └─ TECH_MANIFEST    └─ All files       └─ Pass/fail report   └─ Max 5 per agent
```

**Entry points:**
- `/scan-codebase` — scan existing project
- `/new-project "idea"` — start from scratch (8 sub-phases: ideation -> spec -> features -> domain -> tech -> architecture -> scaffold -> launch)
- `/idea-to-launch "idea"` — full automation from concept to deployed product

---

## 2. AGENT SYSTEM (26 Agents)

### Agent Architecture

Every agent has these enforced sections:
1. **Frontmatter:** name, description, tools, disallowedTools, model, maxTurns, effort
2. **Responsibilities:** what it does
3. **Context Loading:** what it reads before acting
4. **Determinism Contract:** must read GLOSSARY.md, patterns/, ARCHITECTURE.md before output
5. **File Scope:** allowed paths + forbidden paths
6. **Access Control:** which roles can invoke it
7. **Output Contract:** `{ result, files_changed: [], decisions_made: [], errors: [] }`
8. **Execution Metrics:** turns_used, files_read/modified/created, tests_run, coverage_delta, hallucination_flags, regression_flags, confidence

### Agent Roster

| Category | Agent | Model | Write Access | Called By |
|----------|-------|-------|-------------|-----------|
| **Leadership** | @team-lead | opus | Full + PR merge | TechLead, CTO, Architect |
| | @architect | opus | Read-only | Architect, TechLead, CTO, FullStackDev |
| | @cto | opus | Read-only | CTO only |
| | @code-quality | opus | Read-only | All roles |
| **Backend** | @api-builder | sonnet | src/api/, src/services/, src/db/ | BackendDev, FullStackDev, TechLead, CTO |
| | @database | sonnet | src/db/, migrations/ | BackendDev, FullStackDev, TechLead, CTO |
| | @debugger | opus | src/, tests/ (full) | BackendDev, FrontendDev, FullStackDev, TechLead, CTO |
| **Frontend** | @frontend | sonnet | src/ui/, src/components/, src/styles/ | FrontendDev, FullStackDev, TechLead, CTO |
| | @mobile | opus | src/mobile/, ios/, android/ | FullStackDev, TechLead, CTO |
| **Testing** | @tester | sonnet | tests/ (full), src/ (read) | BackendDev, FrontendDev, FullStackDev, QA, TechLead |
| | @qa-lead | sonnet | Read-only | QA, TechLead, CTO |
| | @qa-automation | opus | tests/, e2e/ | QA, TechLead, CTO |
| | @gatekeeper | sonnet | Read-only | All roles (automatic) |
| **Review** | @reviewer | sonnet | Read-only | All roles |
| | @security | opus | Read-only | All roles |
| | @output-validator | sonnet | Read-only | All roles (automatic) |
| **Infra** | @infra | sonnet | infra/, .github/, Dockerfile | DevOps, TechLead, CTO |
| **Product** | @product-owner | sonnet | Read-only | PM, CTO, TechLead |
| | @strategist | sonnet | docs/, .claude/project/ | PM, CTO, TechLead |
| | @ideator | sonnet | Read-only | PM, CTO, TechLead, Architect, Designer |
| | @ux-designer | sonnet | src/styles/ (full), src/ui/ (read) | Designer, FrontendDev, FullStackDev |
| **Docs** | @docs-writer | sonnet | docs/ only | All roles |
| | @process-coach | sonnet | .claude/project/ | TechLead, CTO |
| **Explore** | @explorer | sonnet | Read-only | All roles |
| | @scaffolder | sonnet | src/, tests/, docs/ | TechLead, CTO, Architect, FullStackDev |

### Key Constraints
- **No agent invokes other agents directly** — coordination flows through @team-lead or main conversation
- **@output-validator runs after every subagent call** — validates naming, scope, patterns
- **@gatekeeper fires via hooks** — auto-approves safe changes, blocks risky ones
- **Read-only agents** (architect, cto, reviewer, security, etc.) have `disallowedTools: Edit, Write`

---

## 3. RBAC SYSTEM (10 Roles)

### Role → Permissions Matrix

| Role | Write Paths | Cannot | Commands | Agents |
|------|------------|--------|----------|--------|
| **CTO** | Full audit, CLAUDE.md via PR | Commit to main, bypass PR | /audit-system, /org-report, /sync --full-rescan | @team-lead, @architect, @gatekeeper, @process-coach |
| **Architect** | docs/, .claude/agents/ (read) | Write feature code, bypass QA, deploy | /architecture, /design-review, /dependency-check | @architect, @code-quality, @security, @explorer |
| **TechLead** | Full access | (same as Architect + orchestration) | All + /org-report | @team-lead, @architect, @code-quality |
| **BackendDev** | src/api/, src/services/, src/db/, src/models/, tests/ | Touch src/ui/, modify hooks, merge without QA | /add-endpoint, /api-test, /fix-bug, /migrate | @api-builder, @debugger, @tester, @database |
| **FrontendDev** | src/ui/, src/components/, src/styles/, src/pages/, tests/ | Touch src/api/, modify hooks | /add-component, /add-page, /e2e-browser | @frontend, @debugger, @tester, @ux-designer |
| **FullStackDev** | src/ (full), tests/, docs/adr/ | Modify hooks, merge without QA, touch infra/ | All dev + /impact-analysis | @api-builder, @frontend, @debugger, @tester, @database |
| **QA** | tests/ (full), src/ (read-only) | Merge PRs, modify source, touch infra/hooks | /qa-plan, /e2e-browser, /e2e-mobile, /api-test, /coverage-track, /load-test | @qa-lead, @tester, @qa-automation, @gatekeeper |
| **DevOps** | infra/, .github/, scripts/, Dockerfile | Touch src/, approve feature PRs, modify CLAUDE.md | /deploy, /infrastructure-audit, /cicd-audit, /incident-readiness | @infra, @security, @gatekeeper |
| **PM** | docs/ (read), docs/requirements/ (write) | Run code agents, touch source, modify hooks | /product-spec, /feature-map, /progress-report, /clarify, /brainstorm | @product-owner, @strategist, @ideator |
| **Designer** | src/styles/ (full), src/ui/ (read), docs/design/ (write) | Run build, modify logic, touch src/api/, hooks | /design-review, /accessibility-audit, /visual-regression | @ux-designer, @frontend (read), @code-quality |

### Enforcement Mechanisms
1. **scope-guard.js** (PreToolUse hook) — reads CURRENT_ROLE from session.env, blocks file edits outside role paths, exit code 2
2. **branch-naming-check.js** — validates branch prefix matches CURRENT_ROLE
3. **Agent Access Control sections** — agents check role before executing, exit if unauthorized
4. **PRE-WRITE RULE** (all roles) — search existing code, read patterns, check glossary before creating anything new

### Session Flow
```
/setup-workspace → prompts role → writes .claude/session.env (CURRENT_ROLE=BackendDev)
  → scope-guard reads it on every Edit/Write
  → branch-naming-check validates branch prefix
  → agents check it before executing
```

---

## 4. HOOK SYSTEM (35 Hooks)

### Root Hooks (9) — `.claude/hooks/`

| Hook | Event | Behavior | Exit Code |
|------|-------|----------|-----------|
| pre-tool-use.js | PreToolUse (all) | Blocks writes to CLAUDE.md, settings.json; blocks dangerous Bash | 1 = BLOCK, 0 = pass |
| scope-guard.js | PreToolUse (Edit/Write) | Reads CURRENT_ROLE, blocks out-of-scope file edits | 2 = BLOCK, 0 = pass |
| version-check.js | PreToolUse (all) | Compares local CLAUDE.md version vs git HEAD | 0 always (warn only) |
| branch-conflict-check.js | PreToolUse (Edit/Write) | Checks if file was touched by another branch in 24h | 0 always (warn only) |
| branch-naming-check.js | PreToolUse (all) | Validates branch follows role/ticket/description pattern | 0 always (warn only) |
| post-tool-use.js | PostToolUse (all) | Logs every action to branch-scoped audit log | 0 always |
| doc-drift-check.js | PostToolUse (Edit/Write) | Warns if src/ file changed but matching docs/ file is stale | 0 always (warn only) |
| stop.js | Stop | Updates MEMORY.md (Last Completed + Next Step), logs to audit | 0 always |
| pre-compact.js | PreCompact | Archives MEMORY.md, TODO.md, recent audit to docs/transcripts/ | 0 always |

### Template Hooks (18) — `template/.claude/hooks/`

| Hook | Event | Behavior |
|------|-------|----------|
| session-start.js | SessionStart | Context injection, crash detection, orphan state recovery |
| drift-detector.js | SessionStart (startup only) | Manifest freshness, agent/skill inventory, hook health |
| protect-files.js | PreToolUse (Edit/Write) | Block .github/workflows/, .env, lock files |
| gatekeeper-check.js | PreToolUse (Edit/Write) | Secrets detection, test skip/disable, scope violations |
| validate-bash.js | PreToolUse (Bash) | Block rm -rf, fork bomb, curl\|bash, dd, mkfs |
| context-monitor.js | PostToolUse (Read/Agent/Bash) | Warn at 45% (YELLOW), 60% (ORANGE), 75% (RED) |
| audit-logger.js | PostToolUse (Edit/Write/Bash) | Branch-scoped logging with ROLE, pipe-delimited format |
| test-results-parser.js | PostToolUse (Bash test cmds) | Parse jest/pytest/vitest output, save to reports |
| post-edit-format.js | PostToolUse (Edit/Write) | Auto-format with prettier/black/gofmt |
| track-file-changes.js | PostToolUse (Edit/Write) | Track who changed what when |
| tool-failure-tracker.js | PostToolUseFailure | Log tool execution failures |
| pre-compact-save.js | PreCompact | Save task files, branch, uncommitted work |
| post-compact-recovery.js | PostCompact | Restore state, show tips, clear caches |
| notify-approval.js | Notification | Log permission requests/outcomes |
| subagent-tracker.js | SubagentStop | Record agent completion, turns, status |
| execution-report.js | Stop | Session analytics (tokens, context, agents) |
| prompt-stats.js | Stop | Word count, tool frequency, phase completion |
| stop-failure-handler.js | StopFailure | Preserve state on crash (rate limit, auth, billing) |

### Audit Log Format
**Path:** `.claude/reports/audit/audit-{branch}.log`
**Format:** `ISO-timestamp|ROLE|branch|ACTION|DETAIL|STATUS|duration_ms`
```
2026-03-29T14:23:45Z|BackendDev|backend/PROJ-42/auth|EDIT_FILE|src/api/auth.ts|ok|890ms
2026-03-29T14:24:10Z|BackendDev|backend/PROJ-42/auth|BASH_CMD|npm test|exit:0|3200ms
2026-03-29T14:25:33Z|System|backend/PROJ-42/auth|DOC_DRIFT|src/api/auth.ts changed, docs/api/auth.md stale|warn|0ms
```

---

## 5. SKILLS BY CATEGORY (85 Total)

### Team Workflow (5)
`/setup-workspace` `/daily-sync` `/feature-start` `/feature-done` `/task-tracker`

### Real Environment Testing (6)
`/e2e-browser` `/e2e-mobile` `/api-test` `/load-test` `/visual-regression` `/coverage-track`

### Audit & Compliance (9)
`/audit-system` `/accessibility-audit` `/privacy-audit` `/performance-audit` `/infrastructure-audit` `/license-audit` `/docs-audit` `/cicd-audit` `/incident-readiness`

### Observability (2)
`/setup-observability` `/logging-audit`

### New Project Lifecycle (8)
`/new-project` `/idea-to-launch` `/import-docs` `/clarify` `/brainstorm` `/product-spec` `/tech-stack` `/architecture`

### MVP & Feature Delivery (6)
`/mvp-kickoff` `/mvp-status` `/launch-mvp` `/feature-map` `/create-story` `/domain-model`

### Development (8)
`/add-endpoint` `/add-component` `/add-page` `/add-command` `/add-template` `/add-scene` `/migrate` `/scaffold`

### Quality & Review (10)
`/design-review` `/security-audit` `/review-pr` `/dependency-check` `/impact-analysis` `/qa-plan` `/fix-bug` `/hotfix` `/refactor` `/signoff`

### Reporting (6)
`/progress-report` `/execution-report` `/org-report` `/metrics` `/standup` `/changelog`

### Feature Management (4)
`/feature-flags` `/api-version` `/api-docs` `/cost-estimate`

### Infrastructure (2)
`/deploy` `/deploy-strategy`

### Specialized (6)
`/methodology` `/parallel-dev` `/sync` `/context-check` `/onboard` `/firmware-audit`

### Mobile/Web (3)
`/mobile-audit` `/seo-audit` `/cms-manage`

### Enterprise (5)
`/manage-i18n` `/service-contract` `/pi-planning` `/add-scene` `/add-command`

---

## 6. RULES (8 Path-Scoped Constraints)

| Rule | Applies To | Key Constraint |
|------|-----------|----------------|
| accuracy.md | All code files | Verify imports exist, function signatures match, never fabricate |
| prompt-efficiency.md | All code files | No full-file reads >100 lines, targeted tool use, no code recap |
| context-budget.md | All code files | CLAUDE.md <=150 lines, rules <=50 lines, startup <20%, working <60% |
| request-validation.md | All code files | Confirm WHAT/WHY/WHERE before coding, scope check |
| task-brief.md | .claude/tasks/ | Task Brief required BEFORE work, Audit Log updated real-time |
| task-lifecycle.md | .claude/tasks/ | Subtasks must be DONE to advance, phase completion checklist |
| domain-terms.md | .claude/project/ | Use exact terms from GLOSSARY.md, never synonyms |
| logging.md | All code files | Structured JSON in prod, requestId, never log PII/secrets |

---

## 7. SUPPORTING DOCS

| Document | Path | Purpose |
|----------|------|---------|
| STANDARDS.md | docs/ | Naming (kebab-case files, PascalCase classes), import order (5-tier), error handling, logging, tests (AAA), comments, commit format |
| GLOSSARY.md | docs/ | 13 canonical terms: User, Session, Agent, Skill, Hook, Rule, Task, Role, RBAC, ADR, QA Gate, Tech Manifest, Handoff |
| ARCHITECTURE.md | docs/ | System overview, 4-phase pipeline, module boundaries with owners |
| ONBOARDING.md | docs/ | 10 role tracks: CTO, Architect, Tech Lead, Backend, Frontend, FullStack, QA, DevOps, PM, Designer |
| patterns/ | docs/patterns/ | 6 patterns: api-endpoint, component, data-model, error-handling, service-layer, test (AAA) |
| adr/ | docs/adr/ | 0000-template.md + 0001-enterprise-rbac.md |
| CODEOWNERS | .github/ | CLAUDE.md @cto @tech-lead, agents/ @tech-lead @architect, hooks/ @tech-lead |

---

## 8. WORKFLOW: FEATURE LIFECYCLE (13 Phases)

```
Phase 1:  INTAKE          @team-lead creates task brief, assigns scope
Phase 2:  IMPACT ANALYSIS @explorer assesses blast radius
Phase 3:  DESIGN          @architect proposes design, @code-quality selects patterns
Phase 4:  BUSINESS REVIEW @product-owner writes acceptance criteria (GIVEN/WHEN/THEN)
Phase 5:  DEVELOPMENT     @api-builder / @frontend / @database implement
Phase 6:  TESTING         @tester writes unit + integration tests
Phase 7:  CODE REVIEW     @reviewer (quality) + @security (OWASP) — dual review required
Phase 8:  CREATE PR       PR with doc sync, lint, tests
Phase 9:  QA TESTING      @qa-automation deploys, runs E2E, captures evidence
Phase 10: SIGN-OFF        @qa-lead + @product-owner + @team-lead approve
Phase 11: DEPLOYMENT      @infra deploys to staging/production
Phase 12: MONITORING      24h post-deploy check
Phase 13: CLOSE           Task marked complete, docs updated
```

**Gates between phases:**
- Phase 5 -> 6: All subtasks DONE
- Phase 6 -> 7: Coverage >= baseline
- Phase 7 -> 8: All critical review comments addressed
- Phase 9 -> 10: @qa-automation passes, all P0/P1 bugs fixed
- Phase 10 -> 11: Tech + QA + Business approval
- Phase 11 -> 12: CI green, all tests pass

---

## 9. CONTEXT BUDGET SYSTEM

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| CLAUDE.md lines | 150 recommended, 200 hard | context-budget rule |
| Rule file lines | 50 max | context-budget rule |
| Skill files | Must use `context: fork` if >30 lines | context-budget rule |
| Startup context | <20% | context-monitor hook |
| Working context | <60% | context-monitor hook |

**Warning thresholds:** 45% YELLOW, 60% ORANGE, 75% RED

**Recovery:** `/context-check` -> `/compact "focus on [task]"` -> pre-compact-save -> post-compact-recovery

---

## 10. SESSION STATE MANAGEMENT

### Files
- `.claude/session.env` — CURRENT_ROLE, WORKSPACE_INITIALIZED, INITIALIZED_AT
- `MEMORY.md` — Last Completed, Next Step (updated by stop.js)
- `TODO.md` — Active task list (read by stop.js for Next Step)
- `.claude/tasks/BRIEF-*.md` — Task briefs with audit logs

### Daily Flow
```
Morning:  /setup-workspace -> /daily-sync (pull, verify version, show activity)
Work:     /feature-start -> develop -> /feature-done
End:      stop.js updates MEMORY.md automatically
```

### Branch Convention
`{role-prefix}/{ticket-id}/{description}`
- Validated by branch-naming-check.js against CURRENT_ROLE
- Role prefixes: cto, architect, techlead, backend, frontend, fullstack, qa, devops, pm, designer
- Generic prefixes also allowed: feature, fix, hotfix, chore, docs, test, refactor

---

## 11. TEST MATRIX — WHAT TO VERIFY

### A. Pipeline Tests
- [ ] `/scan-codebase` produces TECH_MANIFEST with real values
- [ ] `/generate-environment` creates all expected directories and files
- [ ] `/validate-setup` catches missing files, bad JSON, exceeded line limits
- [ ] Generated CLAUDE.md has no unsubstituted `{placeholder}` values

### B. RBAC Tests (per role)
- [ ] BackendDev CANNOT edit src/ui/ files (scope-guard blocks)
- [ ] FrontendDev CANNOT edit src/api/ files (scope-guard blocks)
- [ ] QA CANNOT edit src/ files (scope-guard blocks)
- [ ] PM CANNOT run code agents (access control rejects)
- [ ] DevOps CANNOT touch src/ (scope-guard blocks)
- [ ] Designer CANNOT modify logic files (scope-guard blocks)
- [ ] CTO/TechLead CAN access everything (wildcard pass)
- [ ] FullStackDev CAN access all src/ but NOT infra/ (scope-guard blocks)
- [ ] Branch naming warns when prefix doesn't match CURRENT_ROLE

### C. Hook Tests
- [ ] pre-tool-use.js BLOCKS write to CLAUDE.md (exit 1)
- [ ] pre-tool-use.js BLOCKS `rm -rf /` (exit 1)
- [ ] scope-guard.js BLOCKS out-of-scope edit (exit 2)
- [ ] scope-guard.js ALLOWS in-scope edit (exit 0)
- [ ] version-check.js WARNS on version mismatch (exit 0 + stderr)
- [ ] branch-conflict-check.js WARNS on recently-touched files (exit 0 + stderr)
- [ ] post-tool-use.js creates branch-scoped log entry in `.claude/reports/audit/`
- [ ] doc-drift-check.js WARNS when src/ changed but docs/ stale
- [ ] stop.js updates MEMORY.md with git log + TODO.md
- [ ] pre-compact.js archives to docs/transcripts/
- [ ] All hooks exit 0 on internal errors (never block workflow)

### D. Agent Tests
- [ ] Every agent has Determinism Contract referencing GLOSSARY.md + patterns/
- [ ] Every agent has File Scope matching its role's RBAC paths
- [ ] Every agent has Access Control listing allowed roles
- [ ] @output-validator catches naming violations against GLOSSARY.md
- [ ] @output-validator catches scope violations (agent writing outside declared paths)
- [ ] @gatekeeper blocks secrets in code (password, api_key patterns)
- [ ] @gatekeeper blocks test disables (.skip, .only, xit)
- [ ] Agents with `disallowedTools: Edit, Write` cannot modify files

### E. Skill Tests
- [ ] `/setup-workspace` creates session.env with CURRENT_ROLE
- [ ] `/daily-sync` runs git pull, checks version, shows activity
- [ ] `/feature-start` creates role-prefixed branch
- [ ] `/feature-done` runs doc sync check, QA gate, lint, tests
- [ ] `/org-report` rejects non-CTO/TechLead/Architect roles
- [ ] `/audit-system` runs 7-phase validation
- [ ] All 87 skill directories have SKILL.md with valid frontmatter

### F. Doc Consistency Tests
- [ ] CLAUDE.md says "27 agents" (matches actual count)
- [ ] CLAUDE.md says "88 skills" (matches actual count)
- [ ] ARCHITECTURE.md counts match CLAUDE.md
- [ ] ONBOARDING.md has all 10 role tracks
- [ ] GLOSSARY.md terms are referenced by all agents
- [ ] STANDARDS.md covers: naming, imports, errors, logging, tests, comments, commits
- [ ] Every pattern in docs/patterns/ has: Intent, Structure, Example, Anti-patterns
- [ ] CODEOWNERS protects CLAUDE.md, agents/, hooks/, rules/, settings

### G. Audit Log Tests
- [ ] Logs write to `.claude/reports/audit/audit-{branch}.log`
- [ ] Log format is pipe-delimited: `timestamp|role|branch|action|detail|status|duration_ms`
- [ ] ROLE field reads from session.env CURRENT_ROLE
- [ ] Branch field reads from `git branch --show-current`
- [ ] All 9 root hooks log to branch-scoped path (not AUDIT_LOG.md)
- [ ] doc-drift-check.js includes role + branch in its log entries

### H. Cross-Consistency Tests
- [ ] scope-guard.js ROLE_PATHS matches CLAUDE.md permissions for every role
- [ ] branch-naming-check.js validRoles includes all 10 role prefixes
- [ ] Agent Access Control lists match CLAUDE.md "Agents" column per role
- [ ] Agent File Scope matches CLAUDE.md "Write Paths" per role
- [ ] All agent Output Contracts include `decisions_made: []` (matches Determinism Contract)
- [ ] settings.json registers all 9 root hooks (no orphans)
- [ ] template settings.json registers all 18 template hooks

---

## 12. ARCHITECTURE OVERVIEW

```
claude-code-scanner/
├── CLAUDE.md                          # Framework constitution (190 lines, versioned)
├── .claude/
│   ├── settings.json                  # Hook registrations, permissions
│   ├── settings.local.json            # Local overrides
│   ├── session.env.template           # CURRENT_ROLE template
│   ├── CLAUDE.ci.md                   # Headless CI/CD config
│   └── hooks/ (9 files)              # Root-level hooks
│       ├── pre-tool-use.js            # File protection + bash safety
│       ├── scope-guard.js             # RBAC path enforcement
│       ├── version-check.js           # CLAUDE.md drift detection
│       ├── branch-conflict-check.js   # Merge conflict prevention
│       ├── branch-naming-check.js     # Branch convention + role validation
│       ├── post-tool-use.js           # Branch-scoped audit logging
│       ├── doc-drift-check.js         # Doc staleness detection
│       ├── stop.js                    # MEMORY.md update on exit
│       └── pre-compact.js             # State archive before compaction
├── docs/
│   ├── STANDARDS.md                   # Coding standards
│   ├── GLOSSARY.md                    # 13 canonical terms
│   ├── ARCHITECTURE.md                # System architecture
│   ├── ONBOARDING.md                  # 10 role tracks
│   ├── claude-md-changelog.md         # Framework version history
│   ├── patterns/ (6 files)            # Design pattern templates
│   └── adr/ (2 files)                # Architecture decision records
├── .github/CODEOWNERS                 # File protection rules
├── template/                          # Generated environment template
│   ├── CLAUDE.md                      # Lightweight scaffold (42 lines)
│   └── .claude/
│       ├── settings.json              # Full settings (223 lines, 35 hooks)
│       ├── agents/ (25 files)         # Role-based subagents
│       ├── skills/ (85 directories)   # Workflow automations
│       ├── rules/ (8 files)           # Path-scoped constraints
│       ├── hooks/ (18 files)          # Full hook suite
│       ├── project/ (20+ docs)        # Pre-dev documents
│       ├── templates/                 # Code scaffolding
│       ├── profiles/                  # Role profiles
│       ├── scripts/                   # Setup scripts
│       ├── reports/                   # Audit, test, metrics output
│       └── docs/                      # Commands reference, protocols
└── logs/                              # Legacy (migrated to .claude/reports/audit/)
```

### Two-Layer Architecture
- **Root** (`.claude/`, `docs/`, `CLAUDE.md`) — THIS project's own config for developing the scanner
- **Template** (`template/.claude/`, `template/CLAUDE.md`) — what gets GENERATED for other projects

They are intentionally different. Root has 17 hooks for development governance. Template has 18 hooks for production environments.
