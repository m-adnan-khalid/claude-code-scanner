---
name: workflow
description: Full SDLC workflow orchestrator. Coordinates agents from task intake through production deployment. Use when starting new work, checking task status, or managing the development lifecycle.
user-invocable: true
disable-model-invocation: true
context: fork
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Agent
argument-hint: "new|status|plan|dev|review|qa|deploy|resume [description|TASK-id] [--hotfix] [--spike]"
effort: high
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @process-coach, @gatekeeper]
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

### Subtask Creation & Management
- **When:** @team-lead creates subtasks during Phase 1 (intake) or Phase 3 (after design approval)
- **Who:** @team-lead owns subtask creation; agents own subtask execution
- **Regeneration:** If Phase 10 rejects back to Phase 3+, @team-lead regenerates affected subtasks
- **VERIFIED status:** Set by the NEXT phase's agent when they confirm the output (e.g., @tester verifies dev subtask by confirming tests pass)
- **BLOCKED subtask:** Unblock via `/workflow unblock TASK-{id} subtask-{N} "reason"` — only @team-lead can unblock
- **Evidence standards:**
  - Design subtasks: design doc link + review notes
  - Implementation subtasks: code committed + lint clean
  - Test subtasks: test results + coverage numbers
  - Review subtasks: review comments addressed count
  - Deploy subtasks: health check results + monitoring URL

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
| Code Review (R1) | @reviewer | Quality, conventions, correctness — first of dual reviewers |
| Code Quality | @code-quality | Design patterns, SOLID, duplication, static analysis |
| Code Review (R2) | @security | Security review — second of dual reviewers |
| Investigation | @explorer | Codebase exploration, impact mapping |
| Infrastructure | @infra | Docker, CI/CD, deployment |
| Mobile Dev | @mobile | iOS, Android, Flutter, React Native |
| Database | @database | Schema design, migrations, query optimization |
| QA Automation | @qa-automation | E2E testing, visual verification, deploy & test |
| Change Validation | @gatekeeper | Auto-approve/block changes, regression detection |
| Ideator | @ideator | Brainstorming, idea refinement (pre-dev Phase 1) |
| Strategist | @strategist | Product strategy, specs, feature maps (pre-dev Phase 2-3) |
| Scaffolder | @scaffolder | Project generation, boilerplate (pre-dev Phase 6) |
| UX Designer | @ux-designer | User flows, wireframes, IA (pre-dev Phase 2, 5) |
| Process Coach | @process-coach | SDLC methodology selection and configuration |
| Docs Writer | @docs-writer | READMEs, API docs, ADRs, changelogs |

## Pre-Development Context (Mandatory Bridge)
If `.claude/project/PROJECT.md` exists and has status `READY_FOR_DEV`, the orchestrator MUST read ALL project docs before starting Phase 1. This is NOT optional — skipping causes agents to redesign what was already decided.

**Required reads (in order):**
1. `.claude/project/DOMAIN_MODEL.md` — bounded contexts, glossary, business rules (prevents domain violations)
2. `.claude/project/ARCHITECTURE.md` — reference in Phase 3 instead of designing from scratch
3. `.claude/project/TECH_STACK.md` — technology constraints and rationale
4. `.claude/project/PRODUCT_SPEC.md` — use for acceptance criteria baseline in Phase 4
5. `.claude/project/BACKLOG.md` — pre-populate scope/complexity in Phase 1, write `<!-- task-id: TASK-{id} -->` to link
6. `.claude/project/DEPLOY_STRATEGY.md` — reference in Phase 11 for deployment approach
7. `.claude/project/FEATURES_BUILT.md` — if exists, inherit conventions from previous features

**What to pass to Phase 1 agent:** Domain glossary terms, API patterns from architecture, tech constraints, and any cross-feature conventions from FEATURES_BUILT.md.

If these files don't exist, the workflow proceeds normally (backward compatible).

**Validation (only when PROJECT.md status = READY_FOR_DEV):**
If project docs exist but contain only template placeholders (e.g., `{project-name}`), warn:
"Project documents appear incomplete. Run `/clarify --before-dev` to validate requirements."
This is a warning, not a blocker — user can proceed or fix first.

