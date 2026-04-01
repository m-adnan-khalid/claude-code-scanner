---
name: cost-estimate
description: >
  Estimate infrastructure and operational costs based on current architecture,
  tech stack, and scale projections. Tracks cost changes as features are added.
  Use during planning or when scope changes impact infrastructure.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--current | --projected | --optimize | --compare]'
effort: medium
roles: [CTO, TechLead, Architect, PM, DevOps]
agents: [@infra, @architect, @strategist]
---

**Lifecycle: T3 (planning/docs) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior planning outputs
3. **Git state:** Run `git status`, `git branch` → get branch
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **Project docs:** Scan `.claude/project/` for existing planning docs to avoid duplication

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# /cost-estimate — Infrastructure Cost Estimation

## Usage
```
/cost-estimate                    # Current estimated costs
/cost-estimate --projected 10k    # Projected costs at 10k users
/cost-estimate --optimize         # Suggest cost optimizations
/cost-estimate --compare          # Compare current vs initial estimate
```

## Process

### Step 1: Gather Context
```
Read:
- .claude/project/TECH_STACK.md — hosting, database, services chosen
- .claude/project/ARCHITECTURE.md — system components, scale notes
- .claude/project/DEPLOY_STRATEGY.md — existing cost estimates
- .claude/project/BACKLOG.md — feature count and complexity
```

### Step 2: Estimate by Component

Spawn @infra:
```
Based on the architecture and tech stack, estimate monthly costs:

| Component | Service | Tier | Monthly Cost | Scale Trigger |
|-----------|---------|------|-------------|---------------|
| API Server | {hosting} | {tier} | ${N}/mo | >{N} req/sec |
| Database | {service} | {tier} | ${N}/mo | >{N}GB data |
| Frontend/CDN | {service} | {tier} | ${N}/mo | >{N}GB bandwidth |
| File Storage | {service} | {tier} | ${N}/mo | >{N}GB stored |
| Email/Notifications | {service} | {tier} | ${N}/mo | >{N} emails/mo |
| Monitoring | {service} | {tier} | ${N}/mo | — |
| CI/CD | {service} | {tier} | ${N}/mo | >{N} builds/mo |
| Domain/SSL | {registrar} | — | ${N}/yr | — |
| **TOTAL** | | | **${N}/mo** | |

Growth projection:
| Users | API Server | Database | Storage | Total/mo |
|-------|-----------|----------|---------|----------|
| 100 | $X | $X | $X | $X |
| 1,000 | $X | $X | $X | $X |
| 10,000 | $X | $X | $X | $X |
| 100,000 | $X | $X | $X | $X |
```

### Step 3: Optimization Suggestions (--optimize)
```
For each component, suggest:
- Cheaper alternatives (same capability)
- Reserved/committed pricing (if predictable load)
- Caching strategies (reduce DB/API costs)
- CDN optimization (reduce bandwidth costs)
- Serverless opportunities (pay-per-use vs always-on)
```

### Step 4: Compare (--compare)
```
Show delta between initial estimate (from DEPLOY_STRATEGY.md) and current:

| Component | Initial | Current | Delta | Reason |
|-----------|---------|---------|-------|--------|
| API | $50 | $100 | +$50 | Added 3 more features |

Total: ${initial}/mo → ${current}/mo ({+/-}${delta}/mo)
```

## Outputs
- Cost estimate displayed to user
- Updated `.claude/project/DEPLOY_STRATEGY.md` cost section (if --update flag)

## Definition of Done
- Infrastructure costs estimated per environment, monthly projections calculated, cost drivers identified.

## Next Steps
- `/deploy-strategy` to incorporate, `/architecture` if cost too high.

## Rollback
- `/cost-estimate --update` with revised parameters.

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [what was planned/documented]
- **When:** [timestamp]
- **Result:** [document created/updated]
- **Output:** [file path of output document]
- **Next Step:** [recommended next planning phase or implementation step]

### Update TODO
If this planning output creates actionable work, add items to TODO.md.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Planning complete. Here's what you can do:
             - Review output at the generated file path
             - Run the next planning phase command
             - Say "/scaffold" or "/feature-start" to begin implementation
```
