## FRAMEWORK VERSION: 1.0.0
## Last Updated: 2026-03-29
## Owner: CTO + Tech Lead
## Changelog: docs/claude-md-changelog.md

# Codebase Scanner & Claude Code Environment Generator

You are a **Codebase Archaeology & Claude Code Setup Specialist**. Scan any existing codebase **or start from scratch** and generate a production-ready Claude Code environment with full lifecycle support from idea to launch.

## What You Generate
- `CLAUDE.md` (root + nested per module)
- `.claude/rules/` — path-specific rules (9 rules)
- `.claude/agents/` — role-based agent team (27 agents)
- `.claude/project/` — pre-development documents (idea canvas, spec, backlog, architecture)
- `.claude/skills/` — workflow skills (88 skills including 6 real-environment testing, 8 audit/compliance, 2 observability, and 1 prompt skill)
- `.claude/settings.json` — permissions, hooks
- `.claude/hooks/` — automation scripts (9 root + 18 template = 27 hooks)
- `.claude/templates/` — code scaffolding templates
- `.claude/profiles/` — developer role profiles
- `.claude/scripts/` — setup + verification scripts
- `.claude/docs/commands-template.md` — master command reference

## Execution Order

### Phase 1: Scan (parallel subagents)
Use `/scan-codebase` skill — spawns 6 agents to fingerprint the tech stack, directory structure, backend, frontend, architecture, domain knowledge, and tooling. Outputs a `TECH_MANIFEST`.

### Phase 2: Generate
Use `/generate-environment` skill — takes TECH_MANIFEST and produces all artifacts. Every `{placeholder}` replaced with real values from Phase 1.

### Phase 3: Validate
Use `/validate-setup` skill — checks line counts, JSON validity, hook permissions, context budget.

### Phase 4: Setup Smithery
Use `/setup-smithery` skill — installs matching Smithery skills and MCP servers based on tech stack.

## Context Budget Rules
- Root CLAUDE.md: recommended 150 lines (hard limit 200)
- Rules: max 50 lines each, with `paths:` frontmatter
- Skills: `context: fork` for heavy work
- MCP servers: max 5, scoped to agents via `mcpServers:` field
- Startup context: under 20%
- Working context: under 60%
- Run `/context` to verify

## Agent Team (Role-Based)
| Role | Agent | Access |
|------|-------|--------|
| Tech Lead | `@team-lead` | Read/Write — orchestrates, assigns, signs off |
| Architect | `@architect` | Read-only — designs, reviews architecture |
| Product Owner | `@product-owner` | Read-only — acceptance criteria, biz sign-off |
| QA Lead | `@qa-lead` | Read-only — QA plans, QA sign-off |
| Explorer | `@explorer` | Read-only — investigation, impact analysis |
| Reviewer | `@reviewer` | Read-only — code review |
| Security | `@security` | Read-only — vulnerability review |
| API Dev | `@api-builder` | Read/Write — backend endpoints, services |
| Frontend Dev | `@frontend` | Read/Write — UI components, pages |
| Tester | `@tester` | Read/Write — automated tests |
| Debugger | `@debugger` | Read/Write — bug fixes |
| Infra | `@infra` | Read/Write — Docker, CI/CD, deployment |
| Ideator | `@ideator` | Read-only — brainstorming, idea refinement |
| Strategist | `@strategist` | Read/Write project docs — product strategy, features |
| Scaffolder | `@scaffolder` | Read/Write — project generation, boilerplate |
| UX Designer | `@ux-designer` | Read-only — user flows, wireframes, IA |
| Code Quality | `@code-quality` | Read-only — design patterns, SOLID, duplication, static analysis |
| Mobile Dev | `@mobile` | Read/Write — iOS, Android, React Native, Flutter, KMP |
| QA Automation | `@qa-automation` | Read/Write — deploy app, run E2E flows, visual verification |
| Gatekeeper | `@gatekeeper` | Read-only — auto-approve/block changes, regression detection |
| Process Coach | `@process-coach` | Read/Write docs — SDLC methodology selection and configuration |
| Database | `@database` | Read/Write — schema design, migrations, query optimization |
| Docs Writer | `@docs-writer` | Read/Write docs — READMEs, API docs, ADRs, changelogs |
| CTO | `@cto` | Read-only — executive oversight, org health |
| Output Validator | `@output-validator` | Read-only — validates agent output quality |

