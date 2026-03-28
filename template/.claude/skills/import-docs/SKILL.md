---
name: import-docs
description: >
  Scan and import existing project documents (PRDs, requirements, business plans, specs)
  into the pre-development pipeline. Extracts structure from unstructured documents and
  populates project files. Use when starting with existing documentation.
  Trigger: when user has existing documents and wants to bootstrap the pre-dev pipeline.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '"path/to/docs" [--type prd|requirements|business-plan|spec|auto]'
effort: high
---

# /import-docs — Document Scanner & Context Builder

## Overview
Scan existing project documents (PRDs, requirements specs, business plans, pitch decks,
wireframes, technical specs) and extract structured information to populate the
pre-development project files. Bridges the gap between existing documentation and
the Claude Code Scanner pipeline.

## Usage
```
/import-docs "docs/requirements.md"                    # Single document
/import-docs "docs/"                                    # Scan entire directory
/import-docs "PRD.pdf"                                  # PDF document
/import-docs "docs/" --type prd                         # Hint document type
/import-docs "docs/" --merge                            # Merge with existing project files
/import-docs "https://docs.google.com/..." --type spec  # URL (if web fetch available)
```

## What It Can Import

| Document Type | Extracts | Populates |
|---------------|----------|-----------|
| PRD (Product Requirements Doc) | Vision, scope, user stories, acceptance criteria | PRODUCT_SPEC.md, BACKLOG.md |
| Requirements Spec | Functional/non-functional requirements, constraints | PRODUCT_SPEC.md, BACKLOG.md |
| Business Plan | Problem, audience, value prop, competitors, market | IDEA_CANVAS.md |
| Technical Spec | Architecture, tech stack, data model, API design | TECH_STACK.md, ARCHITECTURE.md |
| Wireframes/Mockups (text) | Screen descriptions, user flows, navigation | PRODUCT_SPEC.md (UX sections) |
| Pitch Deck (text) | Problem, solution, market, business model | IDEA_CANVAS.md |
| Meeting Notes | Decisions, requirements, action items | Relevant project files + Decision Log |
| Existing README | Project description, setup, tech stack | IDEA_CANVAS.md, TECH_STACK.md |

## Process

### Step 1: Discover & Read Documents
```
1. If path is a file: read it
2. If path is a directory: find all readable files
   - Supported: .md, .txt, .pdf, .docx, .json, .yaml, .csv
   - Skip: binary files, images, videos, node_modules, .git
3. If --type provided: use as classification hint
4. If --type auto (default): classify each document automatically
```

### Step 2: Classify Documents

Spawn @strategist:
```
Read each document and classify it:

For each document, determine:
- Type: PRD | requirements | business-plan | technical-spec | wireframe | pitch | meeting-notes | readme | other
- Confidence: HIGH | MEDIUM | LOW
- Key sections found: [list of identifiable sections]
- Relevance: which project files this should populate

Output a classification report before proceeding.
```

### Step 3: Extract Structured Data

Based on classification, spawn appropriate agents:

**For PRD / Requirements / Business docs → @strategist:**
```
Extract from these documents:

1. IDEA CANVAS (if not already populated):
   - Problem statement (what problem is described?)
   - Target audience (who is mentioned as users/customers?)
   - Value proposition (what value/benefit is promised?)
   - Competitive landscape (any competitors mentioned?)
   - Risks (any risks or concerns mentioned?)

2. PRODUCT SPEC:
   - Vision/mission (any high-level goals?)
   - MVP scope (what's described as core/essential/v1?)
   - User journeys (any user stories, use cases, or workflows?)
   - Acceptance criteria (any specific conditions or requirements?)
   - Success metrics (any KPIs, targets, or goals?)
   - Constraints (timeline, budget, regulatory, technical?)
   - Open questions (any TBDs, unknowns, or decisions pending?)

3. FEATURE BACKLOG:
   - Features mentioned (explicit features, requirements, capabilities)
   - Priority signals (words like "must", "critical", "nice to have", "future")
   - Dependencies mentioned between features
   - Size signals (words like "simple", "complex", "major effort")

Preserve the source document's language and intent. Flag assumptions clearly.
```

**For Technical docs → @architect:**
```
Extract from these documents:

1. TECH STACK:
   - Languages, frameworks, databases mentioned
   - Infrastructure choices (cloud, containers, CI/CD)
   - Third-party services or APIs mentioned
   - Performance/scale requirements

2. ARCHITECTURE:
   - System components described
   - Data model / entities mentioned
   - API endpoints or interfaces described
   - Authentication/authorization approach
   - Integration points

Preserve the source document's technical decisions. Don't override — document.
```

