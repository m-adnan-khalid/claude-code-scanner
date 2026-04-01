---
name: feature-map
description: >
  Feature brainstorming, MoSCoW prioritization, and feature tree generation. Breaks
  a product spec into sized, ordered, dependency-mapped features with a clear MVP boundary.
  Trigger: after /product-spec completes or when user needs to organize features.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-spec | "feature area to explore"]'
effort: high
roles: [PM, CTO, TechLead, Architect]
agents: [@product-owner, @strategist, @ideator, @architect]
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


# /feature-map — Feature Brainstorming & Prioritization

## Overview
Break a product specification into a prioritized feature backlog using MoSCoW method.
Each feature is sized, dependency-mapped, and ordered for implementation.

## Usage
```
/feature-map                           # Auto-reads from PRODUCT_SPEC.md
/feature-map --from-spec               # Explicitly read from spec
/feature-map "payments module"         # Focus on specific area
/feature-map --update                  # Revise existing BACKLOG.md
```

## Process

### Step 1: Gather Context
- Read `.claude/project/PRODUCT_SPEC.md` for MVP definition and user journeys
- Read `.claude/project/IDEA_CANVAS.md` for problem context
- If `--update`: read existing `.claude/project/BACKLOG.md`
- If area specified: focus brainstorming on that area only

### Step 2: Invoke @strategist

```
Read the Product Spec at .claude/project/PRODUCT_SPEC.md.

Create a comprehensive Feature Backlog:

1. BRAINSTORM: List every possible feature implied by the user journeys and MVP scope.
   Think broadly — include obvious features AND non-obvious supporting features
   (auth, settings, error handling, onboarding, data export, etc.)

2. CATEGORIZE using MoSCoW:
   - Must-Have: Without these, the product cannot deliver its core value proposition.
     These ARE the MVP. Be strict — if it's not core, it's not Must-Have.
   - Should-Have: Important for a good experience but can launch without.
     First priority after MVP launch.
   - Could-Have: Nice additions that enhance the product. Second priority.
   - Won't-Have: Explicitly out of scope. Prevents scope creep.
     Include the condition under which to revisit.

3. SIZE each feature:
   - S (Small): 1-2 SDLC cycles, single agent scope, <10 files
   - M (Medium): 2-4 SDLC cycles, may need frontend+backend, 10-30 files
   - L (Large): 4+ SDLC cycles, fullstack + infra, 30+ files — flag for splitting

4. MAP DEPENDENCIES:
   - Which features must exist before others can start?
   - Draw a feature tree showing module groupings
   - Identify the critical path (longest dependency chain)

5. ORDER for implementation:
   - Must-Haves first, in dependency order
   - Foundation/infrastructure features before user-facing features
   - Features that unblock the most other features get priority
   - Recommend specific sequence with rationale for each position

Write output to .claude/project/BACKLOG.md
```

### Step 3: Validate Backlog

Cross-phase validation (run automatically, report issues at user gate):

```
1. Coverage check:
   - Read PRODUCT_SPEC.md MVP scope (in-scope items)
   - For each MVP item: verify at least one Must-Have feature covers it
   - Report: "MVP item X has no corresponding Must-Have feature" → add or reclassify

2. Dependency validation:
   - Build dependency graph from feature dependencies
   - Detect circular dependencies → error with resolution guidance
   - Detect cross-category dependencies (Must depends on Should) → warn: promote or decouple
   - Calculate critical path (longest dependency chain) → report length

3. Size validation:
   - Count L-sized Must-Have features → warn if > 2: "Consider splitting for MVP"
   - Total Must-Have count > 10 → warn: "Large MVP — consider phased delivery"
   - Provide splitting suggestions for each L-sized feature

4. Completeness check:
   - Every feature has: description, size, status
   - Won't-Have features have "Revisit When" condition
   - Implementation order covers all Must-Have features
```

### Step 4: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `MAPPING`
  - Set Feature Backlog document status to `COMPLETE`
  - Set Phase 3 status to `COMPLETE` with timestamp

### Step 5: Present to User
Show:
- Feature count by category (Must: N, Should: N, Could: N, Won't: N)
- MVP feature list with sizes
- Implementation order (first 5 features)
- Critical path length
- Any L-sized features flagged for splitting
- Prompt: "Review the backlog. Proceed to `/tech-stack` to choose technologies, or `/feature-map --update` to revise."

## Outputs
- `.claude/project/BACKLOG.md` — prioritized feature backlog
- `.claude/project/PROJECT.md` — updated with Phase 3 status

## Prerequisites
- `.claude/project/PRODUCT_SPEC.md` must exist

## Definition of Done
- [ ] BACKLOG.md created at `.claude/project/BACKLOG.md`
- [ ] All features categorized using MoSCoW (Must/Should/Could/Won't)
- [ ] All Must-Have features sized (S/M/L)
- [ ] Dependencies mapped with no circular references
- [ ] No orphan features (every feature maps to a user journey)
- [ ] Implementation order defined for all Must-Have features
- [ ] Critical path identified and documented
- [ ] PROJECT.md updated with Phase 3 status COMPLETE
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/domain-model` — extract domain entities, or `/tech-stack` — choose technologies
- **Iterate:** `/feature-map --update` — revise current backlog
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/feature-map --update` or `/feature-map "specific area"`
- **Revert output:** Delete or overwrite `.claude/project/BACKLOG.md`

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