## Cross-Feature Context
When starting a new workflow and completed features exist (previous TASK-{id} files with status CLOSED):
1. Read each completed task's Phase 5 details for: files created, API patterns, component patterns, shared code
2. **Build the Previous Features Summary** and save to `.claude/project/FEATURES_BUILT.md`:
   ```markdown
   # Features Built
   Last updated: {ISO timestamp}

   ## TASK-{id}: {title}
   - **APIs:** endpoints created, error format, pagination pattern
   - **Components:** shared components/services created
   - **Test patterns:** testing approach, coverage strategy
   - **Key files:** file paths to reference (not redesign)
   - **Decisions:** key architectural decisions made during this feature
   ```
3. Inject this summary into Phase 1 context so the new task inherits conventions
4. **On Phase 13 (CLOSED):** Append the completed task's summary to `FEATURES_BUILT.md`

This file is the cross-feature memory — it ensures consistency across features built in sequence.
If `FEATURES_BUILT.md` already exists, READ it at Phase 1 instead of re-scanning all closed tasks.

## Backlog Synchronization
When a workflow reaches Phase 13 (CLOSED) and `.claude/project/BACKLOG.md` exists:

**Trigger:** The workflow orchestrator itself performs this sync as its FINAL action in Phase 13,
BEFORE generating the execution report. This is NOT a hook — it runs inline in the workflow.

**Steps:**
1. Find the feature entry in BACKLOG.md using the `task-id` field (exact match on TASK-{id}).
   If no `task-id` field exists, fall back to title fuzzy match.
   At Phase 1, when linking to a backlog entry, WRITE the task-id into BACKLOG.md: `<!-- task-id: TASK-{id} -->`
2. Update its status: `IN_PROGRESS` → `COMPLETE`
3. Update PROJECT.md "Features In Development" table with TASK-id + completion date
4. Append feature summary to `.claude/project/FEATURES_BUILT.md` (cross-feature context)
5. Check if all Must-Have features are now COMPLETE:
   - If YES → output: "All MVP features complete! Run /launch-mvp to finalize."
   - If NO → output: "Feature complete. N/M MVP features done. Run /mvp-kickoff next."

**If no match found:** Warn: "Could not find matching feature in BACKLOG.md for TASK-{id}. Update manually."
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
  next_agent_needs: |
    What the receiving agent must know/verify before starting
  iteration: N/max (if in a loop)
```
The `next_agent_needs` field is MANDATORY. It tells the next agent exactly what to check, preventing context rebuilds.

## Context Budget Protocol
**Note:** This workflow runs in `context: fork`. The `/context-check` skill measures the fork's own context, not the parent. Between heavy phases, compact the fork's context:
1. Update task record with current phase status (persisted to disk)
2. If responses feel slow or truncated: `/compact "focus on TASK-{id} Phase {N}"`
3. After compaction: re-read task file to restore loop state

---

## Prerequisite Validation (Mandatory Phase-Entry Briefing)
Before advancing ANY phase, the orchestrator MUST perform this checklist:
1. **Task record exists:** `.claude/tasks/TASK-{id}.md` must exist and be readable.
2. **Dependencies:** If task has `depends-on: TASK-X`, verify TASK-X has reached at least Phase 8 (CI_PENDING). If not, BLOCK with reason.
3. **Previous phase exit criteria met:** Read task record, confirm previous phase output sections are populated.
4. **Loop state loaded:** Read `## Loop State` section and pass current counters to the entering agent.
5. **Last handoff consumed:** Read the last HANDOFF entry from the Handoff Log. Pass its `next_agent_needs` to the entering agent.
6. **Artifacts validated:** Verify all files listed in the last handoff's `artifacts` still exist (Glob check).
7. **Execution report checked:** If previous phase generated an execution report, check for `hallucination_flags` or `regression_flags` — block entry if either is non-clean.

