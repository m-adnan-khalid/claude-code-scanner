---
name: brainstorm
description: >
  Interactive idea brainstorming session. Explores the problem space, identifies target
  audience, evaluates competitive landscape, and produces a structured Idea Canvas.
  Trigger: when user wants to explore or refine a project idea.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '"your idea description"'
effort: high
---

# /brainstorm — Idea Brainstorming Session

## Overview
Run an interactive brainstorming session to explore and refine a project idea. Produces
a structured Idea Canvas document at `.claude/project/IDEA_CANVAS.md`.

## Usage
```
/brainstorm "Build a SaaS tool for freelancer invoicing"
/brainstorm "Mobile app for tracking hiking trails"
/brainstorm --refine    # Re-run on existing IDEA_CANVAS.md to refine
```

## Process

### Step 1: Parse Input
- Extract the core idea from the user's argument
- If `--refine` flag: read existing `.claude/project/IDEA_CANVAS.md` as starting point

### Step 2: Invoke @ideator
Spawn `@ideator` agent with the following prompt:

```
You are brainstorming a new project idea:
"{user's idea description}"

{If --refine: "Previous canvas exists, read .claude/project/IDEA_CANVAS.md and improve it."}

Follow your method: EXPLORE → QUESTION → STRUCTURE → EVALUATE → REFINE.

Ask the user 3-5 structured questions to deepen understanding before producing the canvas.
Focus on: Problem (what/who/how painful), Audience (who/context), Uniqueness (vs alternatives),
Scale (market size), Monetization (business model).

After gathering answers, produce a complete Idea Canvas with:
- Problem Statement (specific, testable)
- Target Audience (primary + secondary segments)
- Value Proposition (single sentence)
- Competitive Landscape (3-5 alternatives)
- SWOT Analysis
- Key Assumptions (need validation)
- Key Risks (with likelihood/impact/mitigation)
- Viability Assessment (STRONG/PROMISING/NEEDS_WORK/PIVOT_NEEDED)
- Recommended Next Steps
```

### Step 3: Write Output
- Save the Idea Canvas to `.claude/project/IDEA_CANVAS.md`
- Update `.claude/project/PROJECT.md`:
  - Set Status to `IDEATING`
  - Set Summary from the Problem Statement
  - Set Idea Canvas document status to `COMPLETE`
  - Set Phase 1 status to `COMPLETE` with timestamp

### Step 4: Present to User
Show the user:
- The completed Idea Canvas summary
- Viability assessment
- Prompt: "Review the canvas above. You can `/brainstorm --refine` to iterate, or proceed to `/product-spec` to create a product specification."

## Outputs
- `.claude/project/IDEA_CANVAS.md` — structured brainstorming output
- `.claude/project/PROJECT.md` — updated with Phase 1 status

## Prerequisites
- `.claude/project/PROJECT.md` must exist (created by `npx claude-code-scanner new` or manually)

## Next Step
`/product-spec` — converts the Idea Canvas into a full product specification
