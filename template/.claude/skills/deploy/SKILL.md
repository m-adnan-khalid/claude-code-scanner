---
name: deploy
description: Deploy to staging or production — run pre-deploy checks, execute deployment, verify health, monitor.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[staging|production] [--dry-run] [--rollback]"
---

# Deploy: $ARGUMENTS

## Process
1. Pre-deploy checks: all tests pass, sign-offs complete, no open blockers
2. Invoke @infra for deployment execution
3. Run health checks after deployment
4. Monitor for 5 minutes (error rates, latency)
5. If issues detected: auto-rollback and notify

## Safety
- Production deploys require explicit user confirmation
- Always deploy to staging first
- Keep rollback plan ready

## Definition of Done
- [ ] Deployment successful (no errors during deploy process)
- [ ] Health check endpoints return 200 OK
- [ ] Monitoring green for 5 minutes (error rates, latency, CPU/memory)
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/execution-report` — generate post-deployment analytics
- **Post-deploy validation:** `/logging-audit` — verify observability coverage, `/incident-readiness` — verify DR readiness
- **Issues found:** `/rollback deploy` — revert to previous stable version
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `/rollback deploy TASK-{id}` — automated rollback to previous deployment
- **Revert to previous state:** `git revert <deploy-commit>` and trigger redeployment pipeline