**This checklist prevents agents from rebuilding context.** The orchestrator passes all extracted context as part of the agent invocation prompt, so the agent starts with full situational awareness.

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
- If any breaker trips: execute hotfix rollback protocol:
1. `/rollback deploy` — revert to pre-hotfix state
2. `git revert {hotfix-commit}` — revert the code change
3. Log failure in task record with root cause
4. Escalate to user: "Hotfix failed after {N} attempts. Options: (1) retry with different approach, (2) manual fix, (3) accept the bug temporarily"

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

## Phase 0: Requirement Validation (MANDATORY for features)
**This phase ensures requirements are clear BEFORE any code work begins.**
Skip condition: type == hotfix OR type == bugfix (these have known requirements by definition).

### Step 0a: Requirement Gathering
If user provided just a description (not a story):
1. Ask structured clarifying questions:
   - **WHAT:** What exactly should change? (specific behavior, not vague goals)
   - **WHO:** Who is the user? What role/persona?
   - **WHY:** What problem does this solve? What's the business value?
   - **SCOPE:** What's explicitly OUT of scope?
   - **DONE:** How will we know it's done? (observable behavior)
2. If any answer is vague → ask follow-up. Do NOT proceed with "I'll figure it out."
3. If `.claude/project/PRODUCT_SPEC.md` exists → cross-reference user journeys for this feature

### Step 0b: Story Creation
Create a proper story (or verify one exists):
1. **User Story:** "As a {role}, I want {action}, So that {outcome}"
2. **Acceptance Criteria:** GIVEN/WHEN/THEN format (minimum 3: happy path, edge case, error case)
3. **Out of Scope:** Explicitly list what this story does NOT include
4. If `.claude/project/BACKLOG.md` exists → link to backlog entry with `<!-- task-id: TASK-{id} -->`
5. Validate ACs against PRODUCT_SPEC.md user journeys (if exists) — flag gaps

### Step 0c: Gap Analysis & Impact Preview
Before creating the task record, surface risks:
1. **Ambiguities:** List anything unclear. If any exist → ask user, WAIT for answer.
2. **Assumptions:** List what you're assuming. User must confirm each.
3. **Dependencies:** Other features/systems this depends on.
4. **Impacted areas:** Quick scan of likely affected files/modules (lightweight, not full Phase 2).
5. **Risk flags:** Auth changes? DB schema changes? Public API changes? Flag for user.

### Step 0d: User Confirmation Gate
Present the story + ACs + gaps + assumptions to the user:
- "Here's what I understand. Is this correct?"
- User must explicitly confirm before Phase 1 begins.
- If user says "not quite" → loop back to Step 0a with their feedback.
- **Do NOT skip this gate.** Unclear requirements caught here save 10x rework at Phase 10.

### Phase 0 Exit Criteria
- [ ] Story created with GIVEN/WHEN/THEN acceptance criteria
- [ ] All ambiguities resolved (none left as "TBD")
- [ ] Assumptions confirmed by user
- [ ] Impact areas identified (even if lightweight)
- [ ] User explicitly confirmed "yes, proceed"

**State: REQUIREMENTS_CLEAR**

---

## Phase 1: Task Intake
**Drift check (automatic):** Run `/sync --check` silently. If drift detected:
- Minor drift (1-3 items): log warning in task record, continue
- Major drift (4+ items or tech stack change): prompt user "Environment may be stale. Run `/sync --fix` before continuing? (y/N)"
- If user says yes: run `/sync --fix`, then continue intake
- If user says no: continue with warning logged

Classify type (feature/bugfix/refactor/hotfix/spike), scope (frontend/backend/fullstack/infra), complexity (small/medium/large). Log to `.claude/tasks/TASK-{id}.md`. Include the story + ACs from Phase 0 in the task record.

### Branch Creation (except spike)
1. Identify the base branch: `main` or `dev` (read from CLAUDE.md or git config)
2. Pull latest: `git pull origin {base-branch}`
3. Create feature branch: `git checkout -b {type}/TASK-{id}/{short-description}` (e.g., `feature/TASK-042/user-auth`)
4. Log branch name in task record under `## Git` section
5. All development work happens on this branch — never commit directly to `main`/`dev`

