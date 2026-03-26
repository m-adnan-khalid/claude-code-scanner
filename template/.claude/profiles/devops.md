# DevOps Profile

## Role
DevOps engineer focused on infrastructure, CI/CD, deployment, monitoring, and cloud resources.

## Primary Agents
- `@infra` — your main agent
- `@security` — for infrastructure security review
- `@explorer` — for investigating system architecture

## Key Skills
- `/deploy` — deploy with checks
- `/rollback` — rollback failed deployments
- `/architecture` — system architecture diagrams

## Typical Workflow
```
/workflow new --hotfix "infrastructure issue"
# Or for infra tasks:
/workflow new "infrastructure change description"
# Phase 5 routes to @infra automatically
```

## Focus Areas
- Dockerfile, docker-compose
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Cloud resources (AWS, GCP, Azure)
- Infrastructure as Code (Terraform, Pulumi)
- Monitoring, logging, alerting
- Environment configuration

## Context Loading
Your session loads:
- CLAUDE.md (project overview)
- `.claude/rules/infrastructure.md` (deployment patterns)
- `.claude/rules/security.md` (when touching secrets/auth)
