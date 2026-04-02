# Real-World Flow Engine

## Orchestration Model
**Subagents cannot spawn other subagents** in Claude Code. All agent-to-agent coordination is orchestrated from the `/workflow` skill running in the main conversation context (with `context: fork`). When a phase requires multiple agents, invoke them sequentially or in parallel from the workflow — never expect one agent to call another directly.

**ALL handoffs route through the orchestrator** (workflow skill or @team-lead). Even when the flow-engine describes "@debugger fixes, handoff to @tester", the actual flow is: @debugger -> HANDOFF to orchestrator -> orchestrator invokes @tester.

## Handoff Protocol
Every agent/human transition MUST include a structured handoff block:

```
HANDOFF:
  from: @agent-name
  to: @next-agent-or-user
  reason: why this handoff is happening
  artifacts:
    - path/to/file-produced.md
    - path/to/test-results.json
  context: |
    Summary of what was done and key decisions made
  next_agent_needs: |
    What the receiving agent must verify/read before starting.
    Includes: files to check, known issues, patterns to follow.
  iteration: N/max (if in a loop)
  status: complete | blocked | escalating
```

### Handoff Rules
1. Every agent output MUST end with a HANDOFF block
2. The `next_agent_needs` field is MANDATORY — tells the next agent what to verify/read
3. The receiving agent MUST read all listed artifacts before starting
4. If `status: blocked`, route to @team-lead for resolution
5. If `status: escalating`, route to user with options
6. ALL routing goes through the orchestrator — agents NEVER invoke each other directly

### Mandatory Phase-Entry Checklist
Before ANY agent starts work in a new phase, the orchestrator MUST:
1. Read the task record and extract current `## Loop State`
2. Read the last HANDOFF entry and extract `next_agent_needs`
3. Verify all `artifacts` from the handoff still exist (Glob check)
4. Pass loop state + next_agent_needs + artifact paths to the agent's invocation prompt
5. If previous phase had an execution report, check for hallucination/regression flags

This ensures agents never start blind or rebuild context from scratch.

---

## Loop 1: Dev-Test Loop (Phase 6, max 5 iterations)

### Entry Condition
Phase 5 dev agent completes -> HANDOFF to orchestrator -> orchestrator invokes @tester FIRST (not parallel with @debugger).

### Flow
```
ENTRY: orchestrator invokes @tester with Phase 5 artifacts
  |
  v
@tester runs full test suite
  |
  +-> ALL PASS + coverage maintained -> EXIT: advance to Phase 7
  |
  +-> FAILURES -> @tester reports failing tests in HANDOFF
       |
       v
     orchestrator routes to fix agent:
       - test logic bug -> @debugger (minimal fix)
       - backend code issue -> @api-builder (if needs domain knowledge)
       - frontend code issue -> @frontend (if needs UI knowledge)
       - infra/config issue -> @infra
       |
       v
     fix agent applies fix -> runs tests locally -> HANDOFF back
       |
       v
     orchestrator invokes @tester again (increment iteration)
       |
       +-> ALL PASS -> EXIT: advance to Phase 7
       +-> STILL FAILING -> repeat loop
       +-> iteration 5 -> CIRCUIT BREAKER: escalate to user
```

### Loop State Tracking
```markdown
## Loop State
- dev-test-loop: iteration N/5
- last-failure: [test name] — [error summary] at [ISO timestamp]
- fix-agent: @debugger|@api-builder|@frontend|@infra
- coverage-baseline: N% (measured at Phase 5 end, before Phase 6 starts)
- coverage-current: N%
- phase-6-baseline-tests: [count] tests GREEN at Phase 6 entry (regression scope)
- circuit-breaker: false (set true at iteration 5 → escalate to user)
```

### Coverage Rule
- **Baseline**: measured at end of Phase 5 (before any Phase 6 iteration)
- **Maintained**: coverage-current >= coverage-baseline
- If coverage drops: @tester must add missing tests before advancing

