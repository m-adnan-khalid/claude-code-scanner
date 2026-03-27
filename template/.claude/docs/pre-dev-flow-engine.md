# Pre-Development Flow Engine

## Overview
The pre-development pipeline transforms a raw idea into a development-ready project through 8 sequential phases. Each phase produces a persistent document in `.claude/project/` that feeds into subsequent phases.

## Orchestration Model
- All pre-dev phases are coordinated by `/new-project` (or individual skills run standalone)
- Subagents cannot spawn other subagents — all coordination flows through the orchestrator
- Every agent produces a structured HANDOFF block at completion
- State is persisted to `.claude/project/PROJECT.md` after every phase

## State Machine

```
IDEATING → SPECIFYING → MAPPING → MODELING → SELECTING → ARCHITECTING
  → SCAFFOLDING → SETTING_UP → PLANNING → READY_FOR_DEV
```

**Document import shortcut:** If `--from-docs` is used, populated phases are skipped.


**Special states (from any phase):**
- `PAUSED` — user interrupted, resume with `--resume`
- `CANCELLED` — user abandoned project setup

## Phase Details

### Pre-Phase 1: IDEATION
**State:** IDEATING
**Skill:** `/brainstorm`
**Agent:** @ideator (opus, read-only, 25 turns)
**Gate:** User approval required

```
Input: Raw idea description from user
Process:
  1. @ideator asks 3-5 structured questions:
     - What problem does this solve?
     - Who has this problem? (primary audience)
     - What do they use today? (alternatives)
     - What makes your approach unique?
     - How could this generate value?
  2. User answers questions
  3. @ideator produces Idea Canvas:
     - Problem Statement (specific, testable)
     - Target Audience (segments with pain points)
     - Value Proposition (single sentence)
     - Competitive Landscape (3-5 alternatives)
     - SWOT Analysis
     - Key Risks with mitigation
     - Viability Assessment (STRONG/PROMISING/NEEDS_WORK/PIVOT_NEEDED)
Output: .claude/project/IDEA_CANVAS.md
```

**User gate options:**
- `approve` → advance to Phase 2
- `refine` → re-run @ideator with feedback
- `skip` → advance with canvas marked DRAFT

**Skip conditions:**
- `--skip-brainstorm` flag: skip entirely, use raw description
- `--fast` flag: combine with Phases 2+3

---

### Pre-Phase 2: PRODUCT SPECIFICATION
**State:** SPECIFYING
**Skill:** `/product-spec`
**Agents:** @strategist (opus, 30 turns) + @ux-designer (opus, 20 turns) — PARALLEL
**Gate:** User approval required

```
Input: IDEA_CANVAS.md (or raw description if Phase 1 skipped)
Process:
  PARALLEL:
    @strategist:
      1. Define MVP scope (in/out boundaries)
      2. Write user journeys (As a... I want... So that...)
      3. Define acceptance criteria (GIVEN/WHEN/THEN)
      4. Set success metrics (KPIs with targets)
      5. Note constraints and open questions
    @ux-designer:
      1. Create user flow diagrams (Mermaid)
      2. Map page/screen hierarchy
      3. Describe key screen wireframes
      4. Define navigation structure
      5. Note accessibility requirements
  MERGE: Combine into single PRODUCT_SPEC.md
Output: .claude/project/PRODUCT_SPEC.md
```

**User gate options:**
- `approve` → advance to Phase 3
- `adjust scope` → @strategist revises MVP boundaries
- `add journeys` → @strategist + @ux-designer add more journeys/flows

---

### Pre-Phase 3: FEATURE MAP
**State:** MAPPING
**Skill:** `/feature-map`
**Agent:** @strategist (opus, 30 turns)
**Gate:** User approval required

```
Input: PRODUCT_SPEC.md
Process:
  1. Brainstorm ALL features (obvious + supporting)
  2. Categorize using MoSCoW:
     - Must-Have: core value, IS the MVP
     - Should-Have: important, first post-MVP
     - Could-Have: nice additions, second priority
     - Won't-Have: explicitly excluded (prevents scope creep)
  3. Size each feature: S/M/L
  4. Map dependencies between features
  5. Create feature tree visualization
  6. Recommend implementation order (dependency + value based)
Output: .claude/project/BACKLOG.md
```

**User gate options:**
- `approve` → advance to Phase 4
- `move features` → re-categorize specific features
- `add features` → add to appropriate category

**Validation:** Every MVP feature from PRODUCT_SPEC.md must appear in Must-Have.

---

### Pre-Phase 3b: DOMAIN MODELING
**State:** MODELING
**Skill:** `/domain-model`
**Agent:** @strategist (opus, 30 turns)
**Gate:** User approval required

