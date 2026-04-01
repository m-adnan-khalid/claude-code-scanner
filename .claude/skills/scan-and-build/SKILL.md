---
name: scan-and-build
description: >
  Document Intelligence Installer — scans a folder of documents (or markdown codebase),
  classifies every file, extracts project intelligence, creates full task registry with
  stories, then builds a complete workspace with IDEA_CANVAS, PRODUCT_SPEC, BACKLOG,
  DOMAIN_MODEL, GLOSSARY, BRD, requirements, process flows, design briefs, agents,
  skills, hooks, and state files. Single command from folder path to production workspace.
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
/scan-and-build C:\Users\sara\Documents\ProjectBriefs
/scan-and-build ./my-project-docs
/scan-and-build .    (scan current directory)
```

## What It Does
Combines the Document Intelligence Installer phases into a single automated pipeline:

### Phase 1 — VALIDATE
- Confirm folder exists and is accessible
- List all readable files by extension (.md, .txt, .docx, .pdf, .xlsx, .csv, .pptx)
- Report findings or request correction
- **Output:** File list with read confirmation per file

### Phase 2 — SCAN AND CLASSIFY
Read every file and classify it:

| Classification | Content Signals |
|---------------|----------------|
| IDEA_CANVAS | problem, opportunity, vision, SWOT, target audience |
| PRODUCT_SPEC | features, user stories, MVP, roadmap, PRD, acceptance criteria |
| BACKLOG | priorities, MoSCoW, sprint, effort, feature list |
| REQUIREMENTS | FR-, NFR-, GIVEN/WHEN/THEN, use case, the system must |
| BRD | business requirements, as-is, to-be, gap analysis, RACI |
| PROCESS_FLOW | workflow, swimlane, step 1...step 2, current process |
| DESIGN_BRIEF | screen, UI, wireframe, Figma, mockup, component |
| STAKEHOLDER_MAP | names + roles, RACI, responsible, accountable |
| MEETING_NOTES | date + attendees + action items + decisions |
| STRATEGY_DECK | TAM, SAM, market, competitive, go to market |
| DATA_ANALYTICS | KPI, metrics, conversion, OKR, performance |
| UNKNOWN | cannot classify — flag, archive, do not discard |

Extract from every file: PROJECT_NAME, DOMAIN, ENTITIES, STAKEHOLDERS,
REQUIREMENTS_RAW, DECISIONS, OPEN_ITEMS, GAPS.

Infer role from document style (never ask):
- Technical + sprint + API → TechLead/Dev
- Business case + ROI → Exec/PM
- GIVEN/WHEN/THEN + RACI → BA/Analyst
- UI + flows + components → Designer/UX

**Output:** DOC_MAP table + extracted intelligence

### Phase 3 — PLAN (CREATE ALL TASKS AND STORIES)
Before any file is created:

1. Create `.claude/project/TASK_REGISTRY.md` with ALL tasks pre-registered
2. Create STORY files for every workspace document slot:
   - STORY-001: IDEA_CANVAS (@ideator)
   - STORY-002: PRODUCT_SPEC (@strategist)
   - STORY-003: BACKLOG (@strategist)
   - STORY-004: DOMAIN_MODEL + GLOSSARY (@analyst)
   - STORY-005: BRD (@analyst)
   - STORY-006: Requirements per feature (@analyst)
   - STORY-007: Process flows (@analyst)
   - STORY-008: Design briefs (@analyst)
3. Every story has: user story, acceptance criteria (GIVEN/WHEN/THEN), subtasks, DoD
4. Set dependencies between all tasks
5. Create infrastructure tasks (folders, agents, skills, hooks, state files)

**Output:** TASK_REGISTRY.md + all story files + all task files

### Phase 4 — IMPLEMENT (dependency order)
Execute in dependency order, using parallel agents where possible:

```
TASK-004 (folders)
├── STORY-001 (IDEA_CANVAS) ── parallel ── STORY-004 (DOMAIN_MODEL)
│   └── STORY-002 (PRODUCT_SPEC)
│       └── STORY-003 (BACKLOG)
│           └── STORY-005 (BRD) — needs 001,002,003,004
│               └── STORY-006 (Requirements)
│                   ├── STORY-007 (Flows) ── parallel ── STORY-008 (Briefs)
TASK-005 (PROJECT.md)
TASK-006 (agents) → TASK-007 (skills) → TASK-008 (hooks) → TASK-009 (state)
TASK-010 (archive) → TASK-011 (verify)
```

Infrastructure tasks (005-011) run in parallel with stories where no dependency exists.

**Output:** All workspace documents populated from scan intelligence

### Phase 5 — VERIFY AND REPORT
- Verify every artifact exists and has content
- Count lines per file
- Report: done/partial/todo per document
- List open stories (gaps that need user action)
- Show the single most impactful next command

**Output:** Final report with artifact inventory, task summary, next actions

## Artifacts Created

| Category | Count | Files |
|----------|-------|-------|
| Project docs | 8 | IDEA_CANVAS, PRODUCT_SPEC, BACKLOG, DOMAIN_MODEL, GLOSSARY, BRD, PROJECT, TASK_REGISTRY |
| Stories | 8+ | .claude/project/stories/STORY-*.md |
| Requirements | 6 | docs/requirements/{pipeline,rbac,hooks,agents,skills,workflow}.md |
| Process flows | 5 | docs/flows/{pipeline,feature-workflow,rbac-setup,hook-event,agent-handoff}.md |
| Design briefs | 3 | docs/design/{cli-output,execution-report,dashboard-concept}-brief.md |
| Agents | 5 | ideator, strategist, product-owner, analyst, version-manager |
| Skills | 6 | prompt-intelligence, doc-exporter, notion-formatter, slack-summary, figma-brief, scan-and-build |
| Hooks | 7 | pre-session-check, post-write-log, stop-memory-write, pre-compact-archive, git-push-gate, git-commit-gate, git-merge-gate |
| State files | 3 | session.env, source-documents/INDEX.md, logs/ |

## Ambiguity Handling
- Per ambiguity: ask ONE question, then continue immediately
- Project name conflict → "Found 'A' and 'B' — which is correct?"
- Conflicting statements → "Doc A says X, Doc B says Y — which?"
- Type unclear → "[file] looks like Spec or BRD — which? (A/B)"
- For anything reasonably inferable: infer, never ask unnecessarily

## Task-First Law
This skill enforces the core law:
- NO ACTION WITHOUT A TASK
- NO TASK WITHOUT A PLAN
- NO STORY WITHOUT FULL ACCEPTANCE CRITERIA
- NO IMPLEMENTATION WITHOUT TRACKING
- NO GIT OPERATION WITHOUT @version-manager CLEARANCE

## Version Control Integration
After workspace build, if user requests commit/push:
1. @version-manager runs full 10-gate sequence
2. Branch must follow naming convention
3. Commit must use Conventional Commits format
4. All stories must be DONE or IN_REVIEW
5. Clearance certificate issued before push

## Definition of Done
- [ ] All phases completed (validate → scan → plan → implement → verify)
- [ ] TASK_REGISTRY fully populated with all tasks and stories
- [ ] All story files created with acceptance criteria
- [ ] All workspace documents populated (content or [?] gaps)
- [ ] All infrastructure artifacts created (agents, skills, hooks, state)
- [ ] Verification report shows 100% artifact coverage
- [ ] MEMORY.md updated with build summary
- [ ] Final report displayed with next actions
