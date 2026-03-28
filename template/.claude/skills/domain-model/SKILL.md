---
name: domain-model
description: >
  Extract and define domain model — glossary, entities, bounded contexts, business rules,
  and domain flows. Works for new projects (from product spec) and existing projects
  (from source code). Creates shared domain language for the entire team.
  Trigger: after /product-spec or /architecture, or when domain clarity is needed.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-spec | --from-code | --from-docs "path"] [--update]'
effort: high
---

# /domain-model — Domain Modeling & Business Context

## Overview
Extract, define, and visualize the business domain — glossary, entities, bounded contexts,
business rules, and domain flows. Creates a shared language document that ensures all agents
and team members use consistent terminology.

## Usage
```
/domain-model                                  # Auto-detect: reads spec or scans code
/domain-model --from-spec                      # Build from PRODUCT_SPEC.md + BACKLOG.md
/domain-model --from-code                      # Extract from existing source code
/domain-model --from-docs "path/to/docs/"      # Extract from existing business documents
/domain-model --from-docs "requirements.pdf"   # Extract from a single document
/domain-model --update                         # Revise existing DOMAIN_MODEL.md
```

## Process

### Step 1: Determine Source

**Auto-detect priority:**
1. If `.claude/project/PRODUCT_SPEC.md` exists → use `--from-spec` mode
2. If `src/` or equivalent source directory exists → use `--from-code` mode
3. If neither → prompt user for input mode

**Manual override:** User can specify `--from-spec`, `--from-code`, or `--from-docs`

### Step 2A: From Specification (New Projects)

Read `.claude/project/PRODUCT_SPEC.md`, `.claude/project/BACKLOG.md`, and `.claude/project/IDEA_CANVAS.md`.

Spawn @strategist:
```
Read the product specification and feature backlog. Extract the domain model:

1. GLOSSARY — Identify every domain-specific term:
   - Nouns from user journeys = potential entities (User, Invoice, Payment, etc.)
   - Verbs from acceptance criteria = potential domain events (Created, Submitted, Approved)
   - Industry jargon = needs precise definition
   - Ambiguous terms = needs disambiguation (does "account" mean user account or financial account?)
   For each term: definition, context where used, any aliases

2. ENTITIES — For each domain entity:
   - Description (what it represents in the business, NOT technical)
   - Key attributes with business meaning
   - Behaviors (what can be done with/to it)
   - Business rules (constraints, validations, permissions)
   - Relationships to other entities (1:1, 1:N, N:N with business meaning)
   - Mermaid class diagram showing entity relationships

3. BOUNDED CONTEXTS — Group related entities:
   - Each context owns a set of entities
   - Contexts communicate via defined interfaces (APIs, events)
   - Mermaid diagram showing context boundaries and connections
   - Map which features from BACKLOG.md belong to which context

4. DOMAIN EVENTS — Business-significant state changes:
   - What triggers each event
   - Who produces it, who consumes it
   - What data flows with the event
   - Ordering/causality between events

5. BUSINESS RULES — Explicit constraints:
   - Which entities they affect
   - Where they should be enforced (API, DB, UI)
   - Concrete examples of valid/invalid states

6. DOMAIN FLOWS — Key business processes as sequence diagrams:
   - Map each user journey to a domain flow
   - Show entity interactions
   - Show event emissions
   - Mermaid sequence diagrams

Write output to .claude/project/DOMAIN_MODEL.md
```

### Step 2B: From Existing Code

Spawn @explorer + @architect in parallel:
```
@explorer:
  Scan the codebase to extract domain knowledge:
  1. Read model/entity files — extract entity names, fields, relationships
  2. Read route/handler files — extract domain operations
  3. Read migration files — extract entity evolution
  4. Read test files — extract business rules from assertions
  5. Read error types — extract domain exceptions
  6. Grep for domain terms in comments, variable names, constants
  Output: raw domain extraction report

@architect:
  From @explorer's extraction, organize into structured domain model:
  1. Build glossary from entity names, field names, error types
  2. Map entities with relationships from ORM/model definitions
  3. Identify bounded contexts from module/package boundaries
  4. Extract domain events from event handlers, pub/sub, webhooks
  5. Derive business rules from validations, guards, middleware
  6. Create Mermaid diagrams for entities, contexts, and key flows
  Output: .claude/project/DOMAIN_MODEL.md
```

