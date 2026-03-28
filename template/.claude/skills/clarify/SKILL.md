---
name: clarify
description: >
  Interactive Q&A session to clear requirement doubts, ambiguities, and gaps before
  development. Scans project docs (new projects) or codebase (existing projects),
  identifies unclear areas, asks structured questions, and records decisions.
  Works for both new and existing projects. Use before starting development or when
  requirements feel unclear.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--full | --feature "name" | --phase N | --quick | --existing]'
effort: high
---

# /clarify — Requirements Q&A & Gap Analysis

## Overview
An interactive Q&A module that acts as a requirements analyst. It scans your project
documents (new projects) or codebase + task history (existing projects), identifies
ambiguities, contradictions, missing details, and assumption gaps, then walks you
through structured questions to resolve each one. Every answer is recorded in project
docs so decisions are never lost.

## Usage
```
/clarify                              # Auto-detect: scan all project docs and ask questions
/clarify --full                       # Deep scan — exhaustive gap analysis across all docs
/clarify --feature "User Auth"        # Focus Q&A on a specific feature
/clarify --phase 4                    # Focus on a specific pre-dev phase's output
/clarify --quick                      # Top 5 most critical gaps only
/clarify --existing                   # Scan existing codebase for requirement gaps
/clarify --before-dev                 # Pre-development checkpoint (run before first /mvp-kickoff)
/clarify --before-launch              # Pre-launch checkpoint (run before /launch-mvp)
```

## How It Works (New Projects)

### Step 1: Scan All Project Documents

Read every document in `.claude/project/`:
```
Documents scanned:
  - IDEA_CANVAS.md → problem clarity, audience specificity, assumption count
  - PRODUCT_SPEC.md → MVP scope precision, acceptance criteria completeness
  - BACKLOG.md → feature clarity, dependency logic, sizing justification
  - DOMAIN_MODEL.md → entity completeness, rule clarity, glossary coverage
  - TECH_STACK.md → decision rationale, alternative consideration
  - ARCHITECTURE.md → API completeness, data model coverage, security gaps
  - DEPLOY_STRATEGY.md → environment readiness, monitoring coverage
```

### Step 2: Identify Gaps (Automated Analysis)

Spawn @strategist + @architect in parallel:

**@strategist scans for business/product gaps:**
```
For each document, check:

IDEA_CANVAS.md:
  - Is the problem statement specific and testable? (not vague)
  - Is target audience defined with concrete characteristics? (not "everyone")
  - Are assumptions flagged? How many are unvalidated?
  - Is the value proposition differentiated from competitors?

PRODUCT_SPEC.md:
  - Does every user journey have GIVEN/WHEN/THEN acceptance criteria?
  - Are acceptance criteria testable? (not "should be fast" → "response < 200ms")
  - Are edge cases covered? (empty states, error states, boundary conditions)
  - Are user roles defined? (who can do what)
  - Are there contradictions between journeys?
  - Are success metrics measurable? (not "users should like it")
  - Are constraints concrete? ("launch by Q2" not "ASAP")
  - Are open questions still unresolved?

BACKLOG.md:
  - Does every Must-Have feature have a clear "done" definition?
  - Are feature descriptions specific enough to implement? (not "handle payments")
  - Are dependency reasons explained? (not just "depends on F1")
  - Are L-sized features flagged for splitting?
  - Is there a feature that no user journey references? (orphan feature)
  - Is there a user journey that no feature covers? (gap)

DOMAIN_MODEL.md:
  - Does every entity have attributes defined?
  - Are relationships cardinalities specified? (1:1, 1:N, N:N)
  - Are business rules concrete? (not "validate input" → "email must be valid format")
  - Are there ambiguous terms in the glossary?
  - Do entities match ARCHITECTURE.md data model?
```

**@architect scans for technical gaps:**
```
TECH_STACK.md:
  - Are version numbers specified? (not just "React" → "React 18.2")
  - Is hosting region specified?
  - Are there version incompatibilities?
  - Is the auth strategy fully defined? (JWT expiry, refresh, storage)

ARCHITECTURE.md:
  - Does every API endpoint have request/response shapes?
  - Are error response formats consistent and defined?
  - Is pagination strategy defined?
  - Is the auth flow complete? (register, login, refresh, logout, forgot-password)
  - Are rate limits specified?
  - Is input validation strategy defined?
  - Are there endpoints with no corresponding frontend component?
  - Are there components with no corresponding API endpoint?

DEPLOY_STRATEGY.md:
  - Are environment variables listed? (or just "configure env")
  - Is the rollback procedure testable?
  - Are monitoring thresholds defined? (not "monitor errors" → ">1% error rate")
  - Is the launch checklist actionable? (each item has a command or verification)
```

### Step 3: Categorize Findings

