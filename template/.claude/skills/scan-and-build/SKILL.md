---
name: scan-and-build
description: >
  Document Intelligence Installer — scans a folder of documents or codebase,
  classifies every file, extracts project intelligence, creates full task registry
  with agile stories, then builds a complete workspace with project documents,
  requirements, process flows, design briefs, agents, skills, hooks, and state files.
invocation: user
context: fork
effort: high
lifecycle: T1
---

# /scan-and-build [folder_path]

## Purpose
One command to scan any document folder and build a complete Claude Code workspace
with full task tracking, agile stories, and document intelligence.

## Usage
```
/scan-and-build /path/to/documents
/scan-and-build ./my-project-docs
/scan-and-build .
```

## Pipeline

### Phase 1 — VALIDATE
- Confirm folder exists and is accessible
- List all readable files (.md, .txt, .docx, .pdf, .xlsx, .csv, .pptx)

### Phase 2 — SCAN AND CLASSIFY
Read every file and classify:
- IDEA_CANVAS, PRODUCT_SPEC, BACKLOG, REQUIREMENTS, BRD, PROCESS_FLOW,
  DESIGN_BRIEF, STAKEHOLDER_MAP, MEETING_NOTES, STRATEGY_DECK, DATA_ANALYTICS, UNKNOWN

Extract: PROJECT_NAME, DOMAIN, ENTITIES, STAKEHOLDERS, REQUIREMENTS_RAW,
DECISIONS, OPEN_ITEMS, GAPS.

### Phase 3 — PLAN
Create TASK_REGISTRY.md with all tasks and stories BEFORE any implementation.
Every story has: user story, GIVEN/WHEN/THEN acceptance criteria, subtasks, DoD.

### Phase 4 — IMPLEMENT
Execute in dependency order with parallel agents:
- IDEA_CANVAS → PRODUCT_SPEC → BACKLOG → BRD → Requirements → Flows + Briefs
- DOMAIN_MODEL runs parallel with IDEA_CANVAS
- Infrastructure tasks (agents, skills, hooks, state) parallel with stories

### Phase 5 — VERIFY AND REPORT
Verify all artifacts, display final report with task summary and next actions.

## Task-First Law
- NO ACTION WITHOUT A TASK
- NO TASK WITHOUT A PLAN
- NO STORY WITHOUT ACCEPTANCE CRITERIA
- NO IMPLEMENTATION WITHOUT TRACKING
- NO GIT OPERATION WITHOUT @version-manager CLEARANCE

## Artifacts Created
- 8 project documents (IDEA_CANVAS through TASK_REGISTRY)
- 8+ story files with full agile structure
- 6 requirements files (per feature area)
- 5 process flow documents with Mermaid diagrams
- 3 design briefs
- 5 agents (ideator, strategist, product-owner, analyst, version-manager)
- 6 skills (prompt-intelligence, doc-exporter, notion-formatter, slack-summary, figma-brief, scan-and-build)
- 7 hooks (session, logging, memory, archive, git gates)
- State files (session.env, source index, logs)
