---
name: idea-to-launch
description: >
  Full lifecycle orchestrator from idea to launched product. Runs all pre-development
  phases (/new-project), then builds each MVP feature using the 13-phase SDLC workflow.
  Use when you want end-to-end automation from concept to deployment.
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
argument-hint: '"your idea" [--fast]'
effort: high
---

# /idea-to-launch — Complete Lifecycle Orchestrator

## Overview
The ultimate orchestrator: takes a raw idea and produces a deployed product. Combines
the 8-phase pre-development pipeline (`/new-project`) with the 13-phase SDLC workflow
(`/workflow`) for each MVP feature.

## Usage
```
/idea-to-launch "Build a SaaS invoicing tool for freelancers"
/idea-to-launch "Real-time chat app" --fast
/idea-to-launch --resume    # Resume from where you left off
```

## Full Lifecycle

```
IDEA
  │
  ├─ Pre-Phase 1: Ideation          (/brainstorm)
  ├─ Pre-Phase 2: Product Spec      (/product-spec)
  ├─ Pre-Phase 3: Feature Map       (/feature-map)
  ├─ Pre-Phase 4: Tech Selection    (/tech-stack)
  ├─ Pre-Phase 5: Architecture      (/architecture)
  ├─ Pre-Phase 6: Scaffolding       (/scaffold)
  ├─ Pre-Phase 7: Environment Setup (auto)
  ├─ Pre-Phase 8: Launch Planning   (/deploy-strategy)
  │
  ├─ Feature 1: 13-Phase SDLC      (/workflow new "feature 1")
  │   └─ Intake → Impact → Design → Dev → Test → Review → CI → QA → Signoff → Deploy
  │
  ├─ Feature 2: 13-Phase SDLC      (/workflow new "feature 2")
  │   └─ (same 13 phases)
  │
  ├─ ... (all Must-Have features)
  │
  └─ LAUNCHED
```

## Process

### Stage 1: Pre-Development
Run `/new-project "{idea}"` with all flags passed through.

This completes Pre-Phases 1-8 and produces:
- All project documents (idea canvas, spec, backlog, tech stack, architecture, deploy strategy)
- Scaffolded project files
- Claude Code environment (agents, skills, hooks, rules)

### Stage 1b: Requirements Clarification
After pre-dev completes, run a Q&A checkpoint:

```
Run /clarify --before-dev
  → Scans all project documents for ambiguities, gaps, contradictions
  → Presents categorized findings (blockers, ambiguities, assumptions, missing)
  → Interactive Q&A to resolve each gap
  → Updates project documents with answers
  → Records decisions in Decision Log

If blockers found: must resolve before proceeding
If only suggestions: proceed with development
```

### Stage 2: Feature Development
After requirements are clear, iterate through Must-Have features using `/mvp-kickoff`:

```
1. Run /mvp-kickoff --status to show initial MVP state
2. LOOP (for each Must-Have feature in dependency order):
   a. Run /mvp-kickoff next
      → Auto-selects next unblocked feature from BACKLOG.md
      → Enforces dependency ordering
      → Injects cross-feature context (patterns, APIs, shared code from prior features)
      → Pre-populates workflow with acceptance criteria from PRODUCT_SPEC.md
      → Creates /workflow new with enriched context
   b. /workflow runs 13-phase SDLC to completion
   c. /mvp-kickoff auto-syncs: BACKLOG.md status → COMPLETE, PROJECT.md updated
   d. Run /mvp-status to show progress
   e. Run /context-check — compact if > 60%
   f. If session approaching limits: save progress, instruct user to resume
3. After all Must-Have features complete:
   - /mvp-status --launch-ready to verify launch readiness
   - Suggest: "/launch-mvp" to finalize
```

### Stage 3: MVP Launch
After all features built, run `/launch-mvp` for final orchestration:

```
/launch-mvp:
  1. Validate all Must-Have features COMPLETE (quality gates)
  2. Run cross-feature integration tests (@tester + @qa-lead)
     → Tests spanning multiple features
     → API contract validation
     → Auth flow across all endpoints
     → Error handling consistency
  3. Execute launch checklist from DEPLOY_STRATEGY.md
  4. Final deployment to production (@infra)
  5. Post-launch monitoring (30 minutes)
  6. Generate MVP Launch Report → .claude/reports/mvp-launch-report.md
  7. Update PROJECT.md: status → LAUNCHED
```

### Stage 4: Post-MVP
After successful launch:

```
/launch-mvp --post-mvp:
  1. Read BACKLOG.md Should-Have features
  2. Re-prioritize based on launch feedback
  3. Update PROJECT.md: status → POST_MVP
  4. Continue with /mvp-kickoff next for Should-Have features
  5. Set up /sync for ongoing maintenance
```

## Session Management

This skill manages long-running work across multiple sessions:

### Context Budget
- Each `/workflow new` runs in `context: fork` (separate context)
- Between features: compact main context
- State persisted to disk (PROJECT.md, BACKLOG.md, task records)

### Resume Protocol
If the session ends mid-lifecycle:

```
/idea-to-launch --resume

1. Read PROJECT.md for current status
2. If pre-dev incomplete: /new-project --resume
3. If in feature development:
   a. Read BACKLOG.md for next incomplete Must-Have
   b. Check .claude/tasks/ for any in-progress workflow
   c. If active workflow: /workflow resume TASK-{id}
   d. If no active workflow: /workflow new "{next feature}"
4. Continue iteration
```

### Early Exit
If the user wants to stop and continue later:
- All state is in PROJECT.md + BACKLOG.md + task records
- Just run `/idea-to-launch --resume` in a new session
- Progress is never lost

## Error Handling

| Error | Recovery |
|-------|----------|
| Pre-dev phase fails | Save progress, offer to retry specific phase |
| Feature workflow fails | Save task state, offer to resume or skip feature |
| Context exhaustion | Compact, save progress, instruct to resume |
| Circuit breaker trips | Escalate to user with options (continue/re-scope/skip) |
| Deploy failure | Rollback, continue with next feature, address later |

## Limitations

- One feature at a time (SDLC concurrency rule: 1 active workflow)
- Large features (L-sized) may require session splits
- User gates in pre-dev phases require interaction (cannot be fully unattended)
- Deploy phase requires actual infrastructure (hosting account, domain, etc.)
