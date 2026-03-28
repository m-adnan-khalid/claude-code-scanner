---
name: workflow
description: Full SDLC workflow orchestrator. Coordinates agents from task intake through production deployment. Use when starting new work, checking task status, or managing the development lifecycle.
user-invocable: true
disable-model-invocation: true
context: fork
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Agent
argument-hint: "new|status|plan|dev|review|qa|deploy|resume [description|TASK-id] [--hotfix] [--spike]"
effort: high
---

# Workflow: $ARGUMENTS

Orchestrate the full development lifecycle. No phase advances until exit criteria are met.

## Commands
- `/workflow new "description"` — Full flow from Phase 1
- `/workflow new --hotfix "issue"` — Skip design/biz, fast-track to deploy
- `/workflow new --spike "question"` — Research only, no code (ends at CLOSED)
- `/workflow status [TASK-id]` — All active tasks (or specific task with subtask details)
- `/workflow advance TASK-id` — Check all subtasks for current phase, advance if all DONE
- `/workflow done TASK-id subtask-N "evidence"` — Mark subtask complete with proof
- `/workflow block TASK-id subtask-N "reason"` — Mark subtask blocked
- `/workflow subtasks TASK-id` — Show full subtask decomposition and progress
- `/workflow resume TASK-id` — Resume ON_HOLD or interrupted task
- `/workflow cancel TASK-id` — Cancel task with cleanup
- `/workflow plan|dev|review|qa|deploy TASK-id` — Jump to phase

### Phase Advancement Protocol
Phases do NOT advance automatically. To move to the next phase:
1. Run `/workflow subtasks TASK-{id}` to see what's pending
2. Complete all subtasks for the current phase
3. Mark each done: `/workflow done TASK-{id} subtask-{N} "evidence: tests pass"`
4. Advance: `/workflow advance TASK-{id}`
5. If any subtask not DONE → advancement blocked, shows what's missing

### Subtask Lifecycle
```
PENDING → IN_PROGRESS → DONE → VERIFIED
                ↓
             BLOCKED → (unblock) → IN_PROGRESS
```
- Every subtask completion is saved to the task file, changes.log, and timeline
- Nothing is lost between sessions — task file is the source of truth
- `/workflow status` always shows current state from the task file

**Tip:** Run `/clarify --feature "description"` before `/workflow new` to validate requirements are clear for the feature. Or `/clarify --existing` to scan the full codebase for gaps.

## Concurrency Rule
**ONE active workflow at a time.** Before starting `/workflow new`, check `.claude/tasks/` for any task in an active state (DEVELOPING, DEV_TESTING, REVIEWING, etc.). If found:
- Prompt user: "TASK-{id} is active. Options: (1) pause it to ON_HOLD, (2) cancel it, (3) abort new workflow"
- Do NOT start a second concurrent workflow

## Orchestration Model
**IMPORTANT:** Subagents cannot spawn other subagents. All agent-to-agent coordination flows through THIS workflow skill. When Phase N requires multiple agents, invoke them sequentially or in parallel from here — never expect one agent to call another.

**ALL handoffs route through this orchestrator.** When flow-engine describes "@debugger fixes, handoff to @tester", the actual path is: @debugger -> HANDOFF to orchestrator -> orchestrator invokes @tester.

## Agent Team
| Role | Agent | Responsibility |
|------|-------|---------------|
| Coordination | @team-lead | Assigns work, resolves blockers, tech sign-off |
| Architecture | @architect | Design review, system design |
| Business | @product-owner | Acceptance criteria, business sign-off |
| QA Strategy | @qa-lead | QA planning, QA sign-off |
| Backend Dev | @api-builder | API endpoints, services |
| Frontend Dev | @frontend | UI components, pages |
| Testing | @tester | Write and run automated tests |
| Debugging | @debugger | Root cause analysis, bug fixes |
| Code Review | @reviewer | Quality, conventions |
| Code Quality | @code-quality | Design patterns, SOLID, duplication, static analysis |
| Security | @security | Vulnerability review |
| Investigation | @explorer | Codebase exploration, impact mapping |
| Infrastructure | @infra | Docker, CI/CD, deployment |
| Mobile Dev | @mobile | iOS, Android, Flutter, React Native |
| Database | @database | Schema design, migrations, query optimization |
| QA Automation | @qa-automation | E2E testing, visual verification, deploy & test |
| Change Validation | @gatekeeper | Auto-approve/block changes, regression detection |

