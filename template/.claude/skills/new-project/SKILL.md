---
name: new-project
description: >
  Master orchestrator for new project creation. Runs all pre-development phases
  sequentially — from ideation through domain modeling, scaffolding, to launch planning —
  with user approval gates at each major decision point. Can import existing documents
  to skip phases. Use when starting a brand new project from an idea.
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
argument-hint: '"your project idea" [--skip-brainstorm] [--fast] [--from-docs "path"] [--template web|api|cli|mobile]'
effort: high
---

# /new-project — Full Pre-Development Orchestrator

## Overview
Take a project from raw idea to development-ready state. Runs 8 pre-development phases
sequentially with user approval gates, then transitions to the existing SDLC workflow.

## Usage
```
/new-project "Build a SaaS invoicing tool for freelancers"
/new-project "Real-time chat app" --fast
/new-project "REST API for inventory management" --skip-brainstorm
/new-project "E-commerce store" --template web
/new-project --resume    # Resume from last completed phase
```

## Variants

| Flag | Effect |
|------|--------|
| (none) | Full 8-phase pipeline with interactive brainstorming |
| `--fast` | Combines Phases 1+2+3 into a single pass (less interactive) |
| `--skip-brainstorm` | Starts at Phase 2 using the idea description directly |
| `--template TYPE` | Pre-selects tech stack category (web/api/cli/mobile/fullstack) |
| `--from-docs "path"` | Import existing documents first, skip populated phases |
| `--resume` | Resume from last completed phase in PROJECT.md |

## State Machine

```
IDEATING → SPECIFYING → MAPPING → MODELING → SELECTING → ARCHITECTING
  → SCAFFOLDING → SETTING_UP → PLANNING → READY_FOR_DEV
```

Special states: `PAUSED` (user interrupted), `CANCELLED` (user abandoned)

Each state is persisted in `.claude/project/PROJECT.md`. If the session ends, use
`--resume` to continue from the last completed phase.

## Resume Protocol (`--resume`)

```
1. Read .claude/project/PROJECT.md
2. Parse "## Status:" field for current state
3. Find last phase with status COMPLETE in the phase table
4. Resume from the NEXT incomplete phase
5. If partial output exists (file with content but phase not COMPLETE):
   - Show partial output to user
   - Ask: "Phase was interrupted. (continue from partial / restart phase)"
6. If PROJECT.md is missing/corrupted: error with "Run /new-project without --resume"
```

## Cross-Phase Validation

Before each user gate, run validation to catch inconsistencies early:

```
After Phase 2 → Phase 3: Verify PRODUCT_SPEC.md MVP features are specific enough to generate features from
After Phase 3 → Phase 3b: Verify BACKLOG.md Must-Have features cover all user journeys in PRODUCT_SPEC.md
After Phase 3b → Phase 4: Verify DOMAIN_MODEL.md entities map to at least one feature in BACKLOG.md
After Phase 4 → Phase 5: Verify TECH_STACK.md choices are compatible (no conflicting frameworks)
After Phase 5 → Phase 6: Verify ARCHITECTURE.md data model covers all DOMAIN_MODEL.md entities
After Phase 6 → Phase 7: Verify scaffold builds successfully (type check, lint, build pass)

If validation finds issues: report to user at the gate, suggest fixes, allow override
```

## Change Cascade Warnings

When a phase is re-run with `--update`, warn about downstream impact:

```
/brainstorm --refine       → may invalidate: PRODUCT_SPEC.md, BACKLOG.md
/product-spec --update     → may invalidate: BACKLOG.md, DOMAIN_MODEL.md
/feature-map --update      → may invalidate: DOMAIN_MODEL.md (entity coverage)
/domain-model --update     → may invalidate: ARCHITECTURE.md (data model)
/tech-stack --update       → may invalidate: ARCHITECTURE.md, scaffold
/architecture --update     → may invalidate: scaffold (re-run /scaffold)

Show warning: "Changing [phase] may invalidate downstream files: [list]. Re-run those phases after."
If project already scaffolded: "WARNING: Project has been scaffolded. Re-running /scaffold will regenerate files."
```

## Pre-Phase Pipeline

### Pre-Phase 1: IDEATION
**Agent:** @ideator | **Gate:** User approval | **State:** IDEATING

