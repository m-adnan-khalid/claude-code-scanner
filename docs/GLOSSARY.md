# Domain Glossary

All team members MUST check this before naming any entity, route, event, or variable.
Use exact terms. Never synonym. Add new terms via PR with Tech Lead approval.

| Term | Definition | Code Usage |
|------|-----------|------------|
| User | Authenticated person interacting with the system | `User` model, `users` table, `/api/users` |
| Session | Authenticated user context with expiry | `Session` model, `sessions` table |
| Agent | Claude Code subagent with specific role and tool access | `.claude/agents/*.md` |
| Skill | Claude Code workflow automation (slash command) | `.claude/skills/*/SKILL.md` |
| Hook | Pre/Post tool-use automation script | `.claude/hooks/*.js` |
| Rule | Path-scoped coding rule for Claude Code | `.claude/rules/*.md` |
| Task | SDLC workflow unit tracked in .claude/tasks/ | `task-XXXX.md` |
| Role | Enterprise team role (CTO, Architect, Dev, QA, etc.) | `CURRENT_ROLE` in session.env |
| RBAC | Role-Based Access Control — governs who can do what | CLAUDE.md Enterprise Role Registry |
| ADR | Architecture Decision Record | `docs/adr/YYYY-MM-DD-slug.md` |
| QA Gate | Quality gate that must pass before PR merge | `{ pass, coverage_pct, failures[], gaps[] }` |
| Tech Manifest | Output of /scan-codebase — tech stack fingerprint | `.claude/project/TECH_MANIFEST.md` |
| Handoff | Structured output when agent completes work | `HANDOFF:` block in agent output |

## Adding New Terms
1. Submit PR adding term to this table
2. Requires Tech Lead approval
3. Update all code references to use the canonical term
