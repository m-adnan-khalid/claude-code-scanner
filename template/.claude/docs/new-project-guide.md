# New Project Guide

## When to Use `new` vs `init`

| Scenario | Command | Why |
|----------|---------|-----|
| You have an existing codebase | `npx claude-code-scanner init` | Scans existing code, generates environment |
| You're starting from scratch | `npx claude-code-scanner new my-project` | Creates project + pre-dev pipeline |
| You have an idea but no code | `npx claude-code-scanner new my-project` | Full idea-to-launch support |

## Quick Start

```bash
# Create a new project
npx claude-code-scanner new my-awesome-app

# Enter the project
cd my-awesome-app

# Start Claude Code
claude

# Option 1: Full guided pipeline (recommended)
/new-project "Build a task management app for remote teams"

# Option 2: Fast mode (less interactive)
/new-project "Task management app" --fast

# Option 3: Skip brainstorming (you know what you want)
/new-project "Task management app with Kanban boards" --skip-brainstorm

# Option 4: Import existing documents (PRD, requirements, etc.)
/new-project "Task management app" --from-docs "docs/"

# Option 5: Run individual phases
/brainstorm "task management for remote teams"
/product-spec
/feature-map
/domain-model
/tech-stack
/architecture
/scaffold
/deploy-strategy

# Option 6: Full automation (idea to deployed product)
/idea-to-launch "Build a task management app for remote teams"
```

## The 8 Pre-Development Phases

### Phase 1: Brainstorming (`/brainstorm`)
- Interactive session with @ideator agent
- Explores: problem, audience, value proposition, competition, risks
- Output: `.claude/project/IDEA_CANVAS.md`
- You review and approve before moving on

### Phase 2: Product Specification (`/product-spec`)
- @strategist defines MVP scope and user journeys
- @ux-designer creates user flows and screen hierarchy
- Output: `.claude/project/PRODUCT_SPEC.md`
- You approve the MVP scope

### Phase 3: Feature Mapping (`/feature-map`)
- @strategist brainstorms all features
- Prioritizes using MoSCoW (Must/Should/Could/Won't)
- Sizes each feature (S/M/L)
- Output: `.claude/project/BACKLOG.md`
- You confirm the MVP feature set

### Phase 3b: Domain Modeling (`/domain-model`)
- @strategist extracts domain entities, glossary, bounded contexts
- Creates Mermaid class diagrams and sequence diagrams
- Defines business rules and domain events
- Output: `.claude/project/DOMAIN_MODEL.md` + `.claude/rules/domain-terms.md`
- You verify the domain model captures the business correctly

### Phase 4: Technology Selection (`/tech-stack`)
- @architect recommends complete stack
- Asks about your team's experience and preferences
- Output: `.claude/project/TECH_STACK.md`
- You approve tech choices

### Phase 5: Architecture Design (`/architecture`)
- @architect designs system, data model, API
- @ux-designer designs component hierarchy (if frontend)
- Output: `.claude/project/ARCHITECTURE.md`
- You approve the design

### Phase 6: Scaffolding (`/scaffold`)
- @scaffolder generates actual project files
- Uses official generators when available
- Installs dependencies, runs verification
- Auto-advances (no approval needed)

### Phase 7: Environment Setup (automatic)
- Runs `/scan-codebase` on generated scaffold
- Runs `/generate-environment` to create Claude Code config
- Runs `/validate-setup` for 170+ checks
- Auto-advances

### Phase 8: Launch Planning (`/deploy-strategy`)
- @infra creates deployment plan
- CI/CD, hosting, monitoring, launch checklist
- Output: `.claude/project/DEPLOY_STRATEGY.md`

## After Pre-Development

Your project is now ready for feature development. The backlog has prioritized features.

```bash
# Build features one at a time using the 13-phase SDLC
/workflow new "User authentication with email/password"
/workflow new "Dashboard with task overview"
/workflow new "Kanban board with drag-and-drop"

# Or check status
/task-tracker status
```

## Importing Existing Documents

If you already have a PRD, requirements doc, business plan, or technical spec:

```bash
# Import a single document
/import-docs "path/to/requirements.md"

# Import a directory of documents
/import-docs "docs/"

# Import and merge with existing project files
/import-docs "docs/" --merge

# Then continue from where import left off
/new-project --resume
```

The import scanner:
- Classifies each document (PRD, requirements, business plan, technical spec)
- Extracts structured data and populates project files
- Extracts domain terminology and creates a glossary
- Shows which pre-dev phases can be skipped
- Flags any conflicts between imported documents

## Re-Running Individual Phases

You can re-run any phase independently to update decisions:

```bash
# Changed your mind about tech stack?
/tech-stack --update

# Want to add more features?
/feature-map --update

# Need to revise architecture after tech change?
/architecture --update
```

Each phase reads from the previous phase's output, so changes cascade forward. After changing Phase 4 (tech stack), you should re-run Phase 5 (architecture) and Phase 6 (scaffold).

## Resuming After Interruption

All state is saved to `.claude/project/PROJECT.md`. If your session ends:

```bash
claude
/new-project --resume    # Continues from last completed phase
```

## Adding Pre-Dev Planning to Existing Projects

If you set up with `npx claude-code-scanner init` and want to add pre-dev planning:

```bash
# Project templates are already copied by init. Start using them:
/import-docs "existing-docs/"      # Import from existing PRDs/specs
/clarify --existing                # Scan codebase for requirement gaps
/feature-map                       # Create feature backlog from codebase
/domain-model --from-code          # Extract domain model from existing code
```

## Pivoting or Major Changes Mid-Development

### Product Pivot
```bash
/clarify --full                    # Assess current state
/brainstorm --refine               # Re-think the idea with new direction
/product-spec --update             # Revise product specification
/feature-map --update              # Re-prioritize features
# Cascade warning will suggest which downstream phases need re-running
```

### Technology Stack Change
```bash
/tech-stack --update               # Change technology decisions
# Warning: "Architecture may need redesign. Run /architecture --update"
/architecture --update             # Update system design
# Warning: "Project already scaffolded. Run /scaffold to regenerate"
/scaffold                          # Re-generate project files (preserves .claude/project/)
```

### Architecture Change (Monolith → Microservices)
```bash
/architecture --update             # Redesign architecture
/domain-model --update             # Review bounded contexts for service boundaries
/scaffold                          # Re-generate project structure
/deploy-strategy --update          # Update deployment for multi-service
```

## Post-MVP Development

After launching the MVP:

```bash
/launch-mvp --post-mvp             # Transition to post-MVP phase
/mvp-kickoff next                  # Start first Should-Have feature
/release-notes v1.1.0              # Generate release notes after each deploy
/cost-estimate --compare           # Track cost growth
/sync --check                      # Weekly drift detection
```

## Project Files Reference

| File | Created By | Purpose |
|------|-----------|---------|
| `.claude/project/PROJECT.md` | Orchestrator | Master tracker, phase progress |
| `.claude/project/IDEA_CANVAS.md` | Phase 1 | Problem, audience, value prop |
| `.claude/project/PRODUCT_SPEC.md` | Phase 2 | MVP scope, user journeys |
| `.claude/project/BACKLOG.md` | Phase 3 | Prioritized feature list |
| `.claude/project/TECH_STACK.md` | Phase 4 | Technology decisions |
| `.claude/project/ARCHITECTURE.md` | Phase 5 | System design, data model, API |
| `.claude/project/DOMAIN_MODEL.md` | Phase 3b | Entities, glossary, bounded contexts |
| `.claude/project/DEPLOY_STRATEGY.md` | Phase 8 | Hosting, CI/CD, launch plan |
