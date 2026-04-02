# Domain Glossary

All team members MUST check this before naming any entity, route, event, or variable.
Use exact terms. Never synonym. Add new terms via PR with Tech Lead approval.

| Term | Definition | Code Usage | Informal Variants |
|------|-----------|------------|-------------------|
| User | Authenticated person interacting with the system | `User` model, `users` table, `/api/users` | — |
| Session | Authenticated user context with expiry | `Session` model, `sessions` table | — |
| Agent | Claude Code subagent with specific role and tool access | `.claude/agents/*.md` | subagent, bot, worker |
| Skill | Claude Code workflow automation (slash command) | `.claude/skills/*/SKILL.md` | plugin, command, extension |
| Hook | Pre/Post tool-use automation script | `.claude/hooks/*.js` | guard, middleware, interceptor |
| Rule | Path-scoped coding rule for Claude Code | `.claude/rules/*.md` | policy, constraint, guideline |
| Task | SDLC workflow unit tracked in .claude/tasks/ | `task-XXXX.md` | job, ticket, work item |
| Role | Enterprise team role (CTO, Architect, Dev, QA, etc.) | `CURRENT_ROLE` in session.env | permission, access level |
| RBAC | Role-Based Access Control — governs who can do what | CLAUDE.md Enterprise Role Registry | — |
| ADR | Architecture Decision Record | `docs/adr/YYYY-MM-DD-slug.md` | architecture decision |
| QA Gate | Quality gate that must pass before PR merge | `{ pass, coverage_pct, failures[], gaps[] }` | quality check |
| Tech Manifest | Output of /scan-codebase — tech stack fingerprint | `.claude/project/TECH_MANIFEST.md` | scan results |
| Handoff | Structured output when agent completes work | `HANDOFF:` block in agent output | transition, pass-off |
| Workflow | Full 14-phase SDLC lifecycle for feature development | `/workflow new "desc"` | pipeline, process |
| Profile | Developer role configuration with permitted agents | `.claude/profiles/*.md` | — |
| Story | User story or bug tracked in TASK_REGISTRY | `.claude/project/stories/STORY-*.md` | — |
| Loop State | Iteration counters and circuit breaker data for workflow loops | `## Loop State` in task files | — |
| Circuit Breaker | Max iteration limit that escalates to user when exceeded | `circuit-breaker: true/false` | — |

## Adding New Terms
1. Submit PR adding term to this table
2. Requires Tech Lead approval
3. Update all code references to use the canonical term
