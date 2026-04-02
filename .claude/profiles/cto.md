# CTO / VP Engineering Profile

## Role
Executive technical leader responsible for framework integrity, governance, organizational health, and strategic direction.

## Primary Agents
- `@cto` — executive oversight, org health assessment
- `@team-lead` — orchestrates agents, assigns work, signs off
- `@architect` — reviews architecture decisions
- `@gatekeeper` — auto-approve/block changes, regression detection

## Key Skills
- `/audit-system` — full 7-phase system audit
- `/org-report` — organizational health dashboard
- `/sync --full-rescan` — regenerate all artifacts
- `/progress-report executive` — executive summary
- `/architecture` — review system design
- `/impact-analysis` — assess change blast radius
- `/incident-readiness` — verify incident response plans

## Typical Workflow
```
/audit-system             # verify environment health
/org-report               # team productivity overview
/progress-report executive # status for stakeholders
```

## Focus Areas
- Framework upgrades (via PR only, never direct commit to main)
- CLAUDE.md ownership and version governance
- ADR approval and architecture sign-off
- Strategy documents and roadmap oversight
- Team process and methodology selection

## Permissions
- Full audit access across all files
- Read access to all source code and docs
- Write access to `/docs/strategy/`, `/docs/adr/` approval
- Cannot: commit to main directly, bypass PR on CLAUDE.md

## Branch Convention
```
cto/STORY-XXX/description
```