```
Input: PRODUCT_SPEC.md + BACKLOG.md
Process:
  @strategist:
    1. Extract domain entities from user journeys (nouns = entities)
    2. Extract domain events from acceptance criteria (verbs = events)
    3. Build glossary of all domain-specific terms with precise definitions
    4. Identify bounded contexts (group related entities by responsibility)
    5. Define business rules as explicit constraints
    6. Create Mermaid class diagrams for entity relationships
    7. Create Mermaid sequence diagrams for key domain flows
    8. Map which features from BACKLOG.md belong to which bounded context
Output: .claude/project/DOMAIN_MODEL.md + .claude/rules/domain-terms.md
```

**User gate options:**
- `approve` → advance to Phase 4
- `refine` → @strategist revises domain model with feedback

**Integration:** The domain model feeds directly into `/architecture`:
- Entities → data model (ERD)
- Bounded contexts → module/service boundaries
- Business rules → validation layer
- Domain events → event handlers, pub/sub

---

### Document Import (`--from-docs`)

Run BEFORE Phase 1 when user has existing documents:

```
Input: Path to documents (PRD, requirements, business plan, technical spec)
Process:
  1. Scan and classify all documents at the path
  2. Extract structured data:
     - Business docs → IDEA_CANVAS.md, PRODUCT_SPEC.md
     - Requirements → BACKLOG.md
     - Technical specs → TECH_STACK.md, ARCHITECTURE.md
     - All docs → DOMAIN_MODEL.md (glossary + entities)
  3. Populate project files (skip already-populated unless --merge)
  4. Generate import report showing which phases can be skipped
  5. Continue from first incomplete phase
Output: Populated project files + import report
```

This enables users with existing documentation to skip manual brainstorming phases and jump directly to phases requiring new decisions.

---

### Pre-Phase 4: TECHNOLOGY SELECTION
**State:** SELECTING
**Skill:** `/tech-stack`
**Agent:** @architect (opus, 25 turns)
**Gate:** User approval required
**Interactive:** Asks user about team experience, budget, scale

```
Input: PRODUCT_SPEC.md + BACKLOG.md + user preferences
Process:
  1. Ask user about constraints (team skills, budget, scale, preferences)
  2. Evaluate options for each layer:
     - Language, Framework, Database, ORM, Auth, API style
     - Frontend (if applicable): UI framework, state, styling, build
     - Infrastructure: hosting, CI/CD, containers
     - Testing: unit/integration/e2e, package manager
  3. For each decision: choice + version + rationale + alternative considered
  4. Include dependency install commands
Output: .claude/project/TECH_STACK.md
```

**Reference stacks:** MERN, PERN, Next.js+Prisma, T3, Django, Rails, Go+Gin, SvelteKit

**User gate options:**
- `approve` → advance to Phase 5
- `change` → override specific technology choices

---

### Pre-Phase 5: ARCHITECTURE DESIGN
**State:** ARCHITECTING
**Skill:** `/architecture`
**Agents:** @architect (opus, 25 turns) + @ux-designer (if frontend) — PARALLEL
**Gate:** User approval required

```
Input: TECH_STACK.md + PRODUCT_SPEC.md + BACKLOG.md
Process:
  PARALLEL:
    @architect:
      1. System overview diagram (Mermaid)
      2. Data model / ERD (Mermaid)
      3. API endpoint design (complete table)
      4. Authentication flow (Mermaid sequence)
      5. Directory structure plan
      6. Key design decisions with rationale
      7. Security considerations
      8. Scalability notes
    @ux-designer (if frontend):
      1. Component hierarchy tree
      2. State management strategy
      3. Routing table
      4. Key interaction patterns
  MERGE: Combine into single ARCHITECTURE.md
Output: .claude/project/ARCHITECTURE.md
```

**Validation:**
- API endpoints cover all user journeys
- Data model supports all backlog features
- Directory structure matches framework conventions

**User gate options:**
- `approve` → advance to Phase 6
- `modify` → @architect revises specific sections

---

### Pre-Phase 6: SCAFFOLDING
**State:** SCAFFOLDING
**Skill:** `/scaffold`
**Agents:** @scaffolder (sonnet, 40 turns) + @infra (review)
**Gate:** None (auto-advance)

```
Input: ARCHITECTURE.md + TECH_STACK.md + PRODUCT_SPEC.md
Process:
  @scaffolder:
    1. Use official generator if available (create-next-app, etc.)
    2. Create directory structure per ARCHITECTURE.md
    3. Create config files (linter, formatter, TypeScript, test, editor)
    4. Create .env.example (never real secrets)
    5. Create Dockerfile + docker-compose (if applicable)
    6. Create CI pipeline (.github/workflows/)
    7. Create stub files (route handlers, models, test examples)
    8. Install dependencies
    9. Run verification: type check, lint, build
  @infra (review):
    1. Review Dockerfile quality
    2. Review CI pipeline
    3. Review security of configs
    4. Fix any issues
Output: Actual project files in working directory
```