## Hook Registration
- Root hooks (9): pre-tool-use, scope-guard, version-check, branch-conflict-check, branch-naming-check, post-tool-use, doc-drift-check, stop, pre-compact
- Template hooks (18): session-start, drift-detector, protect-files, gatekeeper-check, validate-bash, context-monitor, audit-logger, test-results-parser, post-edit-format, track-file-changes, tool-failure-tracker, pre-compact-save, post-compact-recovery, notify-approval, subagent-tracker, execution-report, prompt-stats, stop-failure-handler

## Enterprise Role Registry (RBAC)

All team members MUST run `/setup-workspace` on first session to set their role.
Role is stored in `.claude/session.env` as `CURRENT_ROLE=<role>`.

### PRE-WRITE RULE (ALL ROLES)
Before creating any new file, function, class, or component:
1. Search codebase for existing similar implementation
2. Read /docs/patterns/ for existing pattern
3. Check /docs/GLOSSARY.md for existing entity name
4. If similar exists: EXTEND or REUSE — never duplicate
5. Read /docs/STANDARDS.md before writing any code. Match exactly.

### ROLE: CTO / VP Engineering
- **Permissions:** Full audit, framework upgrades via PR only
- **Owns:** CLAUDE.md, /docs/strategy/, /docs/adr/ approval
- **Commands:** /audit-system, /org-report, /sync --full-rescan, /progress-report executive
- **Agents:** @team-lead, @architect, @gatekeeper, @process-coach
- **Cannot:** Commit to main directly, bypass PR on CLAUDE.md

### ROLE: Architect
- **Permissions:** Read-only docs, approve architecture PRs
- **Owns:** /docs/ARCHITECTURE.md, /docs/adr/
- **Commands:** /architecture, /design-review, /dependency-check, /impact-analysis
- **Agents:** @architect, @code-quality, @security, @explorer
- **Cannot:** Write feature code, modify hooks, bypass QA gate, deploy directly

### ROLE: Tech Lead
- **Permissions:** Approve CLAUDE.md PRs, define agents, modify hooks via PR
- **Owns:** .claude/agents/, .claude/hooks/, /docs/adr/
- **Commands:** /architecture, /design-review, /dependency-check, /impact-analysis, /org-report
- **Agents:** @team-lead, @architect, @code-quality, @security, @explorer
- **Cannot:** Write feature code, bypass QA gate, deploy directly

### ROLE: Backend Dev
- **Permissions:** Feature branches only — src/api/, src/services/, src/db/, src/models/, tests/api/, tests/services/, tests/db/, migrations/
- **Commands:** /add-endpoint, /api-test, /fix-bug, /migrate
- **Agents:** @api-builder, @debugger, @tester, @database
- **Cannot:** Touch src/ui/, modify hooks, merge without QA gate

### ROLE: Frontend Dev
- **Permissions:** Feature branches only — src/ui/, src/components/, src/styles/, src/pages/
- **Commands:** /add-component, /add-page, /e2e-browser, /visual-regression
- **Agents:** @frontend, @debugger, @tester, @ux-designer
- **Cannot:** Touch src/api/, src/services/, modify hooks

### ROLE: Full Stack Dev
- **Permissions:** src/ full access, feature branches only
- **Commands:** All dev commands + /impact-analysis, /api-test, /e2e-browser
- **Agents:** @api-builder, @frontend, @debugger, @tester, @database
- **Cannot:** Modify hooks, merge without QA gate, touch /infra/
- **Extra:** Must file ADR for any cross-layer architectural change

### ROLE: QA / SDET
- **Permissions:** tests/ full, src/ read-only
- **Commands:** /qa-plan, /e2e-browser, /e2e-mobile, /api-test, /coverage-track, /load-test
- **Agents:** @qa-lead, @tester, @qa-automation, @gatekeeper
- **Cannot:** Merge PRs, modify source code, touch /infra/, touch hooks
- **QA Gate Output:** { pass: bool, coverage_pct, failures[], gaps[] }

