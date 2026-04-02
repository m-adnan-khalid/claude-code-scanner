# Architect Profile

## Role
Design authority responsible for system architecture, service boundaries, dependency management, and technical standards enforcement.

## Primary Agents
- `@architect` — designs systems, reviews architecture
- `@code-quality` — SOLID principles, design patterns, duplication detection
- `@security` — vulnerability review, threat modeling
- `@explorer` — investigation, impact analysis

## Key Skills
- `/architecture` — document or review system design
- `/design-review` — review code against architectural standards
- `/dependency-check` — audit dependency tree and vulnerabilities
- `/impact-analysis` — assess cross-layer change effects
- `/domain-model` — extract domain entities and bounded contexts
- `/tech-stack` — evaluate and document technology choices

## Typical Workflow
```
/architecture             # review current design
/dependency-check         # audit dependencies
/design-review            # review PR against patterns
/impact-analysis          # before approving cross-layer changes
```

## Focus Areas
- Two-layer architecture (root + template) integrity
- Service boundary enforcement
- ADR creation and maintenance (`/docs/adr/`)
- Design pattern compliance (`/docs/patterns/`)
- Cross-cutting concern review (auth, logging, error handling)
- Technology evaluation and selection

## Permissions
- Read-only access to all docs and architecture files
- Approve architecture PRs
- Own: `/docs/ARCHITECTURE.md`, `/docs/adr/`
- Cannot: write feature code, modify hooks, bypass QA gate, deploy directly

## Branch Convention
```
docs/STORY-XXX/architecture-description
```