### Exit Criteria
- ALL tests pass (zero failures)
- Coverage >= baseline
- @tester confirms in HANDOFF: `reason: testing complete — all pass`

---

## Loop 2: Dual Code Review Loop (Phase 7, max 3 iterations)

### Entry Condition
Phase 6 passes -> @code-quality audits FIRST -> then orchestrator invokes dual reviewers in PARALLEL.

### Dual Approval Model
Two independent reviewers must BOTH approve before PR creation:
- **@reviewer (Reviewer 1)** — code quality, conventions, correctness, maintainability
- **@security (Reviewer 2)** — security review, vulnerability check, auth/authz
Neither reviewer can override the other. Both approvals are mandatory.

### Flow
```
ENTRY: @code-quality audit (score must be >= 75)
```

### Code Quality Score Escalation
If @code-quality score < 75 after dev agent fixes:
1. First attempt: route specific violations back to dev agent with fix instructions
2. Second attempt: if score still < 75, @team-lead reviews — options:
   a. Override threshold (log justification in decision log)
   b. Reassign to different dev agent
   c. Escalate to user: "Code quality cannot reach 75. Current: {score}. Issues: {list}"
3. Override requires explicit justification in task record

```
  |
  v
orchestrator invokes @reviewer (R1) + @security (R2) in parallel
  |
  v
@reviewer (R1) produces: APPROVE or REQUEST_CHANGES (with comments)
@security (R2) produces: APPROVE or REQUEST_CHANGES (with findings)
  |
  +-> BOTH APPROVE -> EXIT: advance to Phase 8 (PR Creation)
  |
  +-> SPLIT DECISION (one approves, one requests changes):
  |     -> treat as REQUEST_CHANGES (stricter wins)
  |     -> only re-review with the rejecting reviewer (approved verdict preserved)
  |
  +-> BOTH REQUEST_CHANGES -> combine all comments
       |
       v
     orchestrator routes fix by comment category:
       - code quality / conventions -> original dev agent (@api-builder / @frontend)
       - security finding -> @debugger (security fix) or original dev agent
       - performance issue -> original dev agent
       - test gap -> @tester (add tests, not a review-loop iteration)
       |
       v
     fix agent addresses ALL comments -> HANDOFF with list of addressed items
       |
       v
     orchestrator invokes ONLY the agent(s) that requested changes (not both)
       - @reviewer if they had comments
       - @security if they had findings
       - both only if both originally requested changes
       |
       v
     re-review focuses on: previously flagged items + any new code from fix
       |
       +-> APPROVE -> EXIT (check if other reviewer still needs to re-review)
       +-> REQUEST_CHANGES again -> repeat (increment iteration)
       +-> iteration 3 -> CIRCUIT BREAKER: escalate to user
```

### Loop State Tracking
```markdown
## Loop State
- review-loop: iteration N/3
- reviewer-status: APPROVE | REQUEST_CHANGES (N critical, M suggestions)
- security-status: APPROVE | REQUEST_CHANGES (N findings)
- split-decision: false | true (one approved, one rejected — stricter wins)
- code-quality-score: N/100 (must be >= 75, escalate after 2 attempts below)
- open-comments: [count] critical, [count] suggestions
- addressed-comments: [count] fixed, [count] won't-fix (with justification)
- circuit-breaker: false (set true at iteration 3 → escalate to user)
```

### Partial Re-Review Rule
- If 8/10 comments addressed and 2 marked "won't fix" with justification:
  - Reviewer evaluates the justifications
  - If justifications are valid -> APPROVE with noted exceptions
  - If justifications are weak -> REQUEST_CHANGES on those 2 only

### Exit Criteria
- @reviewer: APPROVE (zero critical issues)
- @security: APPROVE (zero HIGH/CRITICAL findings)
- Both confirmed in HANDOFF blocks

---

## Loop 3: QA-Bug Loop (Phase 9, max 3 iterations PER BUG)

