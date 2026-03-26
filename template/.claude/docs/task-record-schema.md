# Task Record Schema

## File: `.claude/tasks/TASK-{id}.md`

### Frontmatter
```yaml
---
id: TASK-{number}
title: {title}
type: feature | bugfix | refactor | hotfix | tech-debt | spike
scope: frontend-only | backend-only | fullstack | infrastructure | cross-cutting
complexity: small | medium | large
priority: P0-critical | P1-high | P2-medium | P3-low
status: {state — see State Machine below}
branch: {branch name}
pr: {PR number or "pending"}
assigned-to: {agent name or "unassigned"}
depends-on: {TASK-id or "none"}
created: {ISO timestamp}
updated: {ISO timestamp}
---
```

### Current Status Section
- Phase, state, progress %, last activity, next action, blocked Y/N

### Loop State Section
Track all active correspondence loops to survive compaction:
```markdown
## Loop State

### Dev-Test Loop (Phase 6)
- dev-test-loop: iteration N/5
- coverage-baseline: N%
- coverage-current: N%
- fix-agent: @debugger|@api-builder|@frontend|@infra
- last-failure: [test name] — [error] at [ISO timestamp]

### Review-Rework Loop (Phase 7)
- review-loop: iteration N/3
- reviewer-status: APPROVE | REQUEST_CHANGES (N critical, M suggestions)
- security-status: APPROVE | REQUEST_CHANGES (N findings)
- open-comments: [count] critical, [count] suggestions
- addressed-comments: [count] fixed, [count] won't-fix

### CI Fix Loop (Phase 8)
- ci-fix-loop: iteration N/3
- last-ci-failure: [check name] — [error] at [ISO timestamp]
- fix-agent: @debugger|@api-builder|@frontend|@infra|@tester

### QA Bug Loop (Phase 9)
- qa-bug-loop:
  - BUG-{id}-1 (P1): iteration N/3 — [OPEN|FIXED|VERIFIED|REOPENED]
  - BUG-{id}-2 (P3): known-issue
- total-bugs: N found, M fixed, K verified, J known-issues
- regression-check-after-each-fix: true

### Sign-off Rejection Loop (Phase 10)
- signoff-rejection-cycle: N/2
- qa-signoff: APPROVED|CONDITIONAL|REJECTED|PENDING
- biz-signoff: APPROVED|REJECTED|PENDING
- tech-signoff: APPROVED|REJECTED|PENDING
- last-rejection: [who] — [reason] at [ISO timestamp]

### Deploy Loop (Phase 11)
- deploy-loop: iteration N/2
- last-deploy-failure: [error type] — [summary] at [ISO timestamp]
- rollback-executed: true|false
```

### Loop Counter Reset Rules
| Event | Counters That Reset |
|-------|-------------------|
| Phase 10 rejects -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| Phase 10 rejects -> Phase 4 or 3 | ALL loop counters reset to 0 |
| Deploy fails -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| Normal phase advance | Counters preserved for reporting |
| Agent timeout in loop | Counts as +1 to current loop iteration |
| ON_HOLD -> resume | ALL loop counters preserved (no reset) |

## Task State Machine
```
Forward flow:
BACKLOG -> INTAKE -> ANALYZING -> DESIGNING -> APPROVED -> DEVELOPING
  -> DEV_TESTING -> REVIEWING -> CI_PENDING -> QA_TESTING
  -> QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF
  -> DEPLOYING -> MONITORING -> CLOSED

Phase-to-state mapping:
  Phase 1  = INTAKE
  Phase 2  = ANALYZING
  Phase 3  = DESIGNING
  Phase 4  = APPROVED (after user confirms)
  Phase 5  = DEVELOPING
  Phase 6  = DEV_TESTING
  Phase 7  = REVIEWING
  Phase 8  = CI_PENDING
  Phase 9  = QA_TESTING
  Phase 10 = QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF
  Phase 11 = DEPLOYING
  Phase 12 = MONITORING
  Phase 13 = CLOSED (after final report)

Special states (from ANY active state):
  -> BLOCKED (waiting on depends-on or manual unblock)
  -> ON_HOLD (deferred by user/product-owner, resume with /workflow resume)
  -> CANCELLED (terminal, cleanup executed)

Reverse transitions (rejection routing):
  QA_SIGNOFF -> DEVELOPING (QA rejects: bugs)
  BIZ_SIGNOFF -> APPROVED (reqs wrong) or DEVELOPING (UI wrong)
  TECH_SIGNOFF -> DESIGNING (architecture) or DEVELOPING (perf/tests)
  DEPLOYING -> DEVELOPING (code bug) or DEPLOYING (config retry)

Circuit breaker -> escalated to user (stays in current state until resolved)
```

