# Enhanced Domain Glossary

**Owner:** Tech Lead + Architect
**Last Updated:** 2026-04-01
**Story:** STORY-004
**Supersedes:** docs/GLOSSARY.md (13 terms) — this version adds 19 terms from architecture, standards, and CLAUDE.md analysis.

---

All team members MUST check this before naming any entity, route, event, or variable.
Use exact terms. Never synonym. Add new terms via PR with Tech Lead approval.

---

## Terms (32 total)

| Term | Definition | Source | Confidence | Used In |
|------|-----------|--------|------------|---------|
| User | Authenticated person interacting with the system | docs/GLOSSARY.md | HIGH | `User` model, `users` table, `/api/users`, RBAC Context |
| Session | Authenticated user context with expiry; stores CURRENT_ROLE in session.env | docs/GLOSSARY.md | HIGH | `Session` model, `sessions` table, `.claude/session.env` |
| Agent | Claude Code subagent with specific role and tool access (25 defined) | docs/GLOSSARY.md | HIGH | `.claude/agents/*.md`, all bounded contexts |
| Skill | Claude Code workflow automation invoked as a slash command (86 defined) | docs/GLOSSARY.md | HIGH | `.claude/skills/*/SKILL.md`, Runtime Context |
| Hook | Pre/Post tool-use automation script running in isolated subprocess (27 total: 9 root + 18 template) | docs/GLOSSARY.md | HIGH | `.claude/hooks/*.js`, Hook Runtime, settings.json |
| Rule | Path-scoped coding constraint for Claude Code (8 defined) | docs/GLOSSARY.md | HIGH | `.claude/rules/*.md`, Agent constraints |
| Task | SDLC workflow unit tracked in .claude/tasks/ with status and assignee | docs/GLOSSARY.md | HIGH | `.claude/tasks/task-XXXX.md`, Task Tracker |
| Role | Enterprise team role (10 roles: CTO, Architect, Tech Lead, Backend Dev, Frontend Dev, Full Stack Dev, QA/SDET, DevOps, PM, Designer) | docs/GLOSSARY.md | HIGH | `CURRENT_ROLE` in session.env, RBAC enforcement |
| RBAC | Role-Based Access Control — governs who can do what via path-scoped permissions | docs/GLOSSARY.md | HIGH | CLAUDE.md Enterprise Role Registry, Scope Guard |
| ADR | Architecture Decision Record documenting context, decision, and consequences | docs/GLOSSARY.md | HIGH | `docs/adr/YYYY-MM-DD-slug.md` |
| QA Gate | Quality gate that must pass before PR merge; outputs `{ pass, coverage_pct, failures[], gaps[] }` | docs/GLOSSARY.md | HIGH | Feature workflow, RBAC enforcement, PR merge |
| Tech Manifest | Output of /scan-codebase — tech stack fingerprint as JSON consumed by Generator | docs/GLOSSARY.md | HIGH | `.claude/project/TECH_MANIFEST.md`, Scanner -> Generator data flow |
| Handoff | Structured output block (`HANDOFF:`) when an agent completes work and transfers context | docs/GLOSSARY.md | HIGH | Agent output, task completion |
| Pipeline | The 4-phase execution sequence: Scan -> Generate -> Validate -> Setup Smithery | CLAUDE.md | HIGH | Core execution flow, Scanner + Generator + Validator + Smithery |
| Workflow | A multi-step SDLC process; the full idea-to-launch pipeline spans 13 phases | CLAUDE.md | HIGH | `/workflow`, `/new-project`, `/idea-to-launch` |
| Context Budget | Resource limits: CLAUDE.md max 200 lines, startup context < 20%, working context < 60%, max 5 MCP servers | CLAUDE.md | HIGH | `/context-check`, settings validation, Validator Service |
| Drift Detection | Automated checking of CLAUDE.md version and configuration consistency; runs on session start | docs/ARCHITECTURE.md | HIGH | `drift-detector` hook, `/sync --check`, `/sync --fix` |
| Execution Report | Structured output summarizing actions performed during a session or task | CLAUDE.md | MEDIUM | `execution-report` hook, session end |
| Scanner | Stateless service that fingerprints a target codebase via 6 parallel agents; emits TECH_MANIFEST | docs/ARCHITECTURE.md | HIGH | Scanner Context, `/scan-codebase` skill |
| Generator | Service that consumes TECH_MANIFEST, resolves all placeholders, and writes Claude Code artifacts | docs/ARCHITECTURE.md | HIGH | Generator Context, `/generate-environment` skill |
| Validator | Read-only verification service checking generated output quality (line counts, JSON validity, hook permissions) | docs/ARCHITECTURE.md | HIGH | `/validate-setup` skill, Pipeline phase 3 |
| Smithery | Network-dependent service that queries MCP registry and installs matching servers based on tech stack | docs/ARCHITECTURE.md | HIGH | `/setup-smithery` skill, Pipeline phase 4 |
| Hook Runtime | Event-driven execution layer where each hook runs in its own subprocess with scoped env vars; no shared state | docs/ARCHITECTURE.md | HIGH | Runtime Context, all hook execution |
| Placeholder | Template variable in `{name}` format resolved from TECH_MANIFEST values during artifact generation | docs/ARCHITECTURE.md | MEDIUM | Generator Service, template files |
| Audit Log | Branch-scoped structured log for enterprise governance; records governed actions | docs/ARCHITECTURE.md | HIGH | `audit-logger` hook, enterprise governance |
| Scope Guard | Hook that enforces RBAC path restrictions by blocking writes outside a role's permitted paths | CLAUDE.md (hook: scope-guard) | [INFERRED] MEDIUM | `scope-guard` hook, RBAC Context, all mutating operations |
| Prompt Pipeline | 5-pass scoring system on mutating tool calls: specificity, role alignment, domain/GLOSSARY, memory context, risk assessment | CLAUDE.md | HIGH | `pre-tool-use` hook, `/prompt` skill |
| Bounded Context | Logical boundary separating domain concerns (Scanner, Generator, Runtime, RBAC) | docs/ARCHITECTURE.md | [INFERRED] MEDIUM | Domain model, service boundaries |
| MCP Server | Model Context Protocol server providing tool capabilities; max 5, scoped to agents via `mcpServers:` field | CLAUDE.md | MEDIUM | Smithery Service, settings.json, agent configuration |
| Settings | JSON configuration (settings.json) governing permissions, hooks, and MCP server bindings | docs/ARCHITECTURE.md | HIGH | `.claude/settings.json`, Generator output |
| Domain Event | A significant occurrence in the system lifecycle that triggers downstream processing (e.g., codebase.scanned, environment.generated) | docs/ARCHITECTURE.md (Data Flow) | [INFERRED] MEDIUM | Event-driven hooks, Pipeline transitions |
| Template Layer | The `/template/` directory containing generated output artifacts (agents, hooks, skills, rules, settings) delivered to end users | docs/ARCHITECTURE.md | HIGH | `/template/` directory, Generator output |
| Root Layer | The `/` directory containing scanner tools, framework config, CI hooks, and project-level CLAUDE.md | docs/ARCHITECTURE.md | HIGH | Root directory, scanner pipeline |

---

## Confidence Legend

| Level | Meaning |
|-------|---------|
| HIGH | Explicitly defined in source document with clear definition |
| MEDIUM | Referenced in source documents, definition synthesized from usage context |
| [INFERRED] | Not explicitly named in source documents; derived from patterns and architecture analysis |

---

## Adding New Terms
1. Submit PR adding term to this table
2. Requires Tech Lead approval
3. Update all code references to use the canonical term
4. Update `docs/GLOSSARY.md` root copy to stay in sync
5. Mark Source and Confidence for traceability