**Branch naming convention:**
- Features: `feature/TASK-{id}/{slug}`
- Bugfixes: `fix/TASK-{id}/{slug}`
- Hotfixes: `hotfix/TASK-{id}/{slug}`
- Refactors: `refactor/TASK-{id}/{slug}`

### Phase 1 Exit Criteria
- [ ] Task record created at `.claude/tasks/TASK-{id}.md`
- [ ] Story + acceptance criteria included (from Phase 0)
- [ ] Type, scope, complexity classified
- [ ] Branch created and logged in task record (except spike)
- [ ] Drift check completed

**State: INTAKE**

## Phase 2: Impact Analysis
Run @explorer + @security in PARALLEL (spike: @explorer only).
- Files affected, blast radius, test coverage, security flags
- Risk: LOW/MEDIUM/HIGH/CRITICAL
- If `.claude/project/` exists: check impact on PRODUCT_SPEC, ARCHITECTURE, DOMAIN_MODEL
- Exit: impact report generated

**If risk == HIGH or CRITICAL:** Mandatory Phase 3 (no auto-skip). Surface to user: "High risk detected. Architecture review required."

**State: ANALYZING**

## Phase 3: Architecture Review
**Skip condition (automatic):** Skip if ALL of: complexity == small AND risk == LOW AND type != refactor.
If skipped, log in task record: "Phase 3 skipped: small + LOW risk."
If NOT skipped: @architect designs solution. Then @code-quality reviews the design — recommends design patterns (SOLID, GoF), defines quality gates, and flags scalability concerns. User approves before proceeding.

**State: DESIGNING -> APPROVED (on user approval)**

## Phase 4: Business Analysis
@product-owner validates acceptance criteria from Phase 0 against implementation plan:
- Are the ACs from Phase 0 still correct given the architecture from Phase 3?
- Any new edge cases discovered during impact analysis or design?
- @product-owner updates ACs if needed. User reviews.
**If user rejects criteria:** @product-owner revises based on feedback → user re-reviews (max 2 iterations).
**If iteration 2 rejected:** escalate to @team-lead for mediation.
User confirms.
**Skip condition:** Skip if type == hotfix OR type == refactor OR type == tech-debt.

**State: APPROVED (after user confirms criteria)**

## Pre-Phase 5 Gate: Task Brief (MANDATORY)
Before development starts, create a Task Brief from `.claude/templates/task-brief.md`:
1. Create `.claude/tasks/BRIEF-{TASK-id}.md`
2. Fill ALL sections: Instruction, Understanding, Execution Plan, Tools, Boundaries
3. **Section 2 (Understanding) MUST have:**
   - Goal: clear definition of done (from Phase 0 ACs)
   - Assumptions: all confirmed by user in Phase 0
   - Ambiguities: must be "None" — if any remain, STOP and ask user
4. Only proceed to Phase 5 when brief is complete and Section 2 shows zero ambiguities

The `audit-logger` hook will auto-log every tool call to the brief's Audit Log.
After task completion, append the Completion Report.

**State: BRIEFED**

## Pre-Phase 5 Gate: Smoke Test Baseline
Before development starts, run the existing test suite to establish a baseline:
1. Run `npm test` / `pytest` / `go test` (auto-detected from project)
2. The `test-results-parser` hook auto-saves results to `.claude/reports/test-runs/latest.json`
3. Copy to baseline: `cp .claude/reports/test-runs/latest.json .claude/reports/test-runs/baseline.json`
4. This baseline is used for regression detection throughout Phase 5-9
5. Every subsequent test run is compared against this baseline by the hook

**If baseline tests already fail:** Log count in task record, these are pre-existing failures (not regressions).

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

**Agent timeout handling (maxTurns):** If an agent hits maxTurns during Phase 5:
1. `subagent-tracker` hook saves a checkpoint with partial work completed
2. Orchestrator checks the checkpoint — if >70% of subtasks are done, re-invoke with remaining scope only
3. If <70% done, split the work: create new subtasks for the incomplete portion and re-invoke
4. Each re-invocation counts as +1 loop iteration toward the Phase 6 circuit breaker
5. **Never re-invoke with the full original scope** — always narrow to what's left

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

**Real testing skills available:** `/coverage-track` (parse coverage + enforce thresholds)

