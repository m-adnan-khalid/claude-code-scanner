---
name: pi-planning
description: >
  Enterprise-scale program planning — PI (Program Increment) planning for SAFe, release train
  coordination, cross-team dependency mapping, capacity planning, and program board generation.
  Also supports scaled Scrum (LeSS, Nexus) and portfolio-level Kanban.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[plan PI-NAME | board | dependencies | capacity | status]"
effort: high
roles: [CTO, TechLead, PM, Architect]
agents: [@process-coach, @team-lead, @product-owner]
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


# /pi-planning $ARGUMENTS

## Commands
- `/pi-planning plan "PI-2026-Q2"` — Create PI plan: objectives, features, team assignments, iterations
- `/pi-planning board` — Generate program board (features × iterations × teams)
- `/pi-planning dependencies` — Map cross-team dependencies, identify risks, suggest mitigations
- `/pi-planning capacity` — Calculate team capacity per iteration (velocity × available devs)
- `/pi-planning status` — PI progress dashboard: features done, at risk, blocked

## Process

### Plan PI
1. Read `.claude/project/BACKLOG.md` for feature list with priorities and estimates
2. Read `.claude/project/METHODOLOGY.md` for iteration length and team structure
3. Group features by team capability (backend, frontend, mobile, infra)
4. Assign features to iterations based on:
   - Priority (Must-Have first, then Should-Have)
   - Dependencies (provider features before consumer features)
   - Team capacity (story points available per iteration)
   - Risk (high-risk features in early iterations for buffer)
5. Generate PI plan document at `.claude/project/PI-{name}.md`:
   ```
   # PI Plan: {name}
   Duration: {start} — {end} ({N} iterations × {length} each)

   ## PI Objectives
   1. {business objective} — features: F1, F2, F3
   2. {business objective} — features: F4, F5

   ## Iteration Plan
   | Iteration | Team A (Backend) | Team B (Frontend) | Team C (Mobile) |
   |-----------|-----------------|-------------------|-----------------|
   | Sprint 1  | F1: User Auth   | F4: Login Page    | F7: App Shell   |
   | Sprint 2  | F2: Payments    | F5: Dashboard     | F8: Push Notif  |

   ## Dependencies
   - F4 (Login Page) depends on F1 (User Auth) — must complete Sprint 1
   - F8 (Push Notif) depends on F2 (Payments webhook)

   ## Risks
   - F2 (Payments) has external dependency (Stripe integration)
   ```

### Program Board
1. Generate visual board (Mermaid gantt chart):
   - X-axis: iterations/sprints
   - Y-axis: teams
   - Features placed as bars spanning their iteration(s)
   - Dependencies shown as arrows between features
2. Highlight: critical path, at-risk features, dependency bottlenecks
3. Save to `.claude/project/PI-{name}-board.md`

### Cross-Team Dependencies
1. Scan all features for `depends-on` relationships
2. Classify: same-team (internal) vs cross-team (external)
3. For cross-team dependencies:
   - Verify provider feature is scheduled before consumer
   - Flag if in same iteration (risky — tight coupling)
   - Suggest: API contract definition before implementation
4. Detect circular dependencies across teams
5. Output: dependency graph with risk indicators

### Capacity Planning
1. Per team: count available developers × iteration length × velocity factor
2. Subtract: holidays, on-call, maintenance buffer (20%)
3. Compare: assigned story points vs available capacity
4. Flag: over-allocated teams (>90% capacity), under-allocated (<50%)
5. Suggest: feature rebalancing or scope reduction

### PI Status
1. Read all TASK records for features in this PI
2. Aggregate: features done, in progress, not started, blocked
3. Calculate: burnup chart data (planned vs actual)
4. Flag: features at risk of missing PI deadline
5. Output: executive dashboard with RAG (Red/Amber/Green) status

## Scaled Framework Support
- **SAFe:** PI planning, ART sync, innovation sprint, inspect & adapt
- **LeSS:** Sprint planning with multiple teams, overall retrospective
- **Nexus:** Integration team coordination, cross-team refinement
- **Portfolio Kanban:** Epic flow, capacity allocation across value streams

## Definition of Done
- PI plan created with all features assigned to iterations
- Dependencies mapped and no circular dependencies
- Capacity validated (no team over 90%)
- Program board generated with critical path highlighted

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