## Pre-Development Context
If `.claude/project/PROJECT.md` exists and has status `READY_FOR_DEV`, read these project docs before starting Phase 1:
- `.claude/project/PRODUCT_SPEC.md` — use for acceptance criteria baseline in Phase 4
- `.claude/project/ARCHITECTURE.md` — reference in Phase 3 instead of designing from scratch
- `.claude/project/BACKLOG.md` — pre-populate scope/complexity in Phase 1 if feature matches a backlog entry
- `.claude/project/DEPLOY_STRATEGY.md` — reference in Phase 11 for deployment approach
- `.claude/project/TECH_STACK.md` — reference for technology constraints

This enriches the workflow with decisions already made during pre-development. If these files don't exist, the workflow proceeds normally (backward compatible).

**Validation (only when PROJECT.md status = READY_FOR_DEV):**
If project docs exist but contain only template placeholders (e.g., `{project-name}`), warn:
"Project documents appear incomplete. Run `/clarify --before-dev` to validate requirements."
This is a warning, not a blocker — user can proceed or fix first.

## Cross-Feature Context
When starting a new workflow and completed features exist (previous TASK-{id} files with status CLOSED):
- Read each completed task's Phase 5 details for: files created, API patterns, component patterns, shared code
- Inject a "Previous Features Summary" into Phase 1 context:
  - API conventions established (error format, pagination, auth patterns)
  - Shared components/services created
  - Test patterns used
  - Key file paths to reference (not redesign)
- This ensures consistency across features built in sequence.

## Backlog Synchronization
When a workflow reaches Phase 13 (CLOSED) and `.claude/project/BACKLOG.md` exists:

**Trigger:** The workflow orchestrator itself performs this sync as its FINAL action in Phase 13,
BEFORE generating the execution report. This is NOT a hook — it runs inline in the workflow.

**Steps:**
1. Find the feature entry in BACKLOG.md that matches this task's title (fuzzy match)
2. Update its status: `IN_PROGRESS` → `COMPLETE`
3. Update PROJECT.md "Features In Development" table with TASK-id + completion date
4. Check if all Must-Have features are now COMPLETE:
   - If YES → output: "All MVP features complete! Run /launch-mvp to finalize."
   - If NO → output: "Feature complete. N/M MVP features done. Run /mvp-kickoff next."

**If no match found:** Warn: "Could not find matching feature in BACKLOG.md. Update manually."
**If BACKLOG.md missing:** Skip silently (backward compatible with non-pre-dev projects).

## Handoff Protocol
Every agent transition MUST include a structured handoff:
```
HANDOFF:
  from: @agent-name
  to: @next-agent
  reason: why this handoff is happening
  artifacts:
    - list of files/docs produced
  context: |
    Summary of what was done and key decisions
  iteration: N/max (if in a loop)
```

## Context Budget Protocol
**Note:** This workflow runs in `context: fork`. The `/context-check` skill measures the fork's own context, not the parent. Between heavy phases, compact the fork's context:
1. Update task record with current phase status (persisted to disk)
2. If responses feel slow or truncated: `/compact "focus on TASK-{id} Phase {N}"`
3. After compaction: re-read task file to restore loop state

---

## Prerequisite Validation
Before advancing ANY phase, check:
1. **Dependencies:** If task has `depends-on: TASK-X`, verify TASK-X has reached at least Phase 8 (CI_PENDING). If not, BLOCK with reason.
2. **Task record exists:** `.claude/tasks/TASK-{id}.md` must exist and be readable.
3. **Previous phase exit criteria met:** Read task record, confirm previous phase output sections are populated.

---

## VARIANT: Hotfix Fast-Track

