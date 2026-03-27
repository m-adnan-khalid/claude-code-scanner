---
name: setup-smithery
description: Install Smithery skills and MCP servers matching the project tech stack. Use after /generate-environment.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep
context: fork
---

# Setup Smithery: $ARGUMENTS

Read `.claude/scan-results.md` for tech stack. Install matching skills and MCP servers.

## Always Install
```bash
smithery skill add anthropics/skill-creator --agent claude-code
smithery skill add anthropics/frontend-design --agent claude-code
smithery skill add anthropics/webapp-testing --agent claude-code
smithery skill add anthropics/mcp-builder --agent claude-code
smithery skill add anthropics/pdf --agent claude-code
```

## Conditional on Tech Stack
- React/Expo → `smithery skill search "react"`, Expo skills
- shadcn/ui → shadcn skill
- Playwright → anthropics/webapp-testing
- Security code → Trail of Bits security skills
- Docker/K8s → `smithery skill search "docker kubernetes"`
- GitHub Actions → `smithery skill search "github actions"`

## MCP Servers (scope to agents, max 5)
- GitHub → @api-builder, @infra
- PostgreSQL/MongoDB → @api-builder
- Playwright → @frontend
- AWS/GCP → @infra
- Slack/Sentry → global (if used)

## After Install
Run `/context-check` to verify under 60%. Remove low-priority items if over budget.