**Automatic regression detection:** The `test-results-parser` hook compares every test run against the baseline saved in Pre-Phase 5. If regressions are detected (new failures, coverage drop, tests removed), a `=== REGRESSION DETECTED ===` warning is shown. **Do NOT advance to Phase 7 while regressions exist.** Fix them first.

**State: DEV_TESTING**

## Phase 7: Code Review (Dual Approval Required)
Three-stage review process — ALL must approve before PR is created:

### Stage 1: Quality + Domain Gate
@code-quality audits FIRST (SOLID violations, duplication, complexity, design pattern compliance, scalability).
- Score < 75 -> route SOLID/pattern fixes to dev agent BEFORE human-style review
- Score >= 75 -> proceed to domain check

**Domain compliance check** (if DOMAIN_MODEL.md exists):
- Verify new code uses glossary terms consistently (not aliases or abbreviations)
- Verify entities created match domain model or are flagged as "new entity — add to domain model at Phase 13"
- Verify business rules in code align with DOMAIN_MODEL.md rules section
- If domain violations found → warn (not block), log for Phase 13 domain sync
- Proceed to Stage 2

### Stage 2: Dual Code Review (PARALLEL)
Two independent reviewers must BOTH approve:
- **@reviewer** (Reviewer 1) — code quality, conventions, correctness, maintainability
- **@security** (Reviewer 2) — security review, vulnerability check, auth/authz validation

