---
name: methodology
description: Choose and configure SDLC methodology (Scrum, Kanban, Waterfall, XP, DevOps, Lean, Spiral, RAD, etc.). Adapts agents, workflows, quality gates, and ceremonies to the selected model.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob, Agent
argument-hint: "[--select|--show|--adapt|--status] [model-name]"
---

# Methodology Configuration: $ARGUMENTS

## Commands

### `/methodology` or `/methodology --select`
Interactive methodology selection. Invoke @process-coach to:
1. Ask 7 discovery questions about the project
2. Recommend a model with rationale
3. After user confirms, configure the workspace

### `/methodology --show [model]`
Show details of a specific model without configuring:
```
/methodology --show scrum
/methodology --show kanban
/methodology --show waterfall
```

### `/methodology --adapt`
Re-configure workspace if methodology needs to change mid-project.
Preserves existing tasks and history, updates workflow and ceremonies.

### `/methodology --status`
Show current methodology configuration and adherence metrics.

## Configuration Steps (after model selected)

### Step 1: Write METHODOLOGY.md
Write `.claude/project/METHODOLOGY.md` with full configuration:
- Selected model + rationale
- Ceremonies/rituals schedule
- Role-to-agent mapping
- Quality gates (definition of ready, definition of done)
- Metrics to track
- Borrowed practices from other models

### Step 2: Adapt Workflow Skill
Update the workflow phases in `.claude/skills/workflow/SKILL.md` to match:

| Methodology | Workflow Phases |
|-------------|----------------|
| **Scrum** | planning → design → dev → test → review → QA → demo → retro → deploy |
| **Kanban** | pull → dev → test → review → deploy (continuous) |
| **Waterfall** | requirements → design → implement → test → deploy |
| **XP** | story → TDD-cycle → integrate → accept |
| **DevOps** | plan → code → build → test → release → deploy → monitor |
| **Lean** | hypothesis → experiment → measure → learn → persist/pivot |
| **Spiral** | objectives → risk-analysis → develop → review |

### Step 3: Configure Quality Gates
Set up gates in the workflow that match the methodology:

**Scrum gates:**
- Sprint planning: all stories have acceptance criteria
- Sprint review: working increment demonstrated
- Definition of done: tests pass + reviewed + QA approved

**Kanban gates:**
- WIP limit: max N items in-progress (block new pulls if exceeded)
- Pull criteria: requirements clear before pulling

**Waterfall gates:**
- Phase sign-off: no proceeding until current phase is approved
- Requirements freeze: no changes after design begins
- Code freeze: no new features during testing

**XP gates:**
- TDD: test must exist and fail before writing code
- All tests green: 100% pass required for merge
- Pair reviewed: second pair of eyes on all production code

### Step 4: Set Ceremony Reminders
Configure appropriate ceremonies based on model:

**Scrum:** daily standup, sprint planning (start), review + retro (end)
**Kanban:** daily flow check, weekly replenishment, bi-weekly review
**XP:** daily standup, weekly iteration planning, continuous integration
**Waterfall:** phase kickoff meeting, phase review meeting
**DevOps:** daily deploy review, weekly incident review

### Step 5: Adapt Agent Behavior
Update agent instructions based on methodology:

**Scrum:** @team-lead acts as Scrum Master, @product-owner manages sprint backlog
**Kanban:** @team-lead monitors WIP limits, flow metrics
**XP:** @tester writes tests FIRST, @api-builder/@frontend do TDD
**Waterfall:** @architect completes full design before @api-builder starts
**DevOps:** @infra owns pipeline, all agents deploy independently

## Available Models Reference

### Quick Selection Guide
```
Solo developer, MVP         → Lean or Kanban
Small team, product dev     → Scrum or XP
Medium team, mixed work     → Scrumban (Scrum + Kanban)
Large team, enterprise      → SAFe or Scrum-of-Scrums
Fixed requirements          → Waterfall or V-Model
High risk, evolving scope   → Spiral
Continuous deployment       → DevOps / CI-CD
Research / prototype        → RAD or Prototype Model
Feature-focused large team  → FDD (Feature Driven)
```

## Post-Configuration
After methodology is configured:
1. Run `/validate-setup` to verify configuration
2. Start work with `/workflow new "first task"` (adapted to chosen model)
3. Use `/methodology --status` to check adherence
4. Use `/methodology --adapt` if process needs tweaking
