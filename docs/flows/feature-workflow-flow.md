# Process Flow: 13-Phase Feature Workflow

**Source:** CLAUDE.md, README.md, docs/DOMAIN-TEST-GUIDE.md
**Owner:** @analyst | **Story:** STORY-007

---

## Trigger
Developer runs `/feature-start "feature-name"`.

## Actors
- **Developer** — drives the workflow
- **@team-lead** — orchestrates and signs off
- **@tester** — runs tests
- **@reviewer** — performs code review
- **@qa-lead** — approves QA gate

## Narrative
A feature begins with daily sync and a feature-start command that creates a branch, task, and context. The developer explores the codebase, plans the approach, implements changes, writes tests, and requests review. After review feedback is addressed, QA verifies, documentation is updated, and the feature is finalized with a PR and merge through QA gate.

Each phase has an entry condition (previous phase done) and exit condition (quality gate passes). Context is checked between phases to prevent budget exhaustion.

## Flow Diagram

```mermaid
flowchart TD
    A["/daily-sync"] --> B["/feature-start 'name'"]
    B --> C["Phase 3: EXPLORE — @explorer investigates"]
    C --> D["Phase 4: PLAN — design approach"]
    D --> E{"/context-check passes?"}
    E -->|No| F["Compact context, archive state"]
    F --> D
    E -->|Yes| G["Phase 5: IMPLEMENT — write code"]
    G --> H["Phase 6: TEST — @tester runs tests"]
    H --> I{Tests pass?}
    I -->|No| J["Phase 8: FIX — @debugger fixes"]
    J --> H
    I -->|Yes| K["Phase 7: REVIEW — @reviewer checks"]
    K --> L{Review approved?}
    L -->|No| J
    L -->|Yes| M["Phase 9: VERIFY — @qa-lead runs QA gate"]
    M --> N{QA gate passes?}
    N -->|No| J
    N -->|Yes| O["Phase 10: DOCUMENT — update docs"]
    O --> P["/feature-done"]
    P --> Q["Phase 12: PR — create pull request"]
    Q --> R["Phase 13: MERGE — through QA gate"]
    R --> S["✅ Feature Complete"]
```

## Decision Points
1. **Context check passes?** — Budget < 60% working limit
2. **Tests pass?** — All unit + integration tests green
3. **Review approved?** — @reviewer signs off on code quality
4. **QA gate passes?** — { pass: bool, coverage_pct, failures[], gaps[] }

## Business Rules
- BR-001: No phase can start until the previous phase's quality gate passes
- BR-002: `/context-check` mandatory between phases
- BR-003: QA gate output includes coverage percentage and failure list
- BR-004: Fix phase loops back to test — cannot skip directly to review
- BR-005: Feature branch follows role-prefix naming convention
