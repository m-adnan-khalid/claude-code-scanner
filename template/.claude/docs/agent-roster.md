# Agent Roster — Complete Reference (30 Agents)

> Centralized registry of all agents, their lifecycle phases, access levels, and tools.

---

## Lifecycle Coverage Matrix

| Agent | Ideation | Planning | Design | Dev | Testing | Review | Deploy | Monitor | Maintain |
|-------|----------|----------|--------|-----|---------|--------|--------|---------|----------|
| @ideator | **YES** | | | | | | | | |
| @strategist | **YES** | **YES** | | | | | | | |
| @analyst | **YES** | **YES** | | | | | | | |
| @product-owner | **YES** | **YES** | | | **YES** | | | | |
| @ux-designer | | **YES** | **YES** | | | | | | |
| @architect | | **YES** | **YES** | | | | | | |
| @code-quality | | **YES** | **YES** | | **YES** | | | | |
| @process-coach | **YES** | **YES** | | | | | | | |
| @scaffolder | | | | **YES** | | | | | |
| @api-builder | | | | **YES** | **YES** | | | | |
| @frontend | | | | **YES** | **YES** | | | | |
| @mobile | | | | **YES** | **YES** | | | | |
| @database | | | | **YES** | **YES** | | | | |
| @tester | | | | | **YES** | | | | |
| @qa-automation | | | | | **YES** | | | | |
| @qa-lead | | | | | **YES** | **YES** | | | |
| @debugger | | | | | **YES** | | | | |
| @explorer | | **YES** | **YES** | | | | | | |
| @reviewer | | | | | | **YES** | | | |
| @security | | **YES** | **YES** | | | **YES** | | | |
| @gatekeeper | | | | **YES** | **YES** | **YES** | **YES** | | |
| @version-manager | | | | **YES** | | **YES** | **YES** | | |
| @infra | | | | **YES** | | | **YES** | **YES** | |
| @docs-writer | | | **YES** | | | **YES** | **YES** | | |
| @team-lead | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | |
| @cto | | **YES** | **YES** | | **YES** | | | | **YES** |
| @output-validator | | | | **YES** | **YES** | **YES** | | | |
| @observability-engineer | | | | | | | | **YES** | **YES** |
| @incident-responder | | | | | | | | **YES** | **YES** |
| @performance-engineer | | | | | **YES** | | | **YES** | **YES** |

---

## Agent Details

### SDLC Roles (4)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@team-lead` | opus | default | worktree | 40 | Full orchestration access |
| `@architect` | opus | plan | none | 25 | Read-only — /docs/ARCHITECTURE.md, /docs/adr/ |
| `@product-owner` | sonnet | plan | none | 20 | Read-only — docs/, acceptance criteria |
| `@qa-lead` | sonnet | plan | none | 20 | Read-only — tests/, QA plans |

### Core (6)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@explorer` | sonnet | plan | none | 20 | Read-only — full codebase |
| `@reviewer` | sonnet | plan | none | 15 | Read-only — src/, tests/ |
| `@security` | sonnet | plan | none | 20 | Read-only — full codebase + dependencies |
| `@debugger` | sonnet | default | worktree | 25 | Read/Write — src/, tests/ |
| `@tester` | sonnet | default | worktree | 25 | Read/Write — tests/, src/ (read) |
| `@code-quality` | opus | plan | none | 20 | Read-only — full codebase |

### Dev (4)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@api-builder` | sonnet | default | worktree | 30 | Read/Write — src/api/, src/services/, src/db/, tests/ |
| `@frontend` | sonnet | default | worktree | 30 | Read/Write — src/ui/, src/components/, src/styles/ |
| `@mobile` | opus | default | worktree | 30 | Read/Write — mobile/, src/mobile/ |
| `@infra` | sonnet | default | worktree | 30 | Read/Write — infra/, .github/, scripts/, Dockerfile |

### Pre-Dev (4)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@ideator` | sonnet | plan | none | 15 | Read-only — docs/ |
| `@strategist` | sonnet | default | none | 20 | Read/Write — docs/, .claude/project/ |
| `@scaffolder` | sonnet | default | worktree | 25 | Read/Write — project root (generation) |
| `@ux-designer` | sonnet | plan | none | 15 | Read-only — src/ui/, docs/design/ |

### Governance (5)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@cto` | opus | plan | none | 15 | Read-only — full audit |
| `@gatekeeper` | sonnet | plan | none | 10 | Read-only — validation only |
| `@output-validator` | sonnet | plan | none | 10 | Read-only — agent output validation |
| `@process-coach` | sonnet | default | none | 20 | Read/Write — docs/ methodology |
| `@docs-writer` | sonnet | default | none | 25 | Read/Write — docs/, READMEs, ADRs |

### Specialist (4)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@database` | sonnet | default | worktree | 25 | Read/Write — migrations/, src/db/, src/models/ |
| `@qa-automation` | opus | default | worktree | 30 | Read/Write — tests/e2e/, tests/visual/ |
| `@analyst` | sonnet | default | none | 20 | Read/Write — docs/requirements/ |
| `@version-manager` | sonnet | default | none | 15 | Read/Write — git operations |

### Phase 12 — Monitoring & Maintenance (3)

| Agent | Model | Mode | Isolation | Max Turns | File Scope |
|-------|-------|------|-----------|-----------|------------|
| `@observability-engineer` | sonnet | default | worktree | 25 | Read/Write — infra/, monitoring/, dashboards/ |
| `@incident-responder` | sonnet | default | worktree | 30 | Read/Write — docs/incidents/, docs/runbooks/ |
| `@performance-engineer` | sonnet | default | worktree | 25 | Read/Write — src/ (optimization), benchmarks/ |

---

## Agent Interaction Map

```
PRE-DEV:
  @ideator → @strategist → @analyst → @architect → @scaffolder
  @product-owner (parallel) ↗

DEVELOPMENT:
  @api-builder, @frontend, @mobile (parallel)
    → @tester → @code-quality → @reviewer + @security (dual gate)
    → @gatekeeper (CI gate) → @version-manager (git gate)

DEPLOYMENT:
  @infra → @observability-engineer → @incident-responder (if needed)

OPTIMIZATION:
  @performance-engineer (any phase, on demand)

ORCHESTRATION:
  @team-lead (coordinates all)
  @cto (audits @team-lead)
  @output-validator (validates agent outputs)
  @process-coach (methodology guidance)
  @docs-writer (documentation at each phase)
```

---

## Role-to-Agent Mapping (RBAC)

| Role | Agents Available |
|------|-----------------|
| CTO / VP Engineering | @team-lead, @architect, @gatekeeper, @process-coach, @cto |
| Architect | @architect, @code-quality, @security, @explorer |
| Tech Lead | @team-lead, @architect, @code-quality, @security, @explorer |
| Backend Dev | @api-builder, @debugger, @tester, @database, @performance-engineer |
| Frontend Dev | @frontend, @debugger, @tester, @ux-designer |
| Full Stack Dev | @api-builder, @frontend, @debugger, @tester, @database, @performance-engineer |
| QA / SDET | @qa-lead, @tester, @qa-automation, @gatekeeper |
| DevOps / Platform | @infra, @security, @gatekeeper, @observability-engineer, @incident-responder |
| Product Owner / PM | @product-owner, @strategist, @ideator |
| Designer / UX | @ux-designer, @frontend (read-only), @code-quality |