### Entry Condition
Phase 8 PR+CI pass -> orchestrator invokes @qa-lead to create test plan, then @tester to execute.

### Regression Suite Definition
- **Scope:** All tests from Phase 6 that were GREEN at Phase 6 exit (baseline)
- **After each bug fix:** Run FULL regression suite (not just targeted tests)
- **Time limit:** If regression suite > 10 minutes, run targeted tests first; full suite runs async
- **Failure:** Any regression = new bug report (P1 severity, filed immediately)

### Flow
```
ENTRY: orchestrator invokes @qa-lead (creates QA test plan)
  |
  v
orchestrator invokes @tester (executes test plan scenarios)
  |
  v
@qa-lead reviews results, files bug reports for failures
  |
  +-> ZERO BUGS -> EXIT: advance to Phase 10 (QA sign-off)
  |
  +-> BUGS FOUND -> orchestrator triages by severity:
       |
       v
     Phase 9a: Fix P0 bugs first (block everything)
     Phase 9b: Fix P1 bugs (block sign-off)
     Phase 9c: Fix P2 bugs (QA decides)
     Phase 9d: Log P3/P4 as known issues (don't block)
       |
       v
     For each bug (priority order):
       orchestrator invokes @debugger with bug report
         |
         v
       @debugger fixes -> runs targeted test -> HANDOFF
         |
         v
       orchestrator invokes @tester: run regression suite
       (to catch: fix for BUG-1 broke BUG-2's previous fix)
         |
         v
       orchestrator invokes @qa-lead: re-verify THIS bug
         |
         +-> VERIFIED: close bug, move to next
         +-> REOPENED: back to @debugger (increment per-bug counter)
         +-> per-bug iteration 3 -> escalate to @team-lead
```

### Loop State Tracking
```markdown
## Loop State
- qa-bug-loop:
  - BUG-{id}-1 (P1): iteration N/3 — [OPEN|FIXED|VERIFIED|REOPENED]
  - BUG-{id}-2 (P3): iteration 0/3 — [OPEN] (known issue, won't block)
  - BUG-{id}-3 (P0): iteration N/3 — [VERIFIED]
- total-bugs: N found, M fixed, K verified, J known-issues
- total-fix-attempts: N/15 (global circuit breaker across all bugs)
- regression-check-after-each-fix: true
- last-regression-result: PASS | FAIL [test name] at [ISO timestamp]
- p2-decisions: [BUG-id: must-fix | conditional-with-workaround]
- circuit-breaker: false (set true at 15 total attempts → escalate entire Phase 9)
```

### Per-Bug vs Global Iteration
- **3 iterations PER BUG** — each bug gets up to 3 fix attempts
- If a single bug exceeds 3 iterations: escalate THAT bug to @team-lead
- Other bugs continue being fixed normally
- **Global circuit breaker**: if total fix attempts across ALL bugs exceeds 15, escalate entire Phase 9

### P2 Bug Handling
P2 bugs get explicit treatment:
1. @qa-lead evaluates: is the workaround acceptable for release?
2. If YES -> mark as known issue with workaround documentation, CONDITIONAL
3. If NO -> treat as P1 (blocks sign-off, must fix)
4. Decision logged in task record Decision Log

### Regression Between Bug Fixes
After EVERY bug fix, @tester runs the full regression suite BEFORE @qa-lead verifies. This catches:
- Fix for BUG-1 that breaks BUG-2's previous fix
- Fix that introduces new failures unrelated to the reported bug

### Exit Criteria
- All P0/P1 bugs: VERIFIED and CLOSED
- P2 bugs: VERIFIED or CONDITIONAL (with documented workaround)
- P3/P4 bugs: logged as known issues
- @qa-lead confirms readiness for sign-off

---

## Loop 4: CI Fix Loop (Phase 8, max 3 iterations)