**Both approvals required.** If either requests changes:
1. Route fixes by category to appropriate dev agent
2. Only the rejecting reviewer(s) re-review (approved reviewer's verdict preserved)
3. Stricter verdict wins if split on severity

### Stage 3: Review Verdict
| @reviewer | @security | Result |
|-----------|-----------|--------|
| APPROVE | APPROVE | -> EXIT to Phase 8 (PR Creation) |
| APPROVE | REQUEST_CHANGES | -> fix security issues, @security re-reviews |
| REQUEST_CHANGES | APPROVE | -> fix code issues, @reviewer re-reviews |
| REQUEST_CHANGES | REQUEST_CHANGES | -> fix all issues, both re-review |

**Loop (max 3 iterations):**
1. Both APPROVE + code-quality score >= 75 -> EXIT to Phase 8
2. REQUEST_CHANGES -> route fixes -> partial re-review
3. **Agent timeout:** Reviewer timeout = count as iteration, re-invoke
4. Iteration 3 -> CIRCUIT BREAKER

Track: `review-loop: N/3`, `reviewer-1-status`, `reviewer-2-status`, `code-quality-score`, `open-comments`

**State: REVIEWING**

## Phase 8: PR Creation + CI
Dev agent creates the Pull Request after dual review approval:

### PR Creation Steps
1. **Push branch:** `git push -u origin {branch-name}`
2. **Create PR:** `gh pr create --base {base-branch} --title "TASK-{id}: {title}" --body "{pr-body}"`
3. **PR body must include:**
   - Summary of changes (from task record)
   - Link to task: `TASK-{id}`
   - Test evidence: coverage %, test results
   - Review status: both reviewers approved
   - Acceptance criteria checklist (from Phase 4)
4. **Label PR:** type (feature/fix/refactor), scope (frontend/backend/fullstack)
5. **Log PR URL** in task record under `## Git` section

### CI Pipeline
Wait for CI to complete. **Loop (max 3 iterations):**
1. CI passes -> EXIT to Phase 9 (QA Testing)
2. CI fails -> classify failure -> route to fix agent
3. Fix -> `git push` -> CI re-runs
4. Substantive fix (logic change): flag for Phase 7 re-review (back to dual review)
5. **Agent timeout:** CI fix agent timeout = count as iteration
6. Iteration 3 -> CIRCUIT BREAKER

Track: `ci-fix-loop: N/3`, `pr-url`, `pr-number`, `last-ci-failure`, `fix-agent`

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

**Real testing skills for Phase 9:**
- `/api-test` — verify all API endpoints with real HTTP requests
- `/e2e-browser` — verify critical user flows in real headless browser
- `/e2e-mobile` — verify mobile flows on real emulator/device (if applicable)
- `/visual-regression` — detect CSS/layout regressions via screenshot comparison
- `/load-test` — verify performance under concurrent load
- `/coverage-track` — verify coverage thresholds met

**Regression enforcement:** After every bug fix, @tester runs full regression suite. The `test-results-parser` hook auto-compares against baseline. Any regression = new P1 bug filed immediately. Phase 9 cannot advance to Phase 10 with regressions.

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

## Phase 11: PR Merge + Deployment (max 2 attempts)

### Step 1: @team-lead Merges PR
Only @team-lead can merge — this is the final gate after all sign-offs:
1. Verify all sign-offs obtained (QA + Business + Tech from Phase 10)
2. Verify CI is green on the PR
3. Merge PR: `gh pr merge {pr-number} --squash --delete-branch` (or `--merge` per project convention)
4. Log merge commit SHA in task record
5. **If merge conflicts:**
1. @team-lead resolves conflicts following `.claude/docs/conflict-resolution-protocol.md`
2. If > 5 files conflicted: @architect reviews resolution for correctness
3. Push resolved code, wait for CI to pass
4. If CI fails after resolution: re-triage (may need Phase 7 re-review for substantive changes)
5. Then merge

### Step 2: @infra Deploys
@infra: pre-checks -> deploy -> health check -> smoke test.
**On failure — triage first:**
- Config/env -> @infra fixes -> retry directly
- Code bug -> @debugger hotfix -> fast-track Phase 6->7->8->11
- Infra issue -> @infra resolves -> retry
- Unknown -> `/rollback`, escalate to user
Attempt 2 fails -> rollback + escalate.

Track: `deploy-loop: N/2`, `merge-sha`, `last-deploy-failure`, `rollback-executed`

**State: DEPLOYING**

## Phase 12: Post-Deploy
Monitor 30min (hotfix: 15min). Run smoke tests against production:
1. @infra runs health check endpoints
2. @tester runs smoke test suite (subset of E2E tests targeting critical paths)
3. If smoke tests fail → immediate `/rollback deploy TASK-{id}` → new hotfix
4. Close issues. Notify stakeholders.
Production bugs: P0/P1 -> new hotfix workflow, P2/P3 -> new task.

**State: MONITORING -> CLOSED**

## Phase 13: Domain Sync + Execution Report

### Step 1: Domain Model Update (if `.claude/project/DOMAIN_MODEL.md` exists)
Scan the code written in this feature for domain changes:
1. **New entities:** Check models/schemas/types created in Phase 5 that aren't in DOMAIN_MODEL.md
2. **New business rules:** Check validation logic, guards, constraints added that aren't documented
3. **New glossary terms:** Check naming patterns for domain terms not in `.claude/rules/domain-terms.md`
4. **Updated relationships:** Check if entity relationships changed (new FK, removed field, etc.)

**If changes found:**
- Append to DOMAIN_MODEL.md under `## Changelog`:
  ```
  ### TASK-{id}: {title} ({date})
  - Added entity: {name} — {description}
  - New rule: {rule} — enforced in {file}
  - Updated: {entity} relationship to {entity} changed from 1:1 to 1:N
  ```
- Update `.claude/rules/domain-terms.md` with new glossary terms
- Append domain changes to `.claude/project/FEATURES_BUILT.md`

**If no changes:** Log "No domain changes detected" in task record.

**Skip condition:** Skip if no DOMAIN_MODEL.md exists (non-pre-dev projects).

### Step 2: Execution Report
Generated by the orchestrator (NOT the Stop hook — Stop hook handles session-level reports, Phase 13 handles workflow-level reports):
- **Per-phase reports:** Generated after each phase completes, saved to `.claude/reports/executions/TASK-{id}_phase-{N}_{timestamp}.md`
- **Final cumulative report:** Generated once after Phase 12, saved to `.claude/reports/executions/TASK-{id}_final.md`
- **Stop hook:** Generates session-level snapshot only — does NOT duplicate Phase 13

---

## Blocked State Management
- **Entry:** Task enters BLOCKED when `depends-on: TASK-X` and TASK-X has not reached Phase 8 (CI_PENDING)
- **Auto-unblock:** Session-start hook checks dependencies — when TASK-X reaches Phase 8+, BLOCKED task auto-transitions to its previous state
- **Manual unblock:** `/workflow unblock TASK-{id} "reason"` — @team-lead can force-unblock with justification
- **Timeout:** If BLOCKED > 14 days, session-start hook warns user. If > 30 days, suggest: cancel, re-scope without dependency, or escalate
- **Blocked subtasks:** Individual subtasks can be BLOCKED independently — phase still advances if non-blocked subtasks are DONE

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
BACKLOG -> REQUIREMENTS_CLEAR -> INTAKE -> ANALYZING -> DESIGNING -> APPROVED -> DEVELOPING
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

## Definition of Done
- [ ] All subtasks for every phase are DONE with evidence
- [ ] All tests pass, coverage >= baseline
- [ ] Code review approved, all critical comments addressed
- [ ] CI green, no P0/P1 bugs open
- [ ] All sign-offs obtained (tech + QA + business)
- [ ] Deployment successful, health checks green
- [ ] Monitoring period passed, no regressions
- [ ] Execution report generated with metrics
All criteria must pass before task status moves to CLOSED.

## Next Steps
- **Task complete:** `/execution-report` — generate post-task analytics
- **Start next task:** `/mvp-kickoff next` or `/workflow new "next task"`
- **Check progress:** `/task-tracker status` or `/mvp-status`
- **Resume paused task:** `/workflow resume TASK-{id}`
- **Jump to phase:** `/workflow [plan|dev|review|qa|deploy] TASK-{id}`

## Rollback & Undo
- **Revert deployment:** `/rollback deploy TASK-{id}`
- **Revert to previous phase:** `/rollback phase TASK-{id}`
- **Revert code changes:** `/rollback code TASK-{id}` (git revert)
- **Undo specific file edit:** Check `_changes.log` for `pre:{hash}` entries, then `git show {hash} > file` to restore
- **Cancel task:** `/workflow cancel TASK-{id}` — moves to CANCELLED state

## Disaster Recovery
When task state is corrupted, lost, or inconsistent:

1. **State reconstruction:** Read snapshots from `.claude/reports/executions/TASK-{id}_*.json` (sorted by timestamp) to rebuild timeline
2. **Changes log:** `.claude/tasks/TASK-{id}_changes.log` has every file edit, tool failure, agent completion, and session failure
3. **Git history:** `git log --all --oneline` shows all commits on feature branch — code is never lost if committed
4. **Pre-compact snapshots:** `.claude/reports/executions/TASK-{id}_precompact_*.json` capture loop state before compaction
5. **Interrupted snapshots:** `*_interrupted_*.json` capture state at session failure with recovery action

**Recovery steps:**
1. Run `/workflow status TASK-{id}` to see current state
2. If task file missing: reconstruct from latest snapshot + git log
3. If loop state lost: read latest `_precompact_` or `_snapshot_` JSON
4. If changes unclear: read `_changes.log` for full edit history with git hashes
5. If agent timed out: check `_agent_timeout_*.json` for what was in progress

## Resilience Events (auto-handled by hooks)
| Event | Hook | What Happens |
|-------|------|-------------|
| Session crash | `stop-failure-handler` | Saves recovery manifest, marks timeline as INTERRUPTED |
| Agent timeout | `subagent-tracker` | Saves checkpoint, warns user, counts as +1 loop iteration |
| Tool failure x3 | `tool-failure-tracker` | Escalates after 3 consecutive failures of same tool |
| Context ~95% | `pre-compact-save` | Saves loop state + handoff snapshot before compaction |
| Post-compaction | `post-compact-recovery` | Restores loop state, handoff, bugs, resume action |
| Session start | `session-start` | Detects crashed tasks (>6h stale), orphaned subtasks, hook health |
| Session stop | `execution-report` | Saves comprehensive snapshot with all loop/agent/failure counts |
| File edit | `track-file-changes` | Logs git hash before edit for per-file undo capability |
| Hook failure | All hooks | Logged to `.claude/reports/hook-failures.log` |
