---
name: product-spec
description: >
  Generate a complete product specification from an idea canvas. Defines MVP scope,
  user journeys with acceptance criteria, user flows, and success metrics.
  Trigger: after /brainstorm completes or when user has a defined idea to formalize.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-canvas | "product description"]'
effort: high
roles: [PM, CTO, TechLead]
agents: [@product-owner, @strategist, @ux-designer]
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


# /product-spec — Product Specification Generator

## Overview
Convert an idea into a concrete product specification with MVP scope, user journeys,
acceptance criteria, user flows, and success metrics.

## Usage
```
/product-spec                           # Auto-reads from IDEA_CANVAS.md
/product-spec --from-canvas             # Explicitly read from canvas
/product-spec "A tool for X that does Y" # Direct description (no canvas needed)
/product-spec --update                  # Revise existing PRODUCT_SPEC.md
```

## Process

### Step 1: Gather Context
- If `--from-canvas` or no argument: read `.claude/project/IDEA_CANVAS.md`
- If direct description provided: use that as input
- If `--update`: read existing `.claude/project/PRODUCT_SPEC.md`
- Verify `.claude/project/PROJECT.md` exists

### Step 2: Invoke Agents in Parallel

**Agent 1: @strategist** — Product specification
```
Read the following context:
{idea canvas or description}

Create a complete Product Specification with:
1. Vision statement (one paragraph, aspirational but concrete)
2. MVP Definition:
   - In scope: numbered list of core capabilities (minimum viable)
   - Out of scope: numbered list with rationale for each exclusion
3. User Journeys (3-5 journeys covering primary use cases):
   - As a [user], I want [goal], so that [benefit]
   - Steps: numbered user-system interactions
   - Acceptance Criteria: GIVEN/WHEN/THEN format (2-4 per journey)
4. Success Metrics (KPIs):
   - 3-5 measurable metrics with targets and measurement methods
5. Constraints:
   - Timeline, budget, technical, regulatory
6. Open Questions:
   - Unresolved decisions that need user input

Write output to .claude/project/PRODUCT_SPEC.md
```

**Agent 2: @ux-designer** — User flows and screen mapping
```
Read the following context:
{idea canvas or description}

Create UX design additions for the Product Spec:
1. User Flow diagrams (Mermaid flowcharts) for each major journey
2. Page/Screen hierarchy (text tree)
3. Key screen wireframe descriptions (purpose, elements, actions)
4. Navigation structure
5. Responsive strategy (mobile-first or desktop-first, breakpoints)

Append your output to the User Flows section of .claude/project/PRODUCT_SPEC.md
```

### Step 3: Merge Outputs
- Ensure PRODUCT_SPEC.md has both strategy content and UX flows
- Verify all user journeys have acceptance criteria
- Verify user flows cover all journeys

### Step 4: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `SPECIFYING`
  - Set Product Spec document status to `COMPLETE`
  - Set Phase 2 status to `COMPLETE` with timestamp

### Step 5: Present to User
Show:
- MVP scope summary (in/out)
- Number of user journeys defined
- Number of acceptance criteria
- Open questions (if any)
- Prompt: "Review the spec. Proceed to `/feature-map` to prioritize features, or `/product-spec --update` to revise."

## Outputs
- `.claude/project/PRODUCT_SPEC.md` — complete product specification
- `.claude/project/PROJECT.md` — updated with Phase 2 status

## Prerequisites
- `.claude/project/IDEA_CANVAS.md` (recommended) or direct description
- `.claude/project/PROJECT.md` must exist

## Definition of Done
- [ ] PRODUCT_SPEC.md created at `.claude/project/PRODUCT_SPEC.md`
- [ ] MVP scope defined with in-scope and out-of-scope lists
- [ ] 3+ user journeys written with GIVEN/WHEN/THEN acceptance criteria
- [ ] User flows (Mermaid diagrams) cover all journeys
- [ ] Success metrics defined with measurable targets
- [ ] Constraints documented (timeline, budget, technical, regulatory)
- [ ] PROJECT.md updated with Phase 2 status COMPLETE
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/feature-map` — break the spec into prioritized features
- **Iterate:** `/product-spec --update` — revise current product specification
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/product-spec --update` or `/product-spec "new description"`
- **Revert output:** Delete or overwrite `.claude/project/PRODUCT_SPEC.md`

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
