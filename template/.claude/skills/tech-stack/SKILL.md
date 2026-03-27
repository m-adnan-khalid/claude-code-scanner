---
name: tech-stack
description: >
  AI-assisted technology stack recommendation based on project requirements, features,
  and constraints. Evaluates options with rationale and produces a decision document.
  Trigger: after /feature-map completes or when user needs tech stack advice.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
argument-hint: '[--from-spec | "requirements summary"]'
effort: high
---

# /tech-stack — Technology Stack Recommendation

## Overview
Recommend a technology stack based on product requirements, feature complexity, team
expertise, and deployment constraints. Produces a decision document with rationale.

## Usage
```
/tech-stack                                  # Auto-reads from project docs
/tech-stack --from-spec                      # Explicitly read from spec + backlog
/tech-stack "need real-time + mobile app"    # Direct requirements
/tech-stack --update                         # Revise existing decisions
```

## Process

### Step 1: Gather Context
- Read `.claude/project/PRODUCT_SPEC.md` for requirements and constraints
- Read `.claude/project/BACKLOG.md` for feature list and complexity
- Read `.claude/project/IDEA_CANVAS.md` for project type
- If `--update`: read existing `.claude/project/TECH_STACK.md`

### Step 2: Gather User Preferences
Ask the user (if not already known):
1. **Team experience:** What languages/frameworks does the team know?
2. **Scale expectations:** How many users at launch? In 1 year?
3. **Budget:** Are there hosting budget constraints?
4. **Preferences:** Any strong preferences or hard constraints? (e.g., "must use PostgreSQL")
5. **Deployment:** Cloud preference? (AWS/GCP/Azure/Vercel/Railway/self-hosted)

### Step 3: Invoke @architect

```
Read the following project documents:
- .claude/project/PRODUCT_SPEC.md
- .claude/project/BACKLOG.md
- .claude/project/IDEA_CANVAS.md (if exists)

User preferences:
{user answers from Step 2}

Recommend a complete technology stack. For EACH decision, provide:
- The choice and version
- Rationale (why this over alternatives)
- Alternative considered and why not

## Decisions Required

### Core Stack
1. **Language** — consider: team expertise, ecosystem, performance needs, hiring pool
2. **Backend Framework** — consider: routing, middleware, ORM support, community, docs
3. **Database** — consider: data model (relational/document/graph), scale, hosted options
4. **ORM/Query Builder** — consider: migration support, type safety, query complexity
5. **Authentication** — consider: JWT vs sessions, OAuth providers, complexity
6. **API Style** — REST vs GraphQL vs gRPC vs tRPC — based on client needs

### Frontend (if applicable)
7. **UI Framework** — consider: SSR needs, bundle size, learning curve, ecosystem
8. **State Management** — consider: complexity of state, server state vs client state
9. **Styling** — Tailwind vs CSS Modules vs styled-components vs other
10. **Build Tool** — Vite vs Webpack vs Turbopack vs other

### Infrastructure
11. **Hosting** — consider: cost, scalability, managed vs self-managed, deploy simplicity
12. **CI/CD** — GitHub Actions vs GitLab CI vs other — based on repo host
13. **Containerization** — Docker yes/no, orchestration needs

### Testing
14. **Unit/Integration** — Jest vs Vitest vs Pytest vs Go test vs other
15. **E2E** — Playwright vs Cypress vs none (for MVP)
16. **Package Manager** — npm vs pnpm vs yarn vs bun

## Reference Stacks (use as starting points, not gospel)

| Stack Name | Components | Best For |
|------------|------------|----------|
| MERN | MongoDB, Express, React, Node.js | Rapid prototyping, document-centric data |
| PERN | PostgreSQL, Express, React, Node.js | Relational data, structured queries |
| Next.js Full | Next.js, Prisma, PostgreSQL, NextAuth | Fullstack TypeScript, SSR, fast shipping |
| T3 Stack | Next.js, tRPC, Prisma, Tailwind, NextAuth | Type-safe fullstack, TypeScript-first |
| Django Full | Django, PostgreSQL, DRF, Celery | Admin-heavy, rapid prototyping, Python teams |
| Rails Full | Ruby on Rails, PostgreSQL, Hotwire | Convention-over-config, fast prototyping |
| Go API | Go, Gin/Echo, PostgreSQL, GORM | High performance APIs, microservices |
| SvelteKit | SvelteKit, Prisma, PostgreSQL | Lightweight, fast, excellent DX |

Write output to .claude/project/TECH_STACK.md with the full decision table,
alternatives considered, and install commands.
```

### Step 4: Validate Decisions

```
1. Completeness: verify all categories have a decision
2. Compatibility: verify no conflicting choices (e.g., Django + npm, Go + pip)
3. Hosting: verify hosting platform supports the chosen language/framework
4. Testing: verify testing framework matches the language
5. Constraints: cross-check with PRODUCT_SPEC.md constraints:
   - If budget constraint exists: verify hosting cost fits
   - If timeline constraint exists: verify team knows the stack (from user preferences)
   - If regulatory constraint exists: verify stack supports compliance (e.g., data residency)
```

### Step 4b: Cascade Warning (if --update)
If this is an update to an existing tech stack decision:
```
Check if downstream files exist:
  - ARCHITECTURE.md → warn: "Architecture may need redesign for new stack. Run /architecture --update"
  - Scaffolded project (src/ exists) → warn: "Project already scaffolded. Re-run /scaffold to regenerate"
  - DEPLOY_STRATEGY.md → warn: "Deployment strategy may need update. Run /deploy-strategy --update"
```

### Step 5: Update Project Tracker
- Update `.claude/project/PROJECT.md`:
  - Set Status to `SELECTING`
  - Set Tech Stack document status to `COMPLETE`
  - Set Phase 4 status to `COMPLETE` with timestamp
  - Add decision to Decision Log

### Step 6: Present to User
Show:
- Stack summary table (Layer | Choice | Version)
- Key rationale highlights
- Estimated hosting cost range
- Prompt: "Review the stack. Proceed to `/architecture` to design the system, or `/tech-stack --update` to change decisions."

## Outputs
- `.claude/project/TECH_STACK.md` — complete technology decisions
- `.claude/project/PROJECT.md` — updated with Phase 4 status

## Prerequisites
- `.claude/project/PRODUCT_SPEC.md` and `.claude/project/BACKLOG.md` (recommended)

## Next Step
`/architecture` — designs system architecture using the chosen stack