### Flow
```
ENTRY: orchestrator creates PR via gh cli
  |
  v
CI runs (GitHub Actions / GitLab CI / etc.)
  |
  +-> ALL CHECKS PASS -> EXIT: advance to Phase 9
  |
  +-> CI FAILURE -> orchestrator reads CI logs
       |
       v
     classify failure:
       - test failure -> @debugger (fix code, NOT test expectations)
       - lint failure -> original dev agent (fix style)
       - type error -> original dev agent (fix types)
       - build failure -> @debugger or @infra (depends on error)
       - flaky test -> @tester (stabilize test)
       |
       v
     fix agent applies fix -> pushes to PR branch
       |
       v
     CI re-runs (increment iteration)
       |
       +-> PASS -> EXIT
       +-> FAIL -> repeat
       +-> iteration 3 -> CIRCUIT BREAKER
```

### Loop State Tracking
```markdown
## Loop State
- ci-fix-loop: iteration N/3
- last-ci-failure: [check name] — [error summary] at [ISO timestamp]
- ci-failure-type: test_failure | lint_failure | type_error | build_failure | flaky_test
- fix-agent: @debugger|@api-builder|@frontend|@infra|@tester
- substantive-change: false | true (if true → may need Phase 7 re-review before re-running CI)
- circuit-breaker: false (set true at iteration 3 → escalate to user)
```

### CI Fix Review Rule
If @debugger changes code to fix CI:
- If change is trivial (typo, import, config): push directly, no re-review needed
- If change is substantive (logic change, new code): flag in HANDOFF, orchestrator decides whether to loop back to Phase 7 for re-review before re-running CI

---

## Loop 5: Sign-off Rejection Loop (Phase 10, max 2 full rejection cycles)

### Flow
```
ENTRY: orchestrator invokes sign-off gates sequentially
  |
  v
Gate 1: @qa-lead (QA sign-off)
  +-> APPROVED or CONDITIONAL -> proceed to Gate 2
  +-> REJECTED (P0/P1 bugs) -> route back to Phase 5
  |     (QA approval is INVALIDATED, must re-sign after fix)
  |
Gate 2: @product-owner (Business sign-off)
  +-> APPROVED -> proceed to Gate 3
  +-> REJECTED:
  |     wrong requirements -> Phase 4 (revise criteria)
  |     UI not right -> Phase 5c (frontend fix)
  |     missing edge case -> Phase 5 (add case)
  |     defer -> ON_HOLD (exit workflow)
  |     (QA approval PRESERVED — business issue, not quality)
  |
Gate 3: @team-lead (Tech sign-off)
  +-> APPROVED -> EXIT: advance to Phase 11
  +-> REJECTED:
        architecture issue -> Phase 3 (redesign -> full re-flow)
        performance issue -> Phase 5 (optimize) -> Phase 6
        needs more tests -> Phase 5d (add tests) -> Phase 6
        (QA + Business approvals INVALIDATED for architecture rejection)
        (QA + Business approvals PRESERVED for test/performance rejection)
```

### Sign-off State Preservation Rules
| Rejection Source | QA Approval | Business Approval | Reason |
|-----------------|-------------|-------------------|--------|
| @qa-lead (bugs) | INVALIDATED | INVALIDATED | Code changed, needs full re-verify |
| @product-owner (requirements) | PRESERVED | INVALIDATED | Code didn't change quality |
| @product-owner (UI) | PRESERVED | INVALIDATED | Only frontend changed |
| @team-lead (architecture) | INVALIDATED | INVALIDATED | Major structural change |
| @team-lead (performance) | PRESERVED | PRESERVED | Optimization, not logic change |
| @team-lead (tests) | PRESERVED | PRESERVED | Adding tests, not changing behavior |

### Outer Rejection Circuit Breaker
**Max 2 full rejection cycles** (Phase 10 -> rework -> return to Phase 10):
- After 2 full rejection cycles at Phase 10, STOP and escalate to user
- Options: continue, re-scope task, split into smaller tasks, cancel
- This prevents infinite ping-pong between phases

