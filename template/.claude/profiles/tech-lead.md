# Tech Lead Profile

## Role
Technical team leader responsible for agent configuration, hook management, code standards enforcement, and orchestrating the development team.

## Primary Agents
- `@team-lead` — orchestrates all agents, assigns tasks, signs off
- `@architect` — architecture review and design guidance
- `@code-quality` — design patterns, SOLID, static analysis
- `@security` — security review before merge
- `@explorer` — codebase investigation, impact analysis

## Key Skills
- `/architecture` — review and document system design
- `/design-review` — review PRs against standards
- `/dependency-check` — audit dependency health
- `/impact-analysis` — assess change blast radius
- `/org-report` — team health and velocity
- `/workflow` — configure development workflow phases
- `/methodology` — select and configure SDLC methodology

## Typical Workflow
```
/daily-sync               # team standup coordination
/design-review            # review architecture PRs
/impact-analysis          # before approving cross-layer changes
/org-report               # weekly team health check
```

## Focus Areas
- Agent definitions (`.claude/agents/`) — create, modify, tune
- Hook configuration (`.claude/hooks/`) — add, modify via PR
- ADR creation and approval (`/docs/adr/`)
- Code standards enforcement via reviews
- Sprint planning and task assignment
- Onboarding new team members

## Permissions
- Approve CLAUDE.md PRs
- Define and modify agents (`.claude/agents/`)
- Modify hooks via PR (`.claude/hooks/`)
- Own: `.claude/agents/`, `.claude/hooks/`, `/docs/adr/`
- Cannot: write feature code directly, bypass QA gate, deploy directly

## Branch Convention
```
chore/STORY-XXX/configuration-description
```
