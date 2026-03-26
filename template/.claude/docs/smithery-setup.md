# Smithery Ecosystem Setup Reference

## Conditional Skill Installation

### Frontend
- React/Vue/Angular/Svelte → `smithery skill add anthropics/frontend-design`
- shadcn/ui → shadcn skill
- Expo/React Native → Expo skills

### Testing
- Playwright → `smithery skill add anthropics/webapp-testing`
- Cypress → `smithery skill search "cypress testing"`

### Security
- Auth/security code → Trail of Bits security skills

### DevOps
- Docker → `smithery skill search "docker devops"`
- Kubernetes → `smithery skill search "kubernetes yaml helm"`
- GitHub Actions → `smithery skill search "github actions"`

### Documents (always)
- anthropics/pdf, anthropics/docx, anthropics/pptx, anthropics/xlsx

### Meta
- anthropics/skill-creator, anthropics/mcp-builder

## MCP Server Connections (scope to agents, max 5)
| Service | Server | Scope To |
|---------|--------|----------|
| GitHub | github | @api-builder, @infra |
| PostgreSQL | postgres | @api-builder |
| MongoDB | mongodb | @api-builder |
| Redis | redis | @api-builder |
| Playwright | playwright | @frontend |
| AWS | aws | @infra |
| GCP | gcp | @infra |
| Slack | slack | global |
| Sentry | sentry | global |

## Context Budget After Smithery
Each skill: ~100 tokens metadata (startup) + ~5k active
Each MCP: ~200-2k tokens ALWAYS loaded

Run `/context-check` after setup. If startup > 20%, remove lowest-priority items.
Prefer skills over MCP when both can solve the problem.

## Community Libraries
- obra/superpowers — 20+ battle-tested skills (TDD, debugging, collaboration)
- Trail of Bits — Security skills (CodeQL, Semgrep)
- Expo — Mobile development skills