**For UX docs → @ux-designer:**
```
Extract from these documents:

1. USER FLOWS:
   - Screen/page descriptions
   - Navigation patterns
   - User interactions described
   - Wireframe elements mentioned

Add to PRODUCT_SPEC.md user flows section.
```

### Step 4: Populate Project Files

Based on extraction, populate (or merge with existing):

```
For each project file:
  IF file is empty/template → write extracted content
  IF file has content AND --merge flag:
    → Read existing content
    → Identify non-overlapping information from import
    → Append new sections, merge overlapping sections
    → Flag conflicts: "CONFLICT: doc says X, existing file says Y"
  IF file has content AND no --merge flag:
    → Warn: "PRODUCT_SPEC.md already has content. Use --merge to combine."
    → Skip this file
```

### Step 5: Run Domain Extraction

After populating project files, automatically run domain extraction:
```
Read all populated project files.
Extract domain glossary terms from imported documents.
Create initial DOMAIN_MODEL.md with entities and glossary found.
Create .claude/rules/domain-terms.md with terminology.
```

### Step 6: Determine Next Phase

Based on what was imported, determine which pre-dev phases can be skipped:

```
IF IDEA_CANVAS.md populated → Phase 1 (Ideation) can be skipped
IF PRODUCT_SPEC.md populated → Phase 2 (Product Spec) can be skipped
IF BACKLOG.md populated → Phase 3 (Feature Map) can be skipped
IF TECH_STACK.md populated → Phase 4 (Tech Selection) can be skipped
IF ARCHITECTURE.md populated → Phase 5 (Architecture) can be skipped

Update PROJECT.md phase table accordingly.
Suggest: "/new-project --resume" to continue from first incomplete phase.
```

### Step 7: Import Report

Present to user:
```
## Import Report

### Documents Scanned
| File | Type | Confidence | Sections Found |
|------|------|------------|----------------|

### Project Files Populated
| File | Status | Sections Added | Conflicts |
|------|--------|----------------|-----------|

### Phase Impact
| Phase | Status | Reason |
|-------|--------|--------|
| 1. Ideation | SKIPPABLE | IDEA_CANVAS.md populated from business plan |
| 2. Product Spec | PARTIAL | User journeys extracted, acceptance criteria missing |
| 3. Feature Map | SKIPPABLE | 12 features extracted and prioritized |
| 4. Tech Selection | NEEDED | No technical decisions found |
| ...

### Domain Terms Extracted: {N} terms
### Conflicts Found: {N} (review required)
### Missing Information: {list of gaps}

Next: /new-project --resume (starts at Phase {N})
Or: Review imported files and run individual phases to fill gaps
```

## Outputs
- `.claude/project/IDEA_CANVAS.md` — populated from business docs
- `.claude/project/PRODUCT_SPEC.md` — populated from PRD/requirements
- `.claude/project/BACKLOG.md` — populated from feature lists
- `.claude/project/TECH_STACK.md` — populated from technical specs
- `.claude/project/ARCHITECTURE.md` — populated from technical specs
- `.claude/project/DOMAIN_MODEL.md` — extracted domain glossary and entities
- `.claude/rules/domain-terms.md` — domain terminology as coding rule
- `.claude/project/PROJECT.md` — updated phase status

## Merge Behavior
- Without `--merge`: only writes to empty/template files, skips populated ones
- With `--merge`: combines imported data with existing content, flags conflicts
- Conflicts are marked inline: `<!-- IMPORT CONFLICT: ... -->` for manual resolution

## Prerequisites
- `.claude/project/PROJECT.md` must exist (run `npx claude-code-scanner new` first)
- At least one document to import

## Best Used Before
- `/new-project` — import first, then resume from first incomplete phase
- `/domain-model` — import populates initial data, domain-model refines it

## Definition of Done
- [ ] All provided documents read and classified (type + confidence)
- [ ] Structured data extracted from each document
- [ ] Project files populated (IDEA_CANVAS, PRODUCT_SPEC, BACKLOG, TECH_STACK, ARCHITECTURE as applicable)
- [ ] Domain glossary and entities extracted into DOMAIN_MODEL.md
- [ ] `.claude/rules/domain-terms.md` generated from terminology
- [ ] Phase status updated in PROJECT.md (skippable phases marked)
- [ ] Import report generated with document table, populated files, and gaps
- [ ] Conflicts flagged inline for manual resolution (if `--merge`)
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/new-project --resume` — continue from first incomplete phase
- **Iterate:** `/import-docs "path" --merge` — import additional documents and merge
- **Skip ahead:** `/clarify --before-dev` — validate all requirements before development

## Rollback
- **Redo this phase:** `/import-docs "path" --merge` to re-import with merge strategy
- **Revert output:** Delete populated project files and re-import from scratch
