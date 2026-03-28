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
branch: {type}/TASK-{id}/{slug}
pr: {PR number or "pending"}
pr-url: {PR URL or "pending"}
merge-sha: {merge commit SHA or "pending"}
base-branch: {main or dev}
reviewer-1: {APPROVE or REQUEST_CHANGES or "pending"}
reviewer-2: {APPROVE or REQUEST_CHANGES or "pending"}
assigned-to: {agent name or "unassigned"}
depends-on: {TASK-id or "none"}
created: {ISO timestamp}
updated: {ISO timestamp}
---
```

### Current Status Section
- Phase, state, progress %, last activity, next action, blocked Y/N

### Subtask Decomposition (MANDATORY before Phase 5)
Every task must be broken into subtasks with clear owners:
```markdown
## Subtasks
| # | Subtask | Owner | Status | Phase | Depends-On | Completed |
|---|---------|-------|--------|-------|------------|-----------|
| 1 | Design API schema | @architect | DONE | 3 | — | 2026-03-28T09:00Z |
| 2 | Backend API endpoint | @api-builder | DONE | 5 | 1 | 2026-03-28T10:00Z |
| 3 | Unit + integration tests | @tester | DONE | 6 | 2 | 2026-03-28T11:00Z |
| 4 | Code review | @reviewer | IN_PROGRESS | 7 | 3 | — |
| 5 | QA automation run | @qa-automation | PENDING | 9 | 4 | — |
| 6 | Documentation update | @docs-writer | PENDING | 12 | 5 | — |
```

**Status values:** PENDING → IN_PROGRESS → DONE → VERIFIED (or BLOCKED, SKIPPED)

**Rules:**
- A phase cannot advance until ALL subtasks assigned to that phase are DONE
- Mark subtask done: `/workflow done TASK-{id} subtask-{N} "evidence"`
- Advance phase: `/workflow advance TASK-{id}` (auto-checks all subtasks)
- If subtask blocked: `/workflow block TASK-{id} subtask-{N} "reason"`

### Subtask Auto-Generation
When @team-lead decomposes a task, these subtasks are auto-created based on scope:

**Backend scope:**
1. Design (Phase 3) → @architect
2. Implement (Phase 5) → @api-builder
3. Database migration (Phase 5) → @database (if schema change)
4. Unit tests (Phase 6) → @tester
5. Integration tests (Phase 6) → @tester
6. Code review (Phase 7) → @reviewer + @security
7. QA automation (Phase 9) → @qa-automation
8. Sign-offs (Phase 10) → @qa-lead + @product-owner + @team-lead
9. Deploy (Phase 11) → @infra
10. Docs (Phase 12) → @docs-writer

**Frontend scope:** same but @frontend instead of @api-builder, add component tests
**Mobile scope:** same but @mobile, add device testing subtask
**Fullstack:** backend + frontend subtasks combined, parallel where independent

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
- last-reentry-reason: test_failure | lint_error | build_error | coverage_drop

### Dual Code Review Loop (Phase 7)
- review-loop: iteration N/3
- code-quality-score: N/100 (must be >= 75 to proceed)
- reviewer-1-status (@reviewer): APPROVE | REQUEST_CHANGES (N critical, M suggestions)
- reviewer-2-status (@security): APPROVE | REQUEST_CHANGES (N findings)
- dual-approval: true | false (both must be APPROVE)
- open-comments: [count] critical, [count] suggestions
- addressed-comments: [count] fixed, [count] won't-fix
- last-reentry-reason: code_quality_score | reviewer_changes | security_findings

### CI Fix Loop (Phase 8)
- ci-fix-loop: iteration N/3
- last-ci-failure: [check name] — [error] at [ISO timestamp]
- fix-agent: @debugger|@api-builder|@frontend|@infra|@tester
- last-reentry-reason: test_failure | lint_failure | type_error | build_failure | flaky_test

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

**Blocker duration:** Auto-calculated as `resolved_at - created_at`. If unresolved, shows "ongoing ({N} days)".

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