```
Categories:
  🔴 BLOCKER — Cannot start development without resolving this
     Example: "No acceptance criteria for payment flow"

  🟡 AMBIGUOUS — Has content but it's vague or could be interpreted multiple ways
     Example: "User should be able to manage their profile" (what does "manage" mean?)

  🟢 ASSUMPTION — Decision was made with flagged assumption, needs validation
     Example: "ASSUMED: Users will primarily access via mobile"

  🔵 MISSING — A reasonable expectation that's not addressed at all
     Example: "No error handling strategy for failed payments"

  ⚪ SUGGESTION — Not a gap, but a recommendation to improve clarity
     Example: "Consider adding example API responses to endpoint docs"
```

### Step 4: Interactive Q&A Session

Present findings grouped by priority and walk through each:

```
## Requirements Clarification Session

Found: 3 🔴 blockers, 5 🟡 ambiguities, 2 🟢 assumptions, 4 🔵 missing, 3 ⚪ suggestions

### 🔴 BLOCKERS (must resolve)

**Q1: [PRODUCT_SPEC] Payment flow has no acceptance criteria**
The feature "Process Payments" in BACKLOG.md references a payment flow, but
PRODUCT_SPEC.md has no user journey for payments.

→ What payment methods should be supported? (credit card, bank transfer, PayPal, etc.)
→ What happens on payment failure? (retry, notify user, cancel order?)
→ Are there refund requirements?
→ Is there a minimum/maximum payment amount?

Your answer: ___

**Q2: [ARCHITECTURE] Auth token refresh strategy undefined**
ARCHITECTURE.md shows JWT auth but doesn't specify:
→ What is the access token expiry? (15min, 1hr, 24hr?)
→ What is the refresh token expiry?
→ Where are tokens stored client-side? (httpOnly cookie, localStorage?)
→ What happens when refresh token expires? (silent logout, re-auth prompt?)

Your answer: ___

### 🟡 AMBIGUITIES (clarify to avoid rework)

**Q3: [BACKLOG] "User management" feature is vague**
Feature 4 says "User Management" with size M. This could mean:
  a) Admin can view/edit/delete users (admin panel)
  b) Users can edit their own profile (self-service)
  c) Both (admin + self-service)
  d) Something else

Which interpretation is correct? ___

...continue for all findings...
```

### Step 5: Record Decisions

After each answer, immediately update the relevant project document:

```
For each answered question:
1. Identify which document(s) to update
2. Update the document with the clarified requirement:
   - PRODUCT_SPEC.md → add/update acceptance criteria
   - BACKLOG.md → clarify feature description
   - ARCHITECTURE.md → add endpoint details
   - DOMAIN_MODEL.md → add business rule
   - TECH_STACK.md → specify version/config
3. Add to PROJECT.md Decision Log:
   | {date} | {decision summary} | Clarified via /clarify Q{N} | User | Q&A |
4. Remove the "Open Questions" entry if it was listed there
```

### Step 6: Completion Report

```
## Clarification Session Complete

Resolved: 3/3 blockers ✅, 4/5 ambiguities ✅, 2/2 assumptions ✅
Remaining: 1 ambiguity (deferred to development), 4 missing (logged as tasks)
Suggestions: 3 noted in Decision Log

### Documents Updated
- PRODUCT_SPEC.md: +3 acceptance criteria, +1 user journey
- ARCHITECTURE.md: +2 endpoint details, +1 auth specification
- BACKLOG.md: 2 features clarified, 1 feature split into 2
- DOMAIN_MODEL.md: +1 business rule

### Still Open (deferred)
- Q5: "Exact notification channels" — decide during Feature 5 implementation

### Readiness Assessment
  Pre-dev documents: ██████████ 95% clear (was 72%)
  Ready for development: YES ✅

Next: /mvp-kickoff next
```

---

## How It Works (Existing Projects)

### `--existing` Mode

For projects set up with `npx claude-code-scanner init` (no pre-dev pipeline):

```
1. SCAN CODEBASE
   - Read CLAUDE.md for project conventions
   - Read .claude/tasks/ for active/recent work
   - Scan source code for:
     - TODO/FIXME/HACK comments (unresolved issues)
     - Incomplete implementations (empty functions, placeholder returns)
     - Missing test coverage (files with no tests)
     - Inconsistent patterns (mixed naming, different error formats)
     - Undocumented API endpoints
     - Missing environment variable documentation

2. SCAN TASK HISTORY
   - Read completed TASK-{id}.md files
   - Identify: decisions made, assumptions flagged, open questions deferred
   - Check: were deferred questions ever resolved?

3. IDENTIFY GAPS
   Same categorization (🔴🟡🟢🔵⚪) but focused on:
   - Code vs documentation mismatches
   - Untested edge cases
   - Missing error handling
   - Unclear business logic in code comments
   - API endpoints with no documentation
   - Database fields with no validation rules

4. INTERACTIVE Q&A
   Same interactive format, but questions reference code locations:
   "Q1: [src/api/payments.ts:45] The payment retry logic has a
   TODO: 'determine max retries'. What should the max retry count be?"

5. RECORD DECISIONS
   - Update CLAUDE.md with clarified conventions
   - Update relevant .claude/rules/ files
   - Add TODO resolutions to codebase
   - Log decisions in task records
```