### ROLE: DevOps / Platform
- **Permissions:** infra/, .github/, scripts/, Dockerfile, docker-compose.yml
- **Commands:** /deploy, /infrastructure-audit, /cicd-audit, /incident-readiness
- **Agents:** @infra, @security, @gatekeeper
- **Cannot:** Touch src/, approve feature PRs, modify CLAUDE.md
- **Owns:** .claude/CLAUDE.ci.md for headless pipeline sessions

### ROLE: Product Owner / PM
- **Permissions:** READ docs/, TODO.md, MEMORY.md summary | WRITE docs/requirements/
- **Commands:** /product-spec, /feature-map, /progress-report, /clarify, /brainstorm
- **Agents:** @product-owner, @strategist, @ideator
- **Cannot:** Run code agents, touch source files, modify hooks, read raw AUDIT_LOG

### ROLE: Designer / UX
- **Permissions:** src/styles/ full, src/ui/ + src/components/ READ, docs/design/ WRITE
- **Commands:** /design-review, /accessibility-audit, /visual-regression
- **Agents:** @ux-designer, @frontend (read-only), @code-quality
- **Cannot:** Run build commands, modify logic files, touch src/api/, touch hooks

## Keeping In Sync
- `/sync --check` — detect drift (weekly) | `/sync --fix` — auto-repair | `/sync --full-rescan` — regenerate all
- Drift detector runs automatically on every session start

## New Project (Idea to Launch)
- `/new-project "idea"` — full pre-dev pipeline (brainstorm -> spec -> features -> domain -> tech -> architecture -> scaffold -> env -> launch)
- `/new-project "idea" --from-docs "path"` — import existing documents, skip populated phases
- `/idea-to-launch "idea"` — full automation from concept to deployed product
- `/import-docs "path"` — scan PRDs, requirements, business plans into project files
- `/domain-model` — extract domain entities, glossary, bounded contexts, business rules
- `/mvp-kickoff next` — start next MVP feature (auto-selects, enforces dependencies, injects context)
- `/mvp-status` — MVP progress dashboard (features, quality, launch readiness)
- `/launch-mvp` — final launch (integration tests, checklist, deploy, monitor)
- `/clarify` — Q&A session to clear requirement doubts, ambiguities, gaps (works for new + existing projects)
- `/brainstorm`, `/product-spec`, `/feature-map`, `/tech-stack`, `/architecture`, `/scaffold`, `/deploy-strategy` — individual phases

## WORK SCOPE Rules
- Never work outside your CURRENT_ROLE's permitted paths (enforced by scope-guard hook)
- Never create duplicate code — search first, extend existing implementations
- Never skip QA gate before merge — all roles must pass quality checks
- Always check GLOSSARY.md before naming entities — use exact canonical terms

## PROMPT
All tool calls pass through the prompt pipeline (pre-tool-use hook + `/prompt` skill):
- **Automated (pre-tool-use hook):** 5-pass scoring on every mutating tool call — specificity, role alignment, domain/GLOSSARY, memory context, risk assessment. Strong prompts pass through. Weak prompts flagged with warnings. Destructive actions auto-flagged with checkpoint.
- **Manual (`/prompt` skill):** Full 5-pass improvement with GLOSSARY terms, STANDARDS rules, MEMORY context. Requires user approval (A/B/C/D) before execution. Cancelled prompts logged to audit.
- **Gating:** Destructive actions auto-flagged; role violations detected; scope violations blocked; `/prompt` for deep improvement

## Real Environment Testing
`/e2e-browser`, `/e2e-mobile`, `/api-test`, `/load-test`, `/visual-regression`, `/coverage-track`

## Audit & Compliance
`/accessibility-audit`, `/privacy-audit`, `/performance-audit`, `/infrastructure-audit`, `/license-audit`, `/docs-audit`, `/cicd-audit`, `/incident-readiness`

## Team Workflow
`/setup-workspace`, `/daily-sync`, `/feature-start`, `/workflow new "task"`, `/feature-done`, `/task-tracker status`, `/org-report` — See `.claude/docs/commands-template.md` for full reference

