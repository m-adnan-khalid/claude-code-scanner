# Full-Stack Developer Profile

## Role
Full-stack developer working across frontend, backend, and database layers.

## Primary Agents
- `@api-builder` — backend endpoints and services
- `@frontend` — UI components and pages
- `@mobile` — mobile screens (if applicable)
- `@debugger` — for cross-stack debugging
- `@tester` — for writing tests across all layers
- `@code-quality` — for design pattern and SOLID review

## Key Skills
- `/workflow new "feature"` — full SDLC (auto-routes to correct agents per layer)
- `/impact-analysis "change"` — check blast radius across stack
- `/e2e-browser` — real browser E2E tests (Playwright/Cypress)
- `/api-test` — real API test suites (Newman/Hurl)
- `/load-test` — real performance tests (k6/JMeter)
- `/visual-regression` — screenshot pixel-diff comparison
- `/coverage-track` — track test coverage deltas
- `/accessibility-audit` — WCAG 2.1 AA compliance
- `/mobile-audit` — mobile quality checks (if applicable)

## Typical Workflow
```
/workflow new "fullstack feature description"
# Phase 5 runs @api-builder + @frontend in parallel (worktree isolation)
# @tester runs after both merge
```

## Focus Areas
- API design and frontend integration
- Data flow from DB → API → UI
- Authentication and authorization across layers
- State management (server state vs client state)
- End-to-end testing across the full stack
- Performance across the entire request lifecycle

## Context Loading
Your session loads:
- CLAUDE.md (project overview)
- `.claude/rules/api.md` (endpoint conventions)
- `.claude/rules/frontend.md` (component patterns)
- `.claude/rules/database.md` (data layer rules)