When `--hotfix` flag is present:
```
Phase 1 (Intake: type=hotfix) -> Phase 2 (Impact, abbreviated)
  -> SKIP Phase 3 (Architecture) and Phase 4 (Business)
  -> Phase 5 (Dev: @debugger as primary, not @api-builder)
  -> Phase 6 (Dev-Test: max 3 iterations, not 5)
  -> Phase 7 (Review: @code-quality audit -> @reviewer + @security, max 2 iterations)
  -> Phase 8 (PR + CI: max 2 attempts)
  -> Phase 9 (QA: verify-only — @qa-lead confirms fix, no full test plan)
  -> Phase 10 (Tech sign-off ONLY — skip QA formal + business sign-off)
  -> Phase 11 (Deploy: max 1 attempt, rollback immediately on failure)
  -> Phase 12 (Post-Deploy: monitor 15min, not 30)
```

**Hotfix circuit breakers (tighter):**
- Dev-test: max 3 (not 5)
- Review: max 2 (not 3)
- CI: max 2 (not 3)
- Deploy: max 1 (immediate rollback on failure)
- If any breaker trips: rollback + escalate immediately

---

## VARIANT: Spike (Research Only)

When `--spike` flag is present:
```
Phase 1 (Intake: type=spike) -> create task record, NO branch
  -> Phase 2 (Impact Analysis: @explorer only, no @security)
  -> Phase 3 (Architecture: @architect + @explorer investigate the question)
  -> SKIP Phase 4-12 (no code, no tests, no deploy)
  -> Output: Research Report saved to task record
    - Question investigated
    - Findings with file:line refs
    - Recommendation: proceed as feature / not viable / needs more research
    - Estimated complexity if proceeding
  -> Task status: CLOSED (type: spike)
  -> If recommendation is "proceed as feature": prompt user to run
    `/workflow new "description based on spike findings"`
```

**Spike has NO loops, NO circuit breakers, NO sign-offs.**

---

## Phase 1: Task Intake
**Drift check (automatic):** Run `/sync --check` silently. If drift detected:
- Minor drift (1-3 items): log warning in task record, continue
- Major drift (4+ items or tech stack change): prompt user "Environment may be stale. Run `/sync --fix` before continuing? (y/N)"
- If user says yes: run `/sync --fix`, then continue intake
- If user says no: continue with warning logged

Classify type (feature/bugfix/refactor/hotfix/spike), scope (frontend/backend/fullstack/infra), complexity (small/medium/large). Create branch (except spike). Log to `.claude/tasks/TASK-{id}.md`.

**State: INTAKE**

## Phase 2: Impact Analysis
Run @explorer + @security in PARALLEL (spike: @explorer only).
- Files affected, blast radius, test coverage, security flags
- Risk: LOW/MEDIUM/HIGH/CRITICAL
- Exit: impact report generated

**State: ANALYZING**

## Phase 3: Architecture Review
**Skip condition (automatic):** Skip if ALL of: complexity == small AND risk == LOW AND type != refactor.
If skipped, log in task record: "Phase 3 skipped: small + LOW risk."
If NOT skipped: @architect designs solution. Then @code-quality reviews the design — recommends design patterns (SOLID, GoF), defines quality gates, and flags scalability concerns. User approves before proceeding.

**State: DESIGNING -> APPROVED (on user approval)**

## Phase 4: Business Analysis
@product-owner generates acceptance criteria (GIVEN/WHEN/THEN). User confirms.
**Skip condition:** Skip if type == hotfix OR type == refactor OR type == tech-debt.

**State: APPROVED (after user confirms criteria)**

## Phase 5: Development
@team-lead assigns by scope. **Sub-steps are conditional:**

| Sub-step | Runs When | Agent |
|----------|-----------|-------|
| 5a: DB migrations | scope includes backend AND database changes detected | @api-builder |
| 5b: Backend code | scope includes backend | @api-builder |
| 5c: Frontend code | scope includes frontend | @frontend |
| 5d: Tests | always (even infra tasks get smoke tests) | @tester |

**Fullstack parallel execution:**
1. 5a runs FIRST (DB must be ready before code)
2. 5b + 5c run in PARALLEL (using isolation: worktree)
3. @api-builder's worktree merges FIRST (backend defines API contract)
4. @team-lead resolves any type/interface conflicts
5. @frontend's worktree merges SECOND (adapts to final backend)
6. 5d runs AFTER merge (tests against merged code)

