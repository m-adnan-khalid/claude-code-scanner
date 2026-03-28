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