```
1. Parse user's idea description
2. Spawn @ideator agent:
   - Interactive brainstorming session
   - Structured questioning (problem, audience, uniqueness, scale)
   - Produce Idea Canvas
3. Write output to .claude/project/IDEA_CANVAS.md
4. Update PROJECT.md: Phase 1 = COMPLETE
5. Present Idea Canvas to user

USER GATE: "Does this capture your idea? (approve / refine / skip to next phase)"
- approve → Phase 2
- refine → Re-run @ideator with feedback
- skip → Phase 2 (canvas marked as DRAFT)
```

**Skip conditions:**
- `--skip-brainstorm`: Skip entirely, use raw idea description
- `--fast`: Combine with Phases 2+3

---

### Pre-Phase 2: PRODUCT SPECIFICATION
**Agents:** @strategist + @ux-designer (parallel) | **Gate:** User approval | **State:** SPECIFYING

```
1. Read IDEA_CANVAS.md (or raw idea if brainstorm skipped)
2. Spawn agents in parallel:
   - @strategist: MVP scope, user journeys, acceptance criteria, success metrics
   - @ux-designer: User flows (Mermaid), screen hierarchy, wireframe descriptions
3. Merge outputs into .claude/project/PRODUCT_SPEC.md
4. Update PROJECT.md: Phase 2 = COMPLETE
5. Present MVP scope and journey count to user

USER GATE: "Is the MVP scope correct? (approve / adjust scope / add journeys)"
- approve → Phase 3
- adjust → Re-run @strategist with specific changes
- add → @strategist adds journeys, @ux-designer adds flows
```

**Skip conditions:**
- `--fast`: Combined with Phase 1+3 in a single @strategist call

---

### Pre-Phase 3: FEATURE MAP
**Agent:** @strategist | **Gate:** User approval | **State:** MAPPING

```
1. Read PRODUCT_SPEC.md
2. Spawn @strategist:
   - Brainstorm all features (obvious + non-obvious)
   - MoSCoW categorization
   - Size each feature (S/M/L)
   - Map dependencies
   - Create feature tree
   - Recommend implementation order
3. Write output to .claude/project/BACKLOG.md
4. Update PROJECT.md: Phase 3 = COMPLETE
5. Present feature counts and MVP list to user

USER GATE: "Is the MVP feature set correct? (approve / move features / add features)"
- approve → Phase 4
- move → User specifies which features to re-categorize
- add → @strategist adds features to appropriate category
```

---

### Pre-Phase 3b: DOMAIN MODELING
**Agent:** @strategist | **Gate:** User approval | **State:** MODELING

```
1. Read PRODUCT_SPEC.md and BACKLOG.md
2. Spawn @strategist for domain extraction:
   - Extract all domain entities from user journeys (nouns = entities)
   - Extract domain events from acceptance criteria (verbs = events)
   - Build glossary of all domain-specific terms
   - Identify bounded contexts (group related entities)
   - Define business rules as explicit constraints
   - Create Mermaid class diagrams for entity relationships
   - Create Mermaid sequence diagrams for key domain flows
3. Write output to .claude/project/DOMAIN_MODEL.md
4. Generate .claude/rules/domain-terms.md (glossary as coding rule)
5. Update PROJECT.md: Phase 3b = COMPLETE
6. Present domain model summary to user

USER GATE: "Does this domain model capture the business correctly? (approve / refine)"
- approve → Phase 4
- refine → @strategist revises with feedback
```

---

### Document Import (--from-docs)

If `--from-docs "path"` is provided, run BEFORE Phase 1:

```
1. Run /import-docs with the provided path
2. Scan all documents: PRDs, requirements, specs, business plans
3. Extract structured data and populate project files:
   - Business docs → IDEA_CANVAS.md, PRODUCT_SPEC.md
   - Requirements → BACKLOG.md
   - Technical specs → TECH_STACK.md, ARCHITECTURE.md
   - All docs → DOMAIN_MODEL.md (glossary + entities)
4. Determine which phases can be skipped (populated files)
5. Show import report to user
6. Continue from first incomplete phase
```

This allows users with existing documentation to skip the manual brainstorming
and jump straight to the phases where decisions haven't been made yet.

---

