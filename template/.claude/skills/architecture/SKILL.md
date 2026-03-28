---
name: architecture
description: >
  System architecture design for new projects. Creates data models, API design, component
  hierarchy, system diagrams, and directory structure based on tech stack decisions.
  Trigger: after /tech-stack completes or when user needs architecture design.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-stack | "system description"]'
effort: high
---

# /architecture — System Architecture Design

## Overview
Design the complete system architecture: data models, API endpoints, component hierarchy,
authentication flows, and directory structure — all based on approved tech stack decisions.

## Usage
```
/architecture                           # Auto-reads from project docs
/architecture --from-stack              # Explicitly read from tech stack
/architecture "microservices with event bus" # Specific architecture style
/architecture --update                  # Revise existing architecture
```

## Process

### Step 1: Gather Context
- Read `.claude/project/TECH_STACK.md` for technology decisions
- Read `.claude/project/PRODUCT_SPEC.md` for requirements and user journeys
- Read `.claude/project/BACKLOG.md` for feature list and dependencies
- Read `.claude/project/DOMAIN_MODEL.md` (if exists) for entities, relationships, and business rules
- If `--update`: read existing `.claude/project/ARCHITECTURE.md`

### Step 2: Invoke Agents in Parallel

**Agent 1: @architect** — System architecture design
```
Read all project documents:
- .claude/project/TECH_STACK.md
- .claude/project/PRODUCT_SPEC.md
- .claude/project/BACKLOG.md
- .claude/project/DOMAIN_MODEL.md (if exists — use entities for data model, bounded contexts for module boundaries, business rules for validation layer)

Design the complete system architecture:

1. SYSTEM OVERVIEW
   - Mermaid diagram showing all components and their connections
   - Brief description of each component's responsibility
   - Communication patterns (sync HTTP, async queues, events)

2. DATA MODEL
   - Mermaid ERD diagram with all entities, relationships, and key fields
   - Include: primary keys (uuid), foreign keys, created_at/updated_at
   - Note: indexes, unique constraints, cascade behavior
   - Separate clearly: core entities vs supporting entities

3. API DESIGN
   - Complete endpoint table: Method, Path, Description, Auth, Request, Response
   - Follow RESTful conventions (or GraphQL schema if chosen)
   - Include: pagination, filtering, sorting patterns
   - Include: error response format (consistent across all endpoints)
   - Include: versioning strategy (URL path: /api/v1/)

4. AUTHENTICATION FLOW
   - Mermaid sequence diagram showing auth flow end-to-end
   - Registration, login, token refresh, logout, password reset
   - Role/permission model if applicable

5. DIRECTORY STRUCTURE
   - Complete project tree matching the tech stack
   - Annotate each directory with its purpose
   - Follow framework conventions (e.g., Next.js app router, Django apps)

6. KEY DESIGN DECISIONS
   - Table: Decision, Choice, Rationale, Trade-offs
   - Include: error handling strategy, logging approach, config management

7. SECURITY CONSIDERATIONS
   - Auth/authz strategy
   - Input validation approach
   - Data encryption (at rest, in transit)
   - Rate limiting
   - CORS policy

8. SCALABILITY NOTES
   - Expected load and bottlenecks
   - Caching strategy
   - Database scaling approach

Write output to .claude/project/ARCHITECTURE.md
```

**Agent 2: @ux-designer** (only if project has frontend)
```
Read:
- .claude/project/PRODUCT_SPEC.md (user journeys and flows)
- .claude/project/TECH_STACK.md (frontend framework choice)

Design frontend architecture:

1. COMPONENT HIERARCHY
   - Complete tree of pages, layouts, and shared components
   - Mark each component: page / layout / feature / shared / provider

2. STATE MANAGEMENT
   - What state lives where: server state (react-query/SWR), client state (context/store), URL state (params/query)
   - Data flow diagram

3. ROUTING
   - Complete route table: Path, Component, Auth Required, Layout

4. KEY PATTERNS
   - Form handling approach
   - Error boundary strategy
   - Loading state management
   - Responsive breakpoint strategy

Append frontend architecture to .claude/project/ARCHITECTURE.md
```

### Step 3: Merge & Validate

Cross-phase validation (run automatically, report issues at user gate):

```
1. Journey coverage:
   - For each user journey in PRODUCT_SPEC.md: verify at least one API endpoint supports it
   - Report: "Journey X has no corresponding API endpoint" → add endpoint

2. Domain coverage (if DOMAIN_MODEL.md exists):
   - For each entity in DOMAIN_MODEL.md: verify it appears in the data model (ERD)
   - For each business rule: verify enforcement location is specified
   - For each bounded context: verify it maps to a module/directory
   - Report: "Entity X from domain model has no data model entry" → add to ERD

3. Feature coverage:
   - For each Must-Have feature in BACKLOG.md: verify data model supports it
   - Report: "Feature X requires entity Y which is not in the data model" → add entity

4. Stack consistency:
   - Verify directory structure matches TECH_STACK.md framework conventions
   - (e.g., Next.js uses app/ router, Django uses apps/, Go uses cmd/)
   - Report: "Directory structure uses X pattern but TECH_STACK.md specifies Y framework"

5. Merge frontend + backend:
   - Ensure ARCHITECTURE.md has both sections (if fullstack)
   - Verify API endpoints match frontend component data needs
   - Flag gaps or inconsistencies
```

### Step 4: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `ARCHITECTING`
  - Set Architecture document status to `COMPLETE`
  - Set Phase 5 status to `COMPLETE` with timestamp

### Step 5: Present to User
Show:
- System overview (high-level component list)
- Entity count and key relationships
- Endpoint count
- Directory structure summary
- Key design decisions
- Prompt: "Review the architecture. Proceed to `/scaffold` to generate the project, or `/architecture --update` to revise."

## Outputs
- `.claude/project/ARCHITECTURE.md` — complete system architecture
- `.claude/project/PROJECT.md` — updated with Phase 5 status

## Prerequisites
- `.claude/project/TECH_STACK.md` must exist

## Definition of Done
- [ ] ARCHITECTURE.md created at `.claude/project/ARCHITECTURE.md`
- [ ] Data model (ERD) covers all domain entities with relationships
- [ ] API design includes complete endpoint table with auth, request/response shapes
- [ ] Component hierarchy defined (if frontend exists)
- [ ] Directory structure matches tech stack conventions
- [ ] Authentication flow documented with sequence diagram
- [ ] All key design decisions recorded with rationale and trade-offs
- [ ] Security considerations documented
- [ ] PROJECT.md updated with Phase 5 status COMPLETE
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/scaffold` — generate actual project files from this architecture
- **Iterate:** `/architecture --update` — revise current architecture design
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/architecture --update` or `/architecture "new style"`
- **Revert output:** Delete or overwrite `.claude/project/ARCHITECTURE.md`