**If one parallel agent finishes early:** It waits. The orchestrator does NOT advance that agent to Phase 6 independently — both must complete Phase 5 before either enters Phase 6.

**State: DEVELOPING**

## Phase 6: Dev Self-Testing
@tester runs FIRST. Measure coverage baseline at Phase 5 end.
**Loop (max 5 iterations):**
1. Orchestrator invokes @tester -> full test suite
2. ALL PASS + coverage >= baseline -> EXIT to Phase 7
3. FAILURES -> route to fix agent by issue type
4. Fix agent applies fix -> HANDOFF back
5. Re-invoke @tester (increment iteration)
6. **Agent timeout:** If fix agent hits maxTurns, count as 1 loop iteration, re-invoke with narrowed scope
7. Iteration 5 -> CIRCUIT BREAKER

Track: `dev-test-loop: N/5`, `coverage-baseline`, `coverage-current`, `fix-agent`, `last-failure`

**State: DEV_TESTING**

## Phase 7: Code Review
@code-quality audits FIRST (SOLID violations, duplication, complexity, design pattern compliance, scalability).
Then @reviewer + @security run in PARALLEL. Stricter verdict wins if split.
**Loop (max 3 iterations):**
1. ALL APPROVE (code-quality score >= 75, reviewer approves, security approves) -> EXIT to Phase 8
2. @code-quality score < 75 -> route SOLID/pattern fixes to dev agent before reviewer sees code
3. SPLIT DECISION -> only re-review with rejecting agent
4. REQUEST_CHANGES -> route fixes by category to appropriate dev agent
5. Partial re-review (only the agent(s) that requested changes)
6. **Agent timeout:** Reviewer timeout = count as iteration, re-invoke
7. Iteration 3 -> CIRCUIT BREAKER

Track: `review-loop: N/3`, `reviewer-status`, `security-status`, `open-comments`

**State: REVIEWING**

## Phase 8: PR + CI
Create PR, wait for CI.
**Loop (max 3 iterations):**
1. CI fails -> classify failure -> route to fix agent
2. Fix -> push -> CI re-runs
3. Substantive fix (logic change): flag for Phase 7 re-review
4. **Agent timeout:** CI fix agent timeout = count as iteration
5. Iteration 3 -> CIRCUIT BREAKER

Track: `ci-fix-loop: N/3`, `last-ci-failure`, `fix-agent`

**State: CI_PENDING**

## Phase 9: QA Testing
1. @qa-lead creates QA test plan
2. @tester executes automated scenarios (this is how @qa-lead gets test execution — @qa-lead plans, @tester executes)
3. @qa-lead reviews results, files bug reports

**Bug loop (max 3 per bug, 15 total):**
- Priority order: P0 -> P1 -> P2. P3/P4 logged as known issues.
- Per bug: @debugger fixes -> @tester regression suite -> @qa-lead re-verifies
- P2: @qa-lead decides — must-fix or CONDITIONAL with workaround doc
- Per-bug iteration 3 -> escalate THAT bug to @team-lead
- Total > 15 -> escalate entire Phase 9

Track: `qa-bug-loop` per bug, `total-bugs`, `regression-check-after-each-fix: true`

**State: QA_TESTING**

## Phase 10: Sign-offs (max 2 full rejection cycles)
Sequential gates:
1. **QA sign-off** -> @qa-lead
2. **Business sign-off** -> @product-owner (skip if hotfix/refactor/tech-debt)
3. **Tech sign-off** -> @team-lead

**Sign-off preservation on rejection:**
| Rejection | QA Approval | Biz Approval | Route To |
|-----------|-------------|-------------|----------|
| @qa-lead (bugs) | INVALIDATED | INVALIDATED | Phase 5 -> Phase 6 -> 7 -> 8 -> 9 -> 10 |
| @product-owner (reqs) | PRESERVED | INVALIDATED | Phase 4 -> Phase 5 -> ... -> 10 |
| @product-owner (UI) | PRESERVED | INVALIDATED | Phase 5c -> 6 -> 7 -> 8 -> 9 -> 10 |
| @team-lead (architecture) | INVALIDATED | INVALIDATED | Phase 3 -> full re-flow |
| @team-lead (perf/tests) | PRESERVED | PRESERVED | Phase 5 -> 6 -> 7 -> 8 -> 9 -> 10 |

