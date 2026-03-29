---
name: mvp-kickoff
description: >
  Bridge between pre-dev backlog and SDLC workflow. Auto-creates workflow tasks from
  BACKLOG.md Must-Have features, enforces dependency ordering, links task records to
  backlog entries, and manages feature-to-workflow lifecycle.
  Trigger: after /new-project completes, or when user wants to start the next MVP feature.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
argument-hint: '[next | "feature name" | --all | --status]'
effort: high
roles: [TechLead, PM, CTO, FullStackDev, BackendDev, FrontendDev]
agents: [@team-lead, @product-owner, @process-coach]
---

# /mvp-kickoff — Feature-to-Workflow Bridge

## Overview
Connects the pre-dev backlog to the SDLC workflow. Instead of manually reading BACKLOG.md
and typing `/workflow new "feature"`, this skill automates feature selection, dependency
checking, context injection, and backlog synchronization.

## Usage
```
/mvp-kickoff next                      # Start next feature in dependency order
/mvp-kickoff "User Authentication"     # Start a specific feature by name
/mvp-kickoff --all                     # Show all Must-Have features and their status
/mvp-kickoff --status                  # MVP progress summary
/mvp-kickoff --reorder                 # Re-evaluate feature order based on current state
```

## Process

### Command: `next` (default)

```
1. READ STATE
   - Read .claude/project/BACKLOG.md for feature list
   - Read .claude/project/PROJECT.md for current status
   - Scan .claude/tasks/ for any active workflow (concurrency guard)

2. CONCURRENCY CHECK
   - If active workflow exists: show status and suggest:
     "TASK-{id} is active. Finish it first, or /workflow cancel TASK-{id}"
   - If no active workflow: proceed

3. FIND NEXT FEATURE
   - Read Must-Have features from BACKLOG.md
   - Filter: status = PENDING (skip COMPLETE, IN_PROGRESS, SKIPPED)
   - Apply dependency ordering:
     - For each PENDING feature, check if its dependencies are COMPLETE
     - If dependencies not met: skip with note "(blocked by Feature X)"
     - First unblocked PENDING feature = next feature
   - If no unblocked features: report deadlock or MVP complete

4. PRE-POPULATE WORKFLOW CONTEXT
   Create enriched workflow initiation with:
   - Feature name and description from BACKLOG.md
   - Size (S/M/L) from BACKLOG.md → maps to workflow complexity
   - Dependencies from BACKLOG.md → maps to workflow depends-on
   - Acceptance criteria: read PRODUCT_SPEC.md user journeys matching this feature
   - Architecture context: read ARCHITECTURE.md for relevant data model/API endpoints
   - Domain context: read DOMAIN_MODEL.md for relevant entities and business rules
   - Previous feature context: read TASK-{id}.md from last COMPLETED feature for
     API contracts, patterns established, shared code created

5. CREATE WORKFLOW
   Run: /workflow new "{feature description}"
   With enriched context injected into Phase 1 (Intake):
   - Pre-set: type, scope, complexity from BACKLOG.md metadata
   - Pre-set: acceptance criteria from PRODUCT_SPEC.md
   - Pre-set: architecture references from ARCHITECTURE.md
   - Pre-set: depends-on from BACKLOG.md dependencies (mapped to TASK-ids)

6. UPDATE BACKLOG
   - Set feature status in BACKLOG.md: PENDING → IN_PROGRESS
   - Record TASK-id next to feature entry
   - Update PROJECT.md "Features In Development" table
```

### Command: `"feature name"` (specific feature)

```
Same as 'next' but:
1. Search BACKLOG.md for matching feature (fuzzy match on name)
2. If not found: error with "Feature not found in BACKLOG.md. Available: [list]"
3. If found but dependencies not met: warn and ask user to confirm override
4. Proceed with workflow creation
```

### Command: `--all` (show all features)

```
Read BACKLOG.md and display:

## MVP Features (Must-Have)
| # | Feature | Size | Status | Task ID | Dependencies | Blocked? |
|---|---------|------|--------|---------|--------------|----------|
| 1 | Auth    | M    | COMPLETE | TASK-001 | — | — |
| 2 | Dashboard | M  | IN_PROGRESS | TASK-002 | F1 ✓ | No |
| 3 | Settings | S   | PENDING | — | F1 ✓ | No (ready) |
| 4 | Reports  | L   | PENDING | — | F2 ⏳ | Yes (F2 in progress) |

Next available: Feature 3 (Settings) — run: /mvp-kickoff next
```

### Command: `--status` (progress summary)

```
## MVP Progress

Features: 2/8 complete (25%)
In Progress: 1 (Dashboard — Phase 5: DEVELOPING)
Blocked: 1 (Reports — waiting on Dashboard)
Ready to Start: 1 (Settings)
Remaining: 4

Estimated remaining effort: 3S + 2M + 1L
Current velocity: 1 feature / session (based on completed features)

Next action: /mvp-kickoff next (starts Settings)
```