### Tracking
```markdown
## Loop State
- signoff-rejection-cycle: N/2
- qa-signoff: APPROVED|CONDITIONAL|REJECTED|PENDING
- biz-signoff: APPROVED|REJECTED|PENDING
- tech-signoff: APPROVED|REJECTED|PENDING
- last-rejection: [who] — [reason] at [ISO timestamp]
- last-rejection-route: phase-3 | phase-4 | phase-5 | phase-5c | phase-5d | on-hold
- sub-phase-active: none | 5c (frontend fix) | 5d (add tests)
- approvals-invalidated: [list of invalidated gates with reason, e.g., "qa: code_changed"]
- circuit-breaker: false (set true at cycle 2 → escalate to user with options)
```

---

## Loop 6: Deploy-Failure Loop (Phase 11, max 2 attempts)

### Flow
```
ENTRY: @team-lead merges PR (only after ALL sign-offs + CI green)
  |
  v
@team-lead: gh pr merge {pr-number} --squash --delete-branch
  |
  v
orchestrator invokes @infra for deployment
  |
  v
@infra runs: pre-checks -> deploy -> health check -> smoke test
  |
  +-> ALL PASS -> EXIT: advance to Phase 12
  |
  +-> FAILURE -> @infra triages:
       |
       +-> config/env issue -> @infra fixes config -> retry deploy (no Phase 5)
       +-> code bug revealed in prod -> @debugger hotfix -> Phase 6->7->8 fast-track
       +-> infra issue (capacity, networking) -> @infra resolves -> retry deploy
       +-> unknown -> rollback via /rollback, escalate to user
       |
       v
     retry deploy (increment iteration)
       +-> PASS -> EXIT
       +-> FAIL -> iteration 2 -> STOP, rollback, escalate
```

### Loop State Tracking
```markdown
## Loop State
- deploy-loop: iteration N/2
- last-deploy-failure: [error type] — [summary] at [ISO timestamp]
- deploy-failure-type: config_issue | code_bug | infra_issue | unknown
- rollback-executed: true|false
- rollback-target: [commit hash or "none"]
- health-check-result: PASS | FAIL [endpoint] at [ISO timestamp]
- smoke-test-result: PASS | FAIL [test name] at [ISO timestamp]
- hotfix-triggered: false | true (code_bug → fast-track Phase 5→11)
- circuit-breaker: false (set true at iteration 2 → rollback + escalate)
```

### Deploy Triage (NOT blind Phase 5 re-route)
Deploy failures are triaged BEFORE routing:
1. **Config issue**: @infra fixes config, retry deploy directly (no code change)
2. **Code bug**: follows hotfix fast-track (Phase 5->6->7->8->11)
3. **Infra issue**: @infra resolves, retry deploy directly
4. **Unknown**: rollback + escalate to user

---

## Sub-Phase Definitions (Formal Entry/Exit Criteria)

### Phase 5c: Frontend Fix (Sign-off Rejection)
**Trigger:** @product-owner rejects at Phase 10, reason = "UI not right"
**Entry Condition:** BIZ_SIGNOFF = REJECTED AND rejection_category = "ui_issue"
**Agent:** @frontend
**Scope:** Fix only the specific UI issues cited in @product-owner rejection comments
**Exit Condition:** @frontend HANDOFF with all rejection items addressed
**Next State:** Phase 6 (Dev Self-Testing) — QA approval PRESERVED, biz approval INVALIDATED
**Loop Counter:** dev-test, review, ci-fix all PRESERVED (no reset)

### Phase 5d: Add Tests (Sign-off Rejection)
**Trigger:** @team-lead rejects at Phase 10, reason = "needs more tests"
**Entry Condition:** TECH_SIGNOFF = REJECTED AND rejection_category = "test_gap"
**Agent:** @tester
**Scope:** Add tests for the specific gaps cited in @team-lead rejection comments
**Exit Condition:** @tester HANDOFF with new tests passing, coverage >= baseline
**Next State:** Phase 6 (Dev Self-Testing) — QA + Business approvals PRESERVED
**Loop Counter:** dev-test, review, ci-fix all PRESERVED (no reset)

