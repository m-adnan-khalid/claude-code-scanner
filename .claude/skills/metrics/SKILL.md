---
name: metrics
description: Calculate aggregate task metrics — velocity, quality, cycle-time, agent performance. Use when asking about team performance or bottlenecks.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[velocity|quality|cycle-time|agents|blockers|all] [--period 7d|30d|90d]"
roles: [CTO, TechLead, PM, QA]
agents: [@team-lead, @qa-lead, @process-coach]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Metrics: $ARGUMENTS

Read all `.claude/tasks/*.md` and `.claude/project/PROJECT.md` to calculate:

### SDLC Metrics (from .claude/tasks/)
- **velocity** — tasks/week, throughput trend, WIP count
- **quality** — test pass rate, coverage trend, bug escape rate, deploy success rate, rollback frequency
- **cycle-time** — avg per phase, bottleneck detection, time in BLOCKED, review iteration count
- **agents** — tasks handled, avg duration, success rate, rework rate per agent
- **blockers** — total in period, avg resolution time, most common categories

### Full Lifecycle Metrics (from .claude/project/ + .claude/tasks/)
- **pre-dev-time** — total duration of 8 pre-dev phases (from PROJECT.md timestamps)
- **mvp-progress** — features complete/total, % done, estimated remaining effort
- **mvp-velocity** — features/week, time per feature by size (S/M/L)
- **clarification-cycles** — number of /clarify sessions, questions resolved per session
- **decision-count** — total decisions in Decision Log, decisions per phase
- **scope-changes** — features added/removed/re-prioritized during development
- **cross-feature-quality** — integration test pass rate, cross-feature bugs found

### Aggregation
- **all** — everything above combined
- If `.claude/project/PROJECT.md` doesn't exist, skip lifecycle metrics (backward compatible)

## Definition of Done
- All metrics calculated (velocity, quality, cycle-time), trends identified, bottlenecks flagged.

## Next Steps
- `/progress-report` to share, address bottleneck areas.

## Rollback
- N/A (read-only analysis).

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
