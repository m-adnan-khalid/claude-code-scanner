---
name: create-story
description: Create a properly structured user story, bug, or defect with role-based subtasks for all participants. Generates Jira-style format with BDD acceptance criteria, per-role DoD checklists, and auto-assigned subtasks for all 14 lifecycle agents.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"story description" [--type feature|bug|defect|refactor|hotfix] [--scope frontend|backend|fullstack|mobile|infra] [--priority P0|P1|P2|P3]'
roles: [PM, TechLead, CTO, Architect, BackendDev, FrontendDev, FullStackDev, QA]
agents: [@product-owner, @team-lead, @strategist]
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


# Create Story: $ARGUMENTS

## Step 1 — Check Before Creating

If a task record already exists for this work, check whether it contains:
- A proper user story statement (As a / I want / So that) OR bug description
- Acceptance Criteria in BDD format (Given / When / Then)
- Subtasks for ALL participating agents

If ALL exist → respond: "This story is already properly structured. No changes needed."
If ANY missing → proceed to Step 2.

## Step 2 — Classify & Detect Context

Read CLAUDE.md and `.claude/project/TECH_STACK.md` to understand:
- Language, framework, tech stack
- Project architecture patterns
- Existing test patterns

Classify the request:
- **Type:** feature | bug | defect | refactor | hotfix | tech-debt | spike
- **Scope:** frontend-only | backend-only | fullstack | mobile | infrastructure | cross-cutting
- **Complexity:** small (<3 files) | medium (3-10 files) | large (10+ files)
- **Priority:** P0-critical | P1-high | P2-medium | P3-low

## Step 3 — Generate Main Story

Create `.claude/tasks/TASK-{next-id}.md` with this format:

```markdown
---
id: TASK-{id}
title: {Action-oriented, concise — max 10 words}
type: {feature|bug|defect|refactor|hotfix}
scope: {frontend-only|backend-only|fullstack|mobile|infrastructure}
complexity: {small|medium|large}
priority: {P0-critical|P1-high|P2-medium|P3-low}
status: INTAKE
story-points: {1|2|3|5|8|13}
labels: {comma-separated: frontend, backend, api, auth, ui, db, infra}
branch: {type}/TASK-{id}/{slug}
pr: pending
assigned-to: @team-lead
depends-on: {TASK-id or none}
created: {ISO timestamp}
updated: {ISO timestamp}
---

# TASK-{id}: {title}

## User Story
As a {specific user role},
I want to {perform a specific action},
So that {I achieve a specific outcome/value}.

## Description
{2-4 sentences: background context, business motivation, constraints, dependencies}

## Acceptance Criteria (BDD)

### AC-1: {Label — happy path}
**Given** {a specific precondition},
**When** {the user performs an action},
**Then** {the expected result occurs}.

### AC-2: {Label — secondary flow}
**Given** {precondition},
**When** {action},
**Then** {expected result}.

### AC-3: {Label — edge case / error handling}
**Given** {precondition},
**When** {action with invalid input or error condition},
**Then** {proper error handling occurs}.

{Add as many ACs as needed: happy paths, edge cases, error states, security, a11y}

## Dependencies
{Related stories, APIs, designs, external systems — or "None"}

## Current Status
- Phase: 1 (Intake)
- State: INTAKE
- Progress: 0%
- Next Action: @team-lead decompose subtasks
```

## Step 4 — Generate Role-Based Subtasks

**CRITICAL: Only generate subtasks for agents that ACTUALLY participate in this scope.**
Do NOT include frontend subtasks in a backend-only story. Do NOT include backend subtasks in a frontend-only story. Match subtasks to the REAL work.

Pick the correct subtask table based on scope:

### If scope = `backend-only`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Story breakdown & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Architect | Architecture & design review | @architect | PENDING | 3 | 1 | 2 | — |
| 3 | Product Owner | AC validation & biz sign-off | @product-owner | PENDING | 4,10 | 1 | 1 | — |
| 4 | Backend Dev | Backend implementation | @api-builder | PENDING | 5 | 2 | {pts} | — |
| 5 | Database | Schema & migrations | @database | PENDING | 5 | 2 | {pts} | — |
| 6 | Tester | Unit + integration tests | @tester | PENDING | 6 | 4,5 | {pts} | — |
| 7 | Code Quality | Quality audit | @code-quality | PENDING | 7 | 4 | 1 | — |
| 8 | Reviewer | Code review (R1) | @reviewer | PENDING | 7 | 6 | 1 | — |
| 9 | Security | Security review (R2) | @security | PENDING | 7 | 6 | 1 | — |
| 10 | QA Lead | QA plan & sign-off | @qa-lead | PENDING | 9,10 | 8,9 | 2 | — |
| 11 | QA Automation | API/E2E automation | @qa-automation | PENDING | 9 | 8,9 | 3 | — |
| 12 | Infra | Deployment | @infra | PENDING | 11 | 10 | 2 | — |
| 13 | Docs Writer | API docs update | @docs-writer | PENDING | 12 | 12 | 1 | — |
```
**No UX Designer. No Frontend Dev.** Only agents doing real backend work.
Skip #5 (Database) if no schema changes needed.

### If scope = `frontend-only`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Story breakdown & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | UX Designer | UI/UX design & wireframes | @ux-designer | PENDING | 3 | 1 | {pts} | — |
| 3 | Product Owner | AC validation & biz sign-off | @product-owner | PENDING | 4,10 | 1 | 1 | — |
| 4 | Frontend Dev | Frontend implementation | @frontend | PENDING | 5 | 2 | {pts} | — |
| 5 | Tester | Component + E2E tests | @tester | PENDING | 6 | 4 | {pts} | — |
| 6 | Code Quality | Quality audit | @code-quality | PENDING | 7 | 4 | 1 | — |
| 7 | Reviewer | Code review (R1) | @reviewer | PENDING | 7 | 5 | 1 | — |
| 8 | Security | Security review (R2) | @security | PENDING | 7 | 5 | 1 | — |
| 9 | QA Lead | QA plan & sign-off | @qa-lead | PENDING | 9,10 | 7,8 | 2 | — |
| 10 | QA Automation | Browser E2E automation | @qa-automation | PENDING | 9 | 7,8 | 3 | — |
| 11 | Infra | Deployment | @infra | PENDING | 11 | 9 | 2 | — |
| 12 | Docs Writer | UI docs update | @docs-writer | PENDING | 12 | 11 | 1 | — |
```
**No Backend Dev. No Database. No Architect** (unless structural change).
Add Architect (#2) only if component architecture decision is needed.

### If scope = `fullstack`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Story breakdown & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Architect | Architecture & design review | @architect | PENDING | 3 | 1 | 2 | — |
| 3 | UX Designer | UI/UX design | @ux-designer | PENDING | 3 | 1 | {pts} | — |
| 4 | Product Owner | AC validation & biz sign-off | @product-owner | PENDING | 4,10 | 1 | 1 | — |
| 5 | Backend Dev | Backend implementation | @api-builder | PENDING | 5 | 2 | {pts} | — |
| 6 | Frontend Dev | Frontend implementation | @frontend | PENDING | 5 | 2,3 | {pts} | — |
| 7 | Database | Schema & migrations | @database | PENDING | 5 | 2 | {pts} | — |
| 8 | Tester | Unit + integration + E2E tests | @tester | PENDING | 6 | 5,6 | {pts} | — |
| 9 | Code Quality | Quality audit | @code-quality | PENDING | 7 | 5,6 | 1 | — |
| 10 | Reviewer | Code review (R1) | @reviewer | PENDING | 7 | 8 | 1 | — |
| 11 | Security | Security review (R2) | @security | PENDING | 7 | 8 | 1 | — |
| 12 | QA Lead | QA plan & sign-off | @qa-lead | PENDING | 9,10 | 10,11 | 2 | — |
| 13 | QA Automation | Full E2E automation | @qa-automation | PENDING | 9 | 10,11 | 3 | — |
| 14 | Infra | Deployment | @infra | PENDING | 11 | 12 | 2 | — |
| 15 | Docs Writer | Documentation update | @docs-writer | PENDING | 12 | 14 | 1 | — |
```
Skip #7 (Database) if no schema changes. Skip #3 (UX) if no UI changes.

### If scope = `mobile`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Story breakdown & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Architect | Architecture & design review | @architect | PENDING | 3 | 1 | 2 | — |
| 3 | UX Designer | Mobile UI/UX design | @ux-designer | PENDING | 3 | 1 | {pts} | — |
| 4 | Product Owner | AC validation & biz sign-off | @product-owner | PENDING | 4,10 | 1 | 1 | — |
| 5 | Mobile Dev | Mobile implementation | @mobile | PENDING | 5 | 2,3 | {pts} | — |
| 6 | Tester | Unit + widget + integration tests | @tester | PENDING | 6 | 5 | {pts} | — |
| 7 | Code Quality | Quality audit | @code-quality | PENDING | 7 | 5 | 1 | — |
| 8 | Reviewer | Code review (R1) | @reviewer | PENDING | 7 | 6 | 1 | — |
| 9 | Security | Security review (R2) | @security | PENDING | 7 | 6 | 1 | — |
| 10 | QA Lead | QA plan & sign-off | @qa-lead | PENDING | 9,10 | 8,9 | 2 | — |
| 11 | QA Automation | Mobile E2E + device testing | @qa-automation | PENDING | 9 | 8,9 | 3 | — |
| 12 | Infra | App store / deployment | @infra | PENDING | 11 | 10 | 2 | — |
| 13 | Docs Writer | Documentation update | @docs-writer | PENDING | 12 | 12 | 1 | — |
```
**No Backend Dev. No Frontend Dev. No Database.** Uses @mobile instead.

### If scope = `infrastructure`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Story breakdown & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Architect | Infrastructure design review | @architect | PENDING | 3 | 1 | 2 | — |
| 3 | Infra | Infrastructure implementation | @infra | PENDING | 5 | 2 | {pts} | — |
| 4 | Security | Security review | @security | PENDING | 7 | 3 | 1 | — |
| 5 | Tester | Infrastructure tests | @tester | PENDING | 6 | 3 | {pts} | — |
| 6 | QA Lead | QA validation & sign-off | @qa-lead | PENDING | 9,10 | 4,5 | 2 | — |
| 7 | Docs Writer | Runbook / infra docs | @docs-writer | PENDING | 12 | 6 | 1 | — |
```
**No UX, No Frontend, No Backend, No Database, No Code Quality, No Reviewer.** Minimal set.

### If type = `hotfix`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Hotfix triage & assignment | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Debugger | Root cause + fix | @debugger | PENDING | 5 | 1 | {pts} | — |
| 3 | Tester | Regression test | @tester | PENDING | 6 | 2 | {pts} | — |
| 4 | Reviewer | Fast-track review | @reviewer | PENDING | 7 | 3 | 1 | — |
| 5 | Security | Security spot-check | @security | PENDING | 7 | 3 | 1 | — |
| 6 | QA Lead | Verify-only sign-off | @qa-lead | PENDING | 9 | 4,5 | 1 | — |
| 7 | Infra | Emergency deploy | @infra | PENDING | 11 | 6 | 1 | — |
```
**No Architect, No PO, No UX, No Docs.** Fast track — @debugger is primary dev.

### If type = `spike`
```markdown
## Subtasks
| # | Role | Subtask | Owner | Status | Phase | Depends-On | Points | Completed |
|---|------|---------|-------|--------|-------|------------|--------|-----------|
| 1 | Tech Lead | Spike scoping | @team-lead | IN_PROGRESS | 1 | — | 1 | — |
| 2 | Architect | Technical investigation | @architect | PENDING | 3 | 1 | {pts} | — |
| 3 | Explorer | Codebase research | @explorer | PENDING | 2 | 1 | {pts} | — |
```
**Research only.** No dev, no review, no QA, no deploy. Output is a decision document.

### Additional conditional subtasks
Add these ONLY when the specific condition is met:
- **If API changes:** add `@api-builder` subtask for API docs update
- **If schema changes:** add `@database` subtask for migrations
- **If auth/security changes:** increase `@security` points, add security test subtask
- **If accessibility impact:** add accessibility test case to `@tester` subtask
- **If performance impact:** add load test subtask referencing `/load-test`

## Step 5 — Generate Per-Role Subtask Details

**CRITICAL: Only generate detail sections for roles that EXIST in the subtask table above.**
If the scope is backend-only and there is no Frontend subtask in the table, do NOT generate ST-{N} for @frontend.
Match details 1:1 with the subtask table — no extras, no orphans.

Append detailed subtask specs for each role in the table:

```markdown
---

## Subtask Details

### ST-1: @team-lead — Story Breakdown & Assignment
**Phase:** 1 (Intake)
**Points:** 1

**Responsibilities:**
1. Review and validate story format, AC completeness
2. Classify type, scope, complexity, priority
3. Create feature branch
4. Decompose into subtasks and assign to agents
5. Identify and escalate blockers
6. Provide tech sign-off (Phase 10)

**Definition of Done:**
- [ ] Story reviewed and properly formatted
- [ ] Subtasks created with correct owners and dependencies
- [ ] Branch created: `{type}/TASK-{id}/{slug}`
- [ ] All blockers identified and logged

---

### ST-2: @architect — Architecture & Design Review
**Phase:** 3 (Design)
**Points:** 2

**Responsibilities:**
1. Review proposed approach against project architecture
2. Identify files to create/modify
3. Recommend design patterns (reference `.claude/docs/design-patterns-reference.md`)
4. Flag breaking changes or migration needs
5. Define quality gates for implementation

**Technical Notes:**
- Architecture patterns: {from CLAUDE.md / ARCHITECTURE.md}
- Files affected: {list from impact analysis}
- Patterns recommended: {e.g., Repository, Strategy, etc.}

**Definition of Done:**
- [ ] Design approach documented
- [ ] Files to modify listed
- [ ] Patterns recommended
- [ ] User approved design before dev starts

---

### ST-3: @product-owner — AC Validation & Business Sign-off
**Phase:** 4, 10

**Responsibilities:**
1. Validate acceptance criteria are complete and correct
2. Clarify ambiguous business rules
3. Verify alignment with business goals and roadmap
4. Review implementation from business perspective (Phase 10)
5. Provide final business sign-off

**AC Mapping:**
| AC# | Label | Review Status |
|-----|-------|--------------|
| AC-1 | {label} | PENDING |
| AC-2 | {label} | PENDING |
| AC-3 | {label} | PENDING |

**Definition of Done:**
- [ ] All ACs reviewed and approved
- [ ] Business rules clarified
- [ ] Business sign-off given (Phase 10)

---

### ST-4: @ux-designer — UI/UX Design
**Phase:** 3 (before dev)
**Points:** {2-5}

**Design Deliverables:**
1. {User flow diagram for the feature}
2. {Wireframe descriptions for key screens}
3. {Error state, loading state, empty state designs}
4. {Responsive breakpoints: desktop, tablet, mobile}
5. {Accessibility: color contrast, touch targets, ARIA}

**Design Notes:**
- Follow existing design system / style guide
- Component library: {from CLAUDE.md}
- Accessibility: WCAG 2.1 AA minimum

**Definition of Done:**
- [ ] User flows documented
- [ ] Wireframes/designs approved by PO
- [ ] Design walkthrough with dev completed
- [ ] Accessibility requirements specified

---

### ST-5: @api-builder — Backend Implementation
**Phase:** 5
**Points:** {3-8}

**Implementation Steps:**
1. {Create/modify endpoint: METHOD /path}
2. {Validate request payload against schema}
3. {Implement business logic in service layer}
4. {Database queries via ORM/repository}
5. {Error handling: 400, 401, 403, 404, 500}
6. {Update API documentation}

**Technical Notes:**
- Framework: {from CLAUDE.md}
- Patterns: {Repository, Service, Controller}
- Files: {list expected files to create/modify}

**Definition of Done:**
- [ ] Endpoints implemented per AC
- [ ] Input validation complete
- [ ] Error handling for all failure paths
- [ ] API docs updated
- [ ] PR raised and linked

---

### ST-6: @frontend — Frontend Implementation
**Phase:** 5
**Points:** {3-8}

**Implementation Steps:**
1. {Create/modify components per design}
2. {Wire API integration}
3. {Handle loading, error, empty states}
4. {Implement form validation (if applicable)}
5. {Responsive design: desktop, tablet, mobile}
6. {Accessibility: ARIA, keyboard nav, focus mgmt}

**Technical Notes:**
- Framework: {from CLAUDE.md}
- Component patterns: {from rules/frontend.md}
- State management: {from CLAUDE.md}

**Definition of Done:**
- [ ] UI matches design spec
- [ ] API integration working
- [ ] Error/loading/empty states handled
- [ ] Responsive across breakpoints
- [ ] Accessibility verified
- [ ] PR raised and linked

---

### ST-7: @database — Schema & Migrations
**Phase:** 5 (if schema change needed)
**Points:** {1-3}

**Migration Steps:**
1. {Create migration: add/modify table/column}
2. {Update ORM model/schema}
3. {Seed test data if needed}
4. {Verify migration is reversible}

**Definition of Done:**
- [ ] Migration created and runs successfully
- [ ] Rollback tested
- [ ] ORM model updated
- [ ] No data loss on existing records

---

### ST-8: @tester — Tests
**Phase:** 6
**Points:** {2-5}

**Test Coverage — mapped to ACs:**
| AC# | Test Type | Test Case | Expected | Status |
|-----|-----------|-----------|----------|--------|
| AC-1 | Unit | {positive test} | {expected result} | PENDING |
| AC-1 | Unit | {negative test} | {expected error} | PENDING |
| AC-2 | Integration | {API test} | {expected response} | PENDING |
| AC-3 | E2E | {edge case test} | {expected handling} | PENDING |

**Regression:**
- {Existing flows to re-verify}

**Definition of Done:**
- [ ] All AC test cases written and passing
- [ ] Coverage ≥ baseline
- [ ] Regression suite green
- [ ] Test results documented

---

### ST-9: @code-quality — Quality Audit
**Phase:** 7
**Points:** 1

**Audit Checklist:**
- [ ] SOLID principles followed
- [ ] No code duplication (DRY)
- [ ] Complexity within limits
- [ ] Correct design patterns used
- [ ] No code smells introduced

**Definition of Done:**
- [ ] Quality score ≥ 75/100
- [ ] All critical issues resolved

---

### ST-10: @reviewer — Code Review (R1)
**Phase:** 7
**Points:** 1

**Review Focus:**
- [ ] Code correctness and logic
- [ ] Convention compliance
- [ ] Error handling completeness
- [ ] Test coverage adequacy
- [ ] Performance considerations

**Definition of Done:**
- [ ] All critical comments addressed
- [ ] APPROVED

---

### ST-11: @security — Security Review (R2)
**Phase:** 7
**Points:** 1

**Security Checklist:**
- [ ] No injection vulnerabilities (SQL, XSS, CSRF)
- [ ] Authentication/authorization correct
- [ ] Input validation at boundaries
- [ ] No secrets in code
- [ ] No sensitive data exposure

**Definition of Done:**
- [ ] OWASP checks passed
- [ ] APPROVED

---

### ST-12: @qa-lead — QA Plan & Sign-off
**Phase:** 9, 10
**Points:** 2

**QA Test Plan:**
| # | Category | Scenario | Steps | Expected | Priority |
|---|----------|----------|-------|----------|----------|
| 1 | Happy Path | {main flow} | 1. ... 2. ... | {result} | P1 |
| 2 | Edge Case | {boundary} | 1. ... 2. ... | {result} | P2 |
| 3 | Error | {failure path} | 1. ... 2. ... | {handled} | P2 |
| 4 | Regression | {existing flow} | 1. ... 2. ... | {still works} | P1 |
| 5 | Security | {auth test} | 1. ... 2. ... | {blocked} | P1 |
| 6 | Accessibility | {a11y check} | 1. ... 2. ... | {compliant} | P2 |

**Definition of Done:**
- [ ] All test scenarios executed
- [ ] Bugs filed and linked
- [ ] QA sign-off given (Phase 10)

---

### ST-13: @qa-automation — E2E Automation
**Phase:** 9
**Points:** 3

**Automation:**
- Run `/e2e-browser` or `/e2e-mobile` or `/api-test` as applicable
- Capture screenshots/evidence
- Generate QA report

**Definition of Done:**
- [ ] E2E tests executed against running app
- [ ] Evidence captured (screenshots, responses)
- [ ] Report saved to `.claude/reports/qa/`

---

### ST-14: @infra — Deployment
**Phase:** 11
**Points:** 2

**Deploy Steps:**
1. Pre-deploy checks (tests green, sign-offs complete)
2. Deploy to staging → verify
3. Deploy to production → health check
4. Monitor for 30 minutes

**Definition of Done:**
- [ ] Deployed successfully
- [ ] Health checks passing
- [ ] Monitoring green for 30 min

---

### ST-15: @docs-writer — Documentation
**Phase:** 12
**Points:** 1

**Documentation:**
1. Update API docs (if endpoint changed)
2. Update README (if user-facing change)
3. Update changelog
4. Add ADR if architectural decision was made

**Definition of Done:**
- [ ] Relevant docs updated
- [ ] No stale documentation
```

## Bug / Defect Variant

For type=bug or type=defect, replace the User Story section with:

```markdown
## Bug Report
**Summary:** {One-line description}
**Severity:** {P0-Critical | P1-High | P2-Medium | P3-Low}
**Reported By:** {User | QA | Monitoring}
**Environment:** {Production | Staging | Development}

### Steps to Reproduce
1. {Step 1}
2. {Step 2}
3. {Step 3}

### Expected Behavior
{What should happen}

### Actual Behavior
{What actually happens}

### Evidence
- Screenshot: {path or "N/A"}
- Error log: {paste or path}
- Stack trace: {paste or path}

### Acceptance Criteria
AC-1: Bug is fixed
**Given** {the reproduction steps above},
**When** {the user performs the action},
**Then** {the expected behavior occurs instead of the bug}.

AC-2: Regression test added
**Given** {the fix is deployed},
**When** {the regression test suite runs},
**Then** {a test covering this exact bug passes}.
```

Subtasks for bugs: skip #3 (PO), #4 (UX Designer) unless UI bug. Add @debugger as primary dev.

## Definition of Done
- Main story created with proper format (user story/bug report + BDD ACs)
- ALL relevant subtasks generated with role-specific DoD
- Subtask dependencies mapped correctly
- Story points estimated per Fibonacci (1, 2, 3, 5, 8, 13)
- Task record saved to `.claude/tasks/TASK-{id}.md`

## Next Steps
- `/workflow new TASK-{id}` to begin the SDLC workflow

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