**Auto-advance:** Scaffolding is deterministic from approved architecture — no user gate needed.

---

### Pre-Phase 7: ENVIRONMENT SETUP
**State:** SETTING_UP
**Process:** Automatic (runs existing skills)
**Gate:** None (auto-advance)

```
Process:
  1. /scan-codebase — 6 parallel agents scan the scaffolded project
     Output: .claude/scan-results.md
  2. /generate-environment — create Claude Code config from scan
     Output: customized agents, skills, rules, hooks, settings
  3. /validate-setup — 170+ automated checks
     Output: validation report
```

**Auto-advance:** Fully automated pipeline.

---

### Pre-Phase 8: LAUNCH PLANNING
**State:** PLANNING → READY_FOR_DEV
**Skill:** `/deploy-strategy`
**Agent:** @infra (sonnet, 30 turns)
**Gate:** None (final phase)

```
Input: ARCHITECTURE.md + TECH_STACK.md + PRODUCT_SPEC.md
Process:
  @infra:
    1. Define environments (dev/staging/prod)
    2. Hosting plan with cost estimates
    3. CI/CD pipeline design (Mermaid diagram)
    4. Monitoring & alerting strategy
    5. Domain & DNS setup
    6. Rollback plan
    7. Security checklist
    8. Launch checklist
Output: .claude/project/DEPLOY_STRATEGY.md
```

**Transition to SDLC:**
- PROJECT.md status → `READY_FOR_DEV`
- User prompted to start first MVP feature: `/workflow new "Feature 1"`
- Or auto-iterate all features: `/idea-to-launch --resume`

---

## Fast Mode (--fast)

Combines Phases 1+2+3 into a single @strategist call:
```
Input: Raw idea description
Process: @strategist produces all three documents in one pass:
  1. Idea Canvas (Problem, Audience, Value Proposition)
  2. Product Spec (MVP scope, User Journeys, Acceptance Criteria)
  3. Feature Backlog (MoSCoW, sized, ordered)
Output: IDEA_CANVAS.md + PRODUCT_SPEC.md + BACKLOG.md
Gate: Single user approval for all three
```
Then continues from Phase 4 (Tech Selection) normally.

---

## Transition to Existing SDLC

When pre-dev completes, the existing 13-phase SDLC gains richer context:

| SDLC Phase | Pre-Dev Enhancement |
|------------|---------------------|
| Phase 1 (Intake) | Pre-populate scope/complexity from BACKLOG.md |
| Phase 3 (Architecture) | Reference ARCHITECTURE.md — skip redesign |
| Phase 4 (Business) | Reference PRODUCT_SPEC.md for acceptance criteria |
| Phase 11 (Deploy) | Reference DEPLOY_STRATEGY.md for deployment approach |

If `.claude/project/` files don't exist, the SDLC proceeds exactly as before (fully backward compatible).

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Agent hits maxTurns | Save partial output, offer retry with narrowed scope |
| Missing prerequisite file | Show which file is needed and which phase creates it |
| User cancels mid-flow | Save progress to PROJECT.md, resume with `--resume` |
| Generator fails in Phase 6 | Fall back to manual scaffolding, report error |
| Validation fails in Phase 7 | Show failures, offer auto-fix or manual correction |
| Session ends unexpectedly | All state is in PROJECT.md — resume with `--resume` |

---

## Context Budget

- Each pre-dev phase runs in a subagent (separate context window)
- Between phases: state written to disk (PROJECT.md), compact if needed
- Heavy phases (2, 5, 6) use `context: fork`
- Orchestrator context: minimal (reads PROJECT.md status, invokes skills)
- Total pre-dev context cost: ~0% (all forked/subagent work)

---

## Output Files Summary

| Phase | Output | Persists |
|-------|--------|----------|
| — | `.claude/project/PROJECT.md` | Master tracker, always updated |
| import | Populated project files from existing docs | Across all features |
| 1 | `.claude/project/IDEA_CANVAS.md` | Across all features |
| 2 | `.claude/project/PRODUCT_SPEC.md` | Across all features |
| 3 | `.claude/project/BACKLOG.md` | Updated per feature completion |
| 3b | `.claude/project/DOMAIN_MODEL.md` + `.claude/rules/domain-terms.md` | Across all features |
| 4 | `.claude/project/TECH_STACK.md` | Across all features |
| 5 | `.claude/project/ARCHITECTURE.md` | Across all features |
| 6 | Project source files | Working directory |
| 7 | `.claude/` environment | Working directory |
| 8 | `.claude/project/DEPLOY_STRATEGY.md` | Across all features |