---

## Checkpoint Modes

### `--before-dev` (Pre-Development Checkpoint)

Run after `/new-project` completes but before `/mvp-kickoff next`:

```
Validates:
1. All pre-dev documents exist and are populated (not template)
2. No unresolved "Open Questions" in PRODUCT_SPEC.md
3. No unvalidated assumptions in IDEA_CANVAS.md
4. All Must-Have features have clear acceptance criteria
5. All entities in DOMAIN_MODEL.md have business rules
6. Architecture covers all Must-Have features
7. Tech stack has no incompatibilities
8. Deploy strategy has actionable launch checklist

If issues found: start Q&A session
If all clear: "Pre-development documents are clear. Ready for /mvp-kickoff next"
```

### `--before-launch` (Pre-Launch Checkpoint)

Run after all features complete but before `/launch-mvp`:

```
Validates:
1. All acceptance criteria in PRODUCT_SPEC.md are verified
2. All features in BACKLOG.md are COMPLETE
3. No deferred questions still open
4. Integration test coverage adequate
5. Monitoring and alerting configured
6. Rollback procedure documented and tested
7. Environment variables documented
8. Security checklist items addressed

If issues found: start Q&A session
If all clear: "Launch requirements are clear. Ready for /launch-mvp"
```

### `--feature "name"` (Feature-Specific Q&A)

Focus on a single feature before starting its /workflow:

```
1. Find feature in BACKLOG.md
2. Find matching user journeys in PRODUCT_SPEC.md
3. Find relevant entities in DOMAIN_MODEL.md
4. Find relevant endpoints in ARCHITECTURE.md
5. Check:
   - Are acceptance criteria complete and testable?
   - Are edge cases defined? (null input, max size, concurrent access)
   - Are error scenarios defined? (what errors, what messages, what HTTP codes)
   - Are permissions defined? (who can access this feature)
   - Is the happy path clear? Is the sad path clear?
6. Ask questions about gaps
7. Update docs with answers
```

---

## Q&A Interaction Patterns

### Question Types

```
CHOICE — pick from options:
  "How should the system handle failed payments?"
  a) Retry automatically (up to 3 times)
  b) Show error and let user retry manually
  c) Queue for manual review
  d) Other: ___

SPECIFICATION — provide a value:
  "What should the max file upload size be?"
  → ___

YES/NO with follow-up:
  "Should users be able to delete their account?"
  → Yes/No
  → If yes: "Soft delete (recoverable) or hard delete (permanent)?"

OPEN — free text:
  "Describe the notification behavior when a payment is processed:"
  → ___

DEFER — postpone to later:
  "Skip this question for now? (will be flagged as open)"
  → Defer (logged as open question with reminder)
```

### Session Management

```
- Q&A can be interrupted — progress saved to PROJECT.md
- Resume with /clarify --resume
- Skip questions with "defer" — logged for later
- Batch mode: answer all questions, then apply all updates at once
- Review mode: show proposed doc changes before applying
```

---

## Outputs

- Updated project documents (PRODUCT_SPEC.md, BACKLOG.md, ARCHITECTURE.md, etc.)
- Updated `.claude/project/PROJECT.md` Decision Log
- Clarification report: `.claude/reports/clarification-{timestamp}.md`
- Updated `.claude/rules/domain-terms.md` (if glossary terms clarified)

## When to Use

| Situation | Command |
|-----------|---------|
| After `/new-project` completes, before building features | `/clarify --before-dev` |
| Before starting a specific feature | `/clarify --feature "Auth"` |
| Requirements feel vague or contradictory | `/clarify` |
| After joining an existing project | `/clarify --existing` |
| Before launching the MVP | `/clarify --before-launch` |
| Quick sanity check (top issues only) | `/clarify --quick` |
| After major scope change or pivot | `/clarify --full` |

## Definition of Done
- [ ] All project documents scanned for gaps and ambiguities
- [ ] Findings categorized (blockers, ambiguous, assumptions, missing, suggestions)
- [ ] All blocker-level gaps resolved through Q&A
- [ ] Answers recorded in relevant project documents
- [ ] Decision Log updated in PROJECT.md
- [ ] Readiness assessment generated with clarity percentage
- [ ] Clarification report saved to `.claude/reports/`
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/mvp-kickoff next` — start the next MVP feature
- **Iterate:** `/clarify --feature "name"` — deep-dive on a specific feature
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/clarify --full` for exhaustive re-scan, or `/clarify --feature "name"`
- **Revert output:** Revert document changes and re-run `/clarify`