**On re-entry:** ALL inner loop counters reset to 0. Signoff-rejection-cycle increments.
**Cycle 2 -> CIRCUIT BREAKER:** escalate to user (continue, re-scope, split, cancel)

Track: `signoff-rejection-cycle: N/2`, per-gate status

**States: QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF**

## Phase 11: Deployment (max 2 attempts)
@infra: pre-checks -> merge PR -> deploy -> health check -> smoke test.
**On failure — triage first:**
- Config/env -> @infra fixes -> retry directly
- Code bug -> @debugger hotfix -> fast-track Phase 6->7->8->11
- Infra issue -> @infra resolves -> retry
- Unknown -> `/rollback`, escalate to user
Attempt 2 fails -> rollback + escalate.

Track: `deploy-loop: N/2`, `last-deploy-failure`, `rollback-executed`

**State: DEPLOYING**

## Phase 12: Post-Deploy
Monitor 30min (hotfix: 15min). Close issues. Notify stakeholders.
Production bugs: P0/P1 -> new hotfix workflow, P2/P3 -> new task.

**State: MONITORING -> CLOSED**

## Phase 13: Execution Report
Generated by the orchestrator (NOT the Stop hook — Stop hook handles session-level reports, Phase 13 handles workflow-level reports):
- **Per-phase reports:** Generated after each phase completes, saved to `.claude/reports/executions/TASK-{id}_phase-{N}_{timestamp}.md`
- **Final cumulative report:** Generated once after Phase 12, saved to `.claude/reports/executions/TASK-{id}_final.md`
- **Stop hook:** Generates session-level snapshot only — does NOT duplicate Phase 13

---

## ON_HOLD Management
- **Enter:** Any sign-off gate defers, or user explicitly pauses
- **State preserved:** Task stays at its current phase, all loop counters preserved
- **Resume:** `/workflow resume TASK-id` — re-enters at the saved phase
- **Auto-reminder:** If ON_HOLD > 7 days, session-start hook warns user
- **Cancel threshold:** If ON_HOLD > 30 days, prompt user to cancel or resume

## CANCELLED Cleanup
When `/workflow cancel TASK-id`:
1. Set status to CANCELLED in task record
2. Close any open PR: `gh pr close {pr_number}`
3. Delete feature branch: `git branch -D {branch}` (local only — prompt for remote)
4. Clean up worktrees: `git worktree remove` if any exist
5. Log cancellation in task timeline with reason
6. Task record stays in `.claude/tasks/` for historical reference

## Task State Machine
```
BACKLOG -> INTAKE -> ANALYZING -> DESIGNING -> APPROVED -> DEVELOPING
  -> DEV_TESTING -> REVIEWING -> CI_PENDING -> QA_TESTING
  -> QA_SIGNOFF -> BIZ_SIGNOFF -> TECH_SIGNOFF
  -> DEPLOYING -> MONITORING -> CLOSED

Special states (from ANY active state):
  -> BLOCKED (requires depends-on resolution or manual unblock)
  -> ON_HOLD (user/product-owner deferred, resume with /workflow resume)
  -> CANCELLED (cleanup executed, terminal state)

Reverse transitions (rejection routing):
  QA_SIGNOFF -> DEVELOPING (QA rejects)
  BIZ_SIGNOFF -> APPROVED (reqs wrong) or DEVELOPING (UI wrong)
  TECH_SIGNOFF -> DESIGNING (architecture) or DEVELOPING (perf/tests)
```

## Circuit Breaker Summary
| Loop | Max | Scope | Hotfix Max |
|------|-----|-------|------------|
| Dev-Test (P6) | 5 | Global | 3 |
| Review (P7) | 3 | Global | 2 |
| CI Fix (P8) | 3 | Global | 2 |
| QA Bug (P9) | 3/bug, 15 total | Per-bug | 2/bug, 6 total |
| Sign-off (P10) | 2 cycles | Global | 1 cycle |
| Deploy (P11) | 2 | Global | 1 |

Any breaker tripped -> STOP -> escalate to user: continue, re-plan, reduce scope, cancel, assign to human.