### Timeline Section
Every event: timestamp, phase, event description, agent/actor, duration

### Handoff Log
Track every agent-to-agent handoff:
```markdown
## Handoff Log
| Timestamp | From | To | Reason | Artifacts | Status |
|-----------|------|-----|--------|-----------|--------|
| 2026-03-26T10:00:00Z | @explorer | @team-lead | impact analysis complete | scan-results.md | complete |
| 2026-03-26T10:05:00Z | @team-lead | @api-builder | backend dev assigned | TASK-001.md | complete |
```

### Phase Detail Sections (1-13)
Each phase records specific outputs:
- **Phase 1:** type, scope, complexity, branch name, task record created
- **Phase 2:** files affected, blast radius, test coverage %, security flags, risk level
- **Phase 3:** approach chosen, alternatives rejected, files to create/modify, breaking changes
- **Phase 4:** acceptance criteria list with PENDING/VERIFIED/FAILED status
- **Phase 5:** agents active, files created/modified, lines +/-, tests written, sub-phase status
- **Phase 6:** unit/integration/e2e results, coverage delta, bugs found/fixed, retry count
- **Phase 7:** review result, critical issues, suggestions, security review, iteration count
- **Phase 8:** PR number/URL, CI check results, fix iterations
- **Phase 9:** scenario results (happy/edge/regression/perf/security/a11y), issues found
- **Phase 10:** QA/business/tech sign-off status with who/when/conditions
- **Phase 11:** target env, pre-checks, deploy method, health check, rollback needed
- **Phase 12:** monitoring duration, error rate, latency impact, issues closed

### Blocker Log
| Timestamp | Blocker | Severity | Owner | Resolved | Resolution |

### Decision Log
| Timestamp | Decision | Rationale | Made By | Reversible |

### Risk Register
| Risk | Likelihood | Impact | Mitigation | Status |

### Execution Report Section
Per-phase and cumulative execution analytics:
```markdown
## Execution Reports
| Phase | Score | Hallucination | Regression | Tokens | Agents | Handoffs |
|-------|-------|---------------|------------|--------|--------|----------|
| 2 | 85/100 | 0 (CLEAN) | 0 (CLEAN) | ~12k | 2 | 3 |
| 5 | 72/100 | 1 (MINOR) | 0 (CLEAN) | ~45k | 4 | 8 |
| 6 | 90/100 | 0 (CLEAN) | 0 (CLEAN) | ~18k | 2 | 4 |
| ... | | | | | | |
| **TOTAL** | **82/100** | **1** | **0** | **~120k** | **8** | **24** |

### Bottleneck Analysis
- Slowest phase: Phase 5 (Development) — 45k tokens, 4 agents
- Most rework: Phase 7 (Review) — 2 iterations
- Highest context: Phase 5 — peaked at 58%

### Lessons Learned
- {Actionable insight for next time}
```

Full execution reports saved to: `.claude/reports/executions/TASK-{id}_phase-{N}_{timestamp}.md`
Cumulative report saved to: `.claude/reports/executions/TASK-{id}_final.md`

## Bug Record Format
```
BUG-{task_id}-{number}
Severity: P0-P4
Summary, Steps to Reproduce, Expected/Actual, Evidence
Assigned: @agent-name
Status: OPEN -> IN_PROGRESS -> FIXED -> QA_VERIFY -> VERIFIED/REOPENED -> CLOSED
```

## Directory Structure
```
.claude/tasks/TASK-001.md
.claude/tasks/TASK-001_changes.log
.claude/reports/daily/{date}.md
.claude/reports/weekly/{week}.md
.claude/reports/executions/TASK-001_phase-2_2026-03-26T100000Z.md
.claude/reports/executions/TASK-001_final.md
```