## Backlog Synchronization

When a workflow reaches Phase 13 (CLOSED), auto-update BACKLOG.md:

```
On workflow CLOSED event:
1. Read TASK-{id}.md to find feature name
2. Find matching entry in BACKLOG.md
3. Update status: IN_PROGRESS → COMPLETE
4. Update PROJECT.md: add to "Features In Development" table with completion date
5. Check: are all Must-Have features COMPLETE?
   - If yes: suggest "/launch-mvp" to finalize
   - If no: suggest "/mvp-kickoff next" for next feature
```

## Cross-Feature Context Injection

When starting Feature N, inject context from Features 1..N-1:

```
Previous Feature Summary (auto-generated):
- Feature 1 (Auth): Created User model, /api/auth/* endpoints, JWT middleware
  Files: src/models/user.ts, src/api/auth/*, src/middleware/auth.ts
  Patterns: error responses use {code, message, details} format
  Tests: 24 unit, 3 integration

- Feature 2 (Dashboard): Created Dashboard component, /api/stats endpoint
  Files: src/components/Dashboard/*, src/api/stats.ts
  Patterns: components use compound pattern, API uses cursor pagination
  Tests: 18 unit, 2 e2e

Use these patterns. Do not redesign existing API conventions.
```

This summary is built by reading each completed TASK-{id}.md Phase 5 details.

## Dependency Enforcement

```
Dependency states:
  ✓ COMPLETE — dependency satisfied, can proceed
  ⏳ IN_PROGRESS — dependency being built, cannot start yet
  ✗ PENDING — dependency not started, cannot start yet
  ⚠ BLOCKED — dependency is blocked, escalate

Feature cannot start Phase 5 (Development) if any dependency is not COMPLETE.
Override: user can explicitly force with /mvp-kickoff "Feature" --force
  → Warns: "Dependency Feature X is not complete. Proceeding may cause rework."
```

## Backlog Change Control

When user runs `/feature-map --update` during active development:

```
1. Detect: which features changed? (added, removed, re-prioritized, re-sized)
2. Impact analysis:
   - Added Must-Have: warn "New feature adds to MVP scope. Estimated impact: +{size}"
   - Removed Must-Have: warn if feature is IN_PROGRESS, suggest /workflow cancel
   - Re-prioritized: update order but don't interrupt active workflow
   - Re-sized: update BACKLOG.md, no workflow impact
3. Report changes to user
4. Suggest: "Run /mvp-kickoff --reorder to recalculate feature sequence"
```

## Outputs
- Updated `.claude/project/BACKLOG.md` — feature status synchronized
- Updated `.claude/project/PROJECT.md` — features in development table
- New `.claude/tasks/TASK-{id}.md` — created by /workflow with enriched context

## Error Handling

```
Before any command, validate prerequisites:

1. If .claude/project/ directory missing:
   → "Pre-dev project directory not found."
   → If CLAUDE.md exists: "Run: mkdir -p .claude/project && /feature-map to create a backlog"
   → If CLAUDE.md missing: "Run: npx claude-code-scanner new <name> OR npx claude-code-scanner init"

2. If BACKLOG.md missing or empty (only template placeholders):
   → "No feature backlog found."
   → If PRODUCT_SPEC.md exists: "Run /feature-map to generate features from your spec"
   → If no spec: "Run /new-project or /product-spec first to define your product"

3. If PROJECT.md status is not READY_FOR_DEV/IN_DEVELOPMENT/POST_MVP:
   → "Project is at phase: {status}. Complete pre-development first."
   → "Run /new-project --resume to continue setup"

4. If all Must-Have features are COMPLETE:
   → "All MVP features are complete! Run /launch-mvp to finalize."

5. If concurrency violation (active workflow):
   → Show active task details
   → "Complete or cancel TASK-{id} before starting next feature"
```

## Prerequisites
- `.claude/project/BACKLOG.md` must exist with Must-Have features
- `.claude/project/PROJECT.md` status must be `READY_FOR_DEV` or later

## Definition of Done
- [ ] Next feature selected based on dependency ordering
- [ ] All feature dependencies verified as COMPLETE
- [ ] Workflow task created with enriched context from backlog, spec, and architecture
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/workflow dev TASK-{id}` — begin development on the selected feature
- **Issues found:** `/clarify` — resolve ambiguities in feature requirements before starting
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Revert feature selection:** Edit `.claude/project/BACKLOG.md` — change feature status back to PENDING
- **Cancel created workflow:** `/workflow cancel TASK-{id}` to remove the task
- **Re-select feature:** `/mvp-kickoff next` to pick a different feature