### Phase 9a: Fix P0 Bugs
**Trigger:** @qa-lead files P0 bug during Phase 9 QA testing
**Entry Condition:** Bug report with severity = P0 exists AND bug status = OPEN
**Agent:** @debugger (primary), routed by orchestrator
**Scope:** Fix the P0 bug — blocks ALL other work until resolved
**Exit Condition:** @debugger HANDOFF with fix applied + @tester regression suite PASS + @qa-lead VERIFIED
**Next State:** Next bug in priority order (P0 > P1 > P2) or Phase 10 if zero bugs remain
**Loop Counter:** Per-bug iteration incremented (max 3 per bug)

### Phase 9b: Fix P1 Bugs
**Trigger:** @qa-lead files P1 bug during Phase 9 QA testing, AND all P0 bugs are VERIFIED
**Entry Condition:** All P0 bugs VERIFIED/CLOSED AND P1 bug status = OPEN
**Agent:** @debugger (primary), routed by orchestrator
**Scope:** Fix the P1 bug — blocks sign-off but not P0 fixes
**Exit Condition:** @debugger HANDOFF with fix applied + @tester regression suite PASS + @qa-lead VERIFIED
**Next State:** Next P1 bug, or P2 evaluation, or Phase 10
**Loop Counter:** Per-bug iteration incremented (max 3 per bug)

### Phase 9c: Fix P2 Bugs
**Trigger:** @qa-lead evaluates P2 bug after all P0/P1 resolved
**Entry Condition:** All P0/P1 bugs VERIFIED/CLOSED AND @qa-lead decision on P2 = "must fix" (not acceptable workaround)
**Agent:** @debugger
**Scope:** Fix the P2 bug
**Exit Condition:** @debugger HANDOFF + @tester regression PASS + @qa-lead VERIFIED, OR @qa-lead marks CONDITIONAL with documented workaround
**Next State:** Next P2 bug or Phase 10
**Loop Counter:** Per-bug iteration incremented (max 3 per bug)

### Phase 9d: Log Known Issues
**Trigger:** @qa-lead identifies P3/P4 bugs OR decides P2 workaround is acceptable
**Entry Condition:** Bug severity = P3/P4, OR P2 with acceptable workaround
**Agent:** @qa-lead (documentation only)
**Scope:** Log in task record's Known Issues section, do NOT attempt fix
**Exit Condition:** Known issues documented with severity, description, and workaround (if applicable)
**Next State:** Phase 10 (does not consume loop iterations)
**Loop Counter:** No iteration consumed — documentation only

### Sub-Phase State Transitions
```
Phase 10 rejection → Phase 5c: if @product-owner rejects for UI
Phase 10 rejection → Phase 5d: if @team-lead rejects for tests
Phase 10 rejection → Phase 5:  if @product-owner rejects for missing edge case
Phase 10 rejection → Phase 4:  if @product-owner rejects for wrong requirements
Phase 10 rejection → Phase 3:  if @team-lead rejects for architecture

Phase 9 bugs → Phase 9a: P0 bugs (immediate, blocks everything)
Phase 9 bugs → Phase 9b: P1 bugs (after all P0 verified)
Phase 9 bugs → Phase 9c: P2 bugs (after all P0/P1, @qa-lead decides)
Phase 9 bugs → Phase 9d: P3/P4 bugs (log only, no fix attempt)
```

---

## Bug Severity Quick Reference
- **P0**: System down, data loss, security breach — blocks everything, immediate fix
- **P1**: Core feature broken, no workaround — blocks QA sign-off, must fix
- **P2**: Feature broken with workaround — QA decides: treat as P1 or CONDITIONAL with documented workaround
- **P3**: Minor issue, cosmetic — conditional approve
- **P4**: Enhancement, nice-to-have — approve with known issues list

