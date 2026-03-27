---
name: deploy-strategy
description: >
  Deployment and launch strategy planning. Designs CI/CD pipelines, hosting setup,
  environment strategy, monitoring, and pre-launch checklist.
  Trigger: after scaffolding and environment setup, or when user needs deployment planning.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-architecture | "deployment requirements"]'
effort: high
---

# /deploy-strategy — Deployment & Launch Planning

## Overview
Create a complete deployment and launch strategy including hosting, CI/CD pipelines,
environment management, monitoring, and pre-launch checklists.

## Usage
```
/deploy-strategy                       # Auto-reads from project docs
/deploy-strategy --from-architecture   # Explicitly read from architecture
/deploy-strategy "deploy to AWS ECS"   # Specific deployment target
/deploy-strategy --update              # Revise existing strategy
```

## Process

### Step 1: Gather Context
- Read `.claude/project/ARCHITECTURE.md` for system components
- Read `.claude/project/TECH_STACK.md` for hosting and CI/CD choices
- Read `.claude/project/PRODUCT_SPEC.md` for constraints (budget, timeline)
- If `--update`: read existing `.claude/project/DEPLOY_STRATEGY.md`

### Step 2: Invoke @infra

```
Read all project documents:
- .claude/project/ARCHITECTURE.md
- .claude/project/TECH_STACK.md
- .claude/project/PRODUCT_SPEC.md

Create a complete Deployment Strategy:

1. ENVIRONMENTS
   - Define: development (local), staging, production
   - For each: URL pattern, branch mapping, auto-deploy rules
   - Environment variable management (how secrets are stored/rotated)

2. HOSTING PLAN
   - For each component (API, DB, frontend, workers, storage):
     - Platform choice with rationale
     - Region selection
     - Tier/size (start small, scale plan)
     - Estimated monthly cost
   - Total cost estimate with growth projections

3. CI/CD PIPELINE
   - Mermaid diagram of the pipeline
   - Step-by-step: lint → test → build → deploy → smoke test → monitor
   - Branch strategy: feature → develop → staging auto-deploy, main → production
   - Required checks before merge (test pass, review approved, CI green)

4. MONITORING & ALERTING
   - What to monitor: error rate, latency (p50/p95/p99), CPU/memory, disk
   - Tools recommendation (matches tech stack)
   - Alert thresholds and notification channels
   - On-call / escalation path (if applicable)

5. DOMAIN & DNS
   - Domain setup: apex, www, api subdomain
   - SSL/TLS: auto-provisioned vs manual
   - CDN configuration (if frontend)

6. ROLLBACK PLAN
   - Automated: health check failure → auto-rollback
   - Manual: specific commands to rollback
   - Database: migration rollback strategy (forward-only vs bidirectional)

7. SECURITY CHECKLIST (Pre-Launch)
   - HTTPS, CORS, rate limiting, headers, secrets management, dependency scanning, logging

8. LAUNCH CHECKLIST
   - Complete pre-launch verification list
   - Staged rollout plan (if applicable): canary → 10% → 50% → 100%

Write output to .claude/project/DEPLOY_STRATEGY.md
```

### Step 3: Validate Strategy
- Verify hosting choices support the tech stack
- Verify CI/CD pipeline covers all stages (lint, test, build, deploy)
- Verify monitoring covers critical metrics
- Verify rollback plan exists
- Verify cost estimate is reasonable for project constraints

### Step 4: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `PLANNING`
  - Set Deploy Strategy document status to `COMPLETE`
  - Set Phase 8 status to `COMPLETE` with timestamp

### Step 5: Present to User
Show:
- Hosting summary with cost estimate
- CI/CD pipeline overview
- Environment table
- Launch checklist item count
- Prompt: "Deployment strategy complete. Your project is ready for development! Run `/workflow new 'Feature 1'` to start building the first MVP feature."

## Outputs
- `.claude/project/DEPLOY_STRATEGY.md` — complete deployment strategy
- `.claude/project/PROJECT.md` — updated with Phase 8 status

## Prerequisites
- `.claude/project/ARCHITECTURE.md` must exist
- `.claude/project/TECH_STACK.md` must exist

## Next Step
`/workflow new "Feature description"` — start building MVP features using the 13-phase SDLC