### Pre-Phase 4: TECHNOLOGY SELECTION
**Agent:** @architect | **Gate:** User approval | **State:** SELECTING

```
1. Read PRODUCT_SPEC.md and BACKLOG.md
2. Ask user about preferences:
   - Team experience (languages/frameworks)
   - Scale expectations
   - Budget constraints
   - Hard requirements (specific DB, cloud provider, etc.)
3. Spawn @architect:
   - Recommend complete stack with rationale
   - Show alternatives considered
   - Include install commands
4. Write output to .claude/project/TECH_STACK.md
5. Update PROJECT.md: Phase 4 = COMPLETE, add to Decision Log
6. Present stack summary table to user

USER GATE: "Is this tech stack acceptable? (approve / change specific choices)"
- approve → Phase 5
- change → User specifies which decisions to override, @architect adjusts
```

---

### Pre-Phase 5: ARCHITECTURE DESIGN
**Agents:** @architect + @ux-designer (parallel, if frontend) | **Gate:** User approval | **State:** ARCHITECTING

```
1. Read TECH_STACK.md, PRODUCT_SPEC.md, BACKLOG.md
2. Spawn agents:
   - @architect: System diagram, data model, API design, auth flow, directory structure
   - @ux-designer (if frontend): Component hierarchy, state management, routing
3. Merge into .claude/project/ARCHITECTURE.md
4. Update PROJECT.md: Phase 5 = COMPLETE
5. Present architecture overview to user

USER GATE: "Does this architecture look right? (approve / modify)"
- approve → Phase 6
- modify → User specifies changes, @architect revises
```

---

### Pre-Phase 6: SCAFFOLDING
**Agents:** @scaffolder + @infra (review) | **No gate** | **State:** SCAFFOLDING

```
1. Read ARCHITECTURE.md and TECH_STACK.md
2. Spawn @scaffolder:
   - Use official generator if available
   - Create directory structure per ARCHITECTURE.md
   - Create config files, dependency files, stubs
   - Install dependencies
   - Run verification (type check, lint, build)
3. Spawn @infra for review:
   - Check Dockerfile quality
   - Check CI pipeline
   - Check security of configs
   - Fix any issues found
4. Update PROJECT.md: Phase 6 = COMPLETE

AUTO-ADVANCE: No user gate (scaffolding is deterministic from approved architecture)
```

---

### Pre-Phase 7: ENVIRONMENT SETUP
**Process:** Automatic (existing skills) | **No gate** | **State:** SETTING_UP

```
1. Run /scan-codebase on the scaffolded project
   - 6 parallel agents fingerprint the generated code
   - Output: .claude/scan-results.md
2. Run /generate-environment from scan results
   - Generate: CLAUDE.md, agents, skills, rules, hooks, settings
   - Customize for the specific tech stack
3. Run /validate-setup
   - 170+ automated checks
   - Fix any issues found
4. Update PROJECT.md: Phase 7 = COMPLETE

AUTO-ADVANCE: No user gate (automated pipeline)
```

---

### Pre-Phase 8: LAUNCH PLANNING
**Agent:** @infra | **No gate** | **State:** PLANNING → READY_FOR_DEV

```
1. Read ARCHITECTURE.md, TECH_STACK.md, PRODUCT_SPEC.md
2. Spawn @infra:
   - Hosting plan with cost estimates
   - CI/CD pipeline design
   - Environment strategy (dev/staging/prod)
   - Monitoring & alerting plan
   - Rollback plan
   - Security checklist
   - Launch checklist
3. Write output to .claude/project/DEPLOY_STRATEGY.md
4. Update PROJECT.md:
   - Phase 8 = COMPLETE
   - Status = READY_FOR_DEV
5. Present deployment summary and launch checklist

TRANSITION: "Project is ready for development!

Recommended: Run /clarify --before-dev to validate all requirements are clear.
Then: /mvp-kickoff next to start the first MVP feature.
Or: /idea-to-launch --resume to auto-build all MVP features."
```

---

## Fast Mode (--fast)

Runs Phases 1, 2, and 3 sequentially but non-interactively (no user questions,
no intermediate gates), then presents a single combined gate at the end.