## Hotfix Fast-Track
Production P0/P1 -> skip Phase 3+4:
```
Phase 1 (type=hotfix) -> Phase 2 (abbreviated impact)
  -> Phase 5 (@debugger as primary dev, not @api-builder)
  -> Phase 6 (dev-test: max 3 iterations)
  -> Phase 7 (review: max 2 iterations)
  -> Phase 8 (CI: max 2 attempts)
  -> Phase 9 (verify-only: @qa-lead confirms fix, no full test plan)
  -> Phase 10 (tech sign-off ONLY, skip QA formal + business)
  -> Phase 11 (deploy: max 1 attempt, immediate rollback on failure)
  -> Phase 12 (monitor 15min, not 30)
```

**Hotfix failure at any phase:** rollback + escalate immediately (no re-routing through earlier phases).

## Spike Flow (Research Only)
```
Phase 1 (type=spike, NO branch) -> Phase 2 (@explorer only)
  -> Phase 3 (@architect + @explorer investigate)
  -> SKIP Phases 4-12
  -> Output: Research Report (findings, recommendation, complexity estimate)
  -> Status: CLOSED
  -> If "proceed as feature": user runs /workflow new "..."
```
No loops, no circuit breakers, no sign-offs.

## Concurrency Rule
**ONE active workflow at a time.** Before `/workflow new`:
1. Scan `.claude/tasks/` for active tasks
2. If found: prompt user to ON_HOLD or cancel the active task
3. NEVER run parallel workflows (context/file conflicts)

## ON_HOLD Management
- Enter: product-owner defers, or user explicitly pauses
- State preserved: current phase + all loop counters
- Resume: `/workflow resume TASK-id` -> re-enter at saved phase
- 7+ days: session-start hook warns user
- 30+ days: session-start hook suggests cancel
- NO auto-cancel (user must decide)

## CANCELLED Cleanup
When `/workflow cancel TASK-id`:
1. Status -> CANCELLED
2. Close open PR (`gh pr close`)
3. Delete local feature branch
4. Clean up worktrees if any
5. Task record preserved for history

## Circuit Breaker Summary
| Loop | Normal Max | Hotfix Max | Scope | Escalation |
|------|-----------|------------|-------|------------|
| Dev-Test (P6) | 5 | 3 | Global | User options |
| Review (P7) | 3 | 2 | Global | User options |
| CI Fix (P8) | 3 | 2 | Global | User options |
| QA Bug (P9) | 3/bug, 15 total | 2/bug, 6 total | Per-bug | @team-lead per bug |
| Sign-off (P10) | 2 cycles | 1 cycle | Global | User options |
| Deploy (P11) | 2 | 1 | Global | Rollback + escalate |

## Loop Counter Reset Rules
| Event | Which Counters Reset |
|-------|---------------------|
| Phase 10 rejects -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| Phase 10 rejects -> Phase 4 or 3 | ALL loop counters reset to 0 |
| Deploy fails -> Phase 5 | dev-test, review, ci-fix reset to 0 |
| Normal phase advance | Counters preserved for reporting |
| Agent timeout in loop | Counts as +1 iteration (no reset) |
| ON_HOLD -> resume | ALL counters preserved (no reset) |
| CANCELLED | All counters frozen (historical) |

## Task State Machine
```
BACKLOG -> REQUIREMENTS_CLEAR -> INTAKE -> ANALYZING -> DESIGNING -> APPROVED -> DEVELOPING
  -> DEV_TESTING -> REVIEWING -> CI_PENDING -> QA_TESTING
  -> QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF
  -> DEPLOYING -> MONITORING -> CLOSED

Special: BLOCKED, ON_HOLD, CANCELLED (from any active state)

Reverse: QA_SIGNOFF->DEVELOPING, BIZ_SIGNOFF->APPROVED|DEVELOPING,
         TECH_SIGNOFF->DESIGNING|DEVELOPING, DEPLOYING->DEVELOPING
```