### Step 2C: From Existing Documents

Spawn @strategist:
```
Read the provided documents at: {path}

Supported formats: .md, .txt, .pdf, .docx (read as text)
For directories: read all documents within

Extract domain model from business documents:
1. Identify all domain terms and their definitions
2. Extract entities mentioned (nouns that represent things the system manages)
3. Extract relationships between entities
4. Extract business rules and constraints
5. Extract workflows and processes
6. Note any ambiguities or conflicts between documents

Cross-reference with existing project files if available:
- PRODUCT_SPEC.md — validate extracted entities match user journeys
- BACKLOG.md — validate entities support planned features
- ARCHITECTURE.md — validate entities match data model

Write output to .claude/project/DOMAIN_MODEL.md
Also update .claude/project/PRODUCT_SPEC.md if new insights found
```

### Step 3: Validate Domain Model
- Every entity in DOMAIN_MODEL.md should appear in ARCHITECTURE.md data model (if exists)
- Every entity should map to at least one feature in BACKLOG.md
- No orphan entities (connected to nothing)
- No circular mandatory dependencies
- Glossary terms used consistently across all project documents

### Step 4: Generate Domain Rules File
Create `.claude/rules/domain-terms.md` from the glossary:
```markdown
---
paths: "**/*"
---
# Domain Terminology
Use these terms consistently across all code, tests, and documentation:
- {Term}: {definition} (NOT {incorrect alias})
- {Term}: {definition}
```

### Step 5: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Domain Model document status to `COMPLETE`
  - Add domain decisions to Decision Log

### Step 6: Present to User
Show:
- Entity count and key relationships
- Bounded context count
- Business rule count
- Domain event count
- Glossary term count
- Any ambiguities or conflicts found
- Prompt: "Review the domain model. This feeds into /architecture for data model design."

## Outputs
- `.claude/project/DOMAIN_MODEL.md` — complete domain model with diagrams
- `.claude/rules/domain-terms.md` — domain glossary as coding rule
- `.claude/project/PROJECT.md` — updated status

## How It Integrates

| Phase | How Domain Model Is Used |
|-------|--------------------------|
| `/architecture` | Entities → data model (ERD), Contexts → module boundaries |
| `/scaffold` | Entities → model stubs, Rules → validation stubs |
| `/workflow` Phase 3 | @architect references DOMAIN_MODEL.md for design |
| `/workflow` Phase 4 | @product-owner uses glossary for acceptance criteria |
| `/workflow` Phase 7 | @reviewer checks domain term consistency |
| Code generation | All agents use glossary for naming conventions |

## Prerequisites
- At least one of: PRODUCT_SPEC.md, existing source code, or external documents

## Best Used After
- `/product-spec` (for new projects) — provides user journeys to extract entities from
- `/scan-codebase` (for existing projects) — provides code patterns to extract from

## Definition of Done
- [ ] DOMAIN_MODEL.md created at `.claude/project/DOMAIN_MODEL.md`
- [ ] Glossary covers all domain-specific terms with definitions
- [ ] All entities defined with attributes, behaviors, and relationships
- [ ] Bounded contexts identified with entity ownership and interfaces
- [ ] Business rules documented with enforcement locations and examples
- [ ] Domain events listed with triggers, producers, and consumers
- [ ] All terms consistent with code naming conventions
- [ ] `.claude/rules/domain-terms.md` generated from glossary
- [ ] PROJECT.md updated with Domain Model status COMPLETE
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/tech-stack` — choose technologies based on domain complexity
- **Iterate:** `/domain-model --update` — refine current domain model
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/domain-model --update` or `/domain-model --from-code`
- **Revert output:** Delete or overwrite `.claude/project/DOMAIN_MODEL.md`