```
1. Spawn @strategist (NOT @ideator) with combined prompt:
   - Take the idea: "{user's description}"
   - Produce THREE outputs WITHOUT asking the user questions:

   OUTPUT 1 (IDEA_CANVAS.md):
     - Infer problem statement from the idea description
     - Infer target audience from context
     - Infer value proposition
     - Flag assumptions clearly: "ASSUMED: [assumption]"
     - Skip interactive questioning

   OUTPUT 2 (PRODUCT_SPEC.md):
     - Define MVP scope based on inferred problem
     - Write 3-5 user journeys with acceptance criteria
     - Define success metrics

   OUTPUT 3 (BACKLOG.md):
     - Brainstorm features from the user journeys
     - Categorize using MoSCoW
     - Size and order features

2. Write all three files
3. Run Phase 3b (Domain Model) non-interactively
4. Present COMBINED summary to user:
   - Idea Canvas summary
   - MVP scope (in/out)
   - Feature counts by category
   - Flagged assumptions
   - Domain entity count

SINGLE USER GATE:
  "Review the combined output. (approve all / refine specific phase / restart interactively)"
  - approve → Phase 4 (Tech Selection)
  - refine → User specifies which doc to revise, re-run that phase interactively
  - restart → Abandon fast mode, run /new-project without --fast
```

Then continue from Phase 4 (Tech Selection) normally with interactive gates.

---

## Decision Log

After each user gate approval, the orchestrator records the decision:

```
For each phase completion:
1. Read PROJECT.md Decision Log table
2. Append row:
   | {date} | {decision summary} | {rationale from user gate} | {phase agent} | Phase {N} |
3. Examples:
   | 2026-03-27 | MVP: invoicing + payments + clients | User confirmed 3 core features | @strategist | Phase 3 |
   | 2026-03-27 | Stack: Next.js + Prisma + PostgreSQL | Team knows TypeScript, need SSR | @architect | Phase 4 |
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Agent timeout | Save partial output to file, offer: retry with narrowed scope OR continue with partial |
| Missing prerequisite file | Show: "Phase {N} requires {file}. Run {phase command} first." with exact command |
| User cancels mid-flow (Ctrl+C) | StopFailure hook saves PROJECT.md state, resume with `--resume` |
| Generator fails in Phase 6 | Report error, offer: retry generator OR fall back to manual scaffolding |
| Validation fails between phases | Show specific failures, offer: fix automatically OR override and continue |
| Partial output from interrupted phase | On `--resume`: show partial output, offer: continue from partial OR restart phase |
| PROJECT.md corrupted/missing | Error: "PROJECT.md not found. Run /new-project without --resume to start fresh" |

## Context Budget

- Each phase runs in a subagent (separate context)
- Between phases: write state to disk (PROJECT.md), compact if needed
- Heavy phases (2, 5, 6) use `context: fork`
- Total orchestrator context: minimal (reads PROJECT.md status + invokes skills)

## Outputs

| Phase | Output File |
|-------|-------------|
| 1 | `.claude/project/IDEA_CANVAS.md` |
| 2 | `.claude/project/PRODUCT_SPEC.md` |
| 3 | `.claude/project/BACKLOG.md` |
| 4 | `.claude/project/TECH_STACK.md` |
| 5 | `.claude/project/ARCHITECTURE.md` |
| 6 | Project files (src/, tests/, configs) |
| 7 | `.claude/` environment (agents, skills, rules, hooks) |
| 8 | `.claude/project/DEPLOY_STRATEGY.md` |

## Definition of Done
- [ ] All 8 pre-development phases completed (or skipped with justification)
- [ ] PROJECT.md status is `READY_FOR_DEV`
- [ ] All project documents created and populated (no template placeholders)
- [ ] Cross-phase validation passed (no unresolved blockers between phases)
- [ ] Decision Log in PROJECT.md records all user gate approvals
- [ ] Project builds successfully (scaffold verified)
- [ ] Claude Code environment generated and validated
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/clarify --before-dev` — validate requirements, then `/mvp-kickoff next`
- **Iterate:** `/new-project --resume` — resume from last completed phase
- **Skip ahead:** `/idea-to-launch --resume` — continue full lifecycle automation

## Rollback
- **Redo a specific phase:** Run the individual phase skill (e.g., `/brainstorm --refine`, `/architecture --update`)
- **Restart entirely:** Delete `.claude/project/` and re-run `/new-project "idea"`
