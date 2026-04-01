# Design Brief: Dashboard Concept [SPECULATIVE]

**Source:** README.md, CLAUDE.md
**Owner:** @analyst | **Story:** STORY-008
**Linked Requirements:** FR-011, FR-013
**Note:** Claude Code Scanner is primarily a CLI tool. This brief is SPECULATIVE for potential future web UI.

---

## 1. Overview
Concept design for a web-based dashboard that visualizes workspace health, task progress, agent activity, and quality metrics. This would complement the CLI for team-wide visibility.

## 2. User Context
**Persona:** CTO or Tech Lead monitoring team-wide Claude Code usage
**Entry Point:** `localhost:3000` or hosted URL after `/dashboard` setup
**Goal:** At-a-glance workspace health without running CLI commands

## 3. Layout
```
┌──────────────────────────────────────────────┐
│  [Logo] Claude Code Scanner Dashboard   [⚙️] │
├──────────┬───────────────────────────────────┤
│ Sidebar  │  Main Content Area                │
│          │                                   │
│ Overview │  ┌─────────┐ ┌─────────┐         │
│ Tasks    │  │ Health   │ │ Tasks   │         │
│ Agents   │  │ Score    │ │ Status  │         │
│ Quality  │  │  97%     │ │ 14/22   │         │
│ Drift    │  └─────────┘ └─────────┘         │
│ Audit    │                                   │
│          │  ┌───────────────────────┐        │
│          │  │ Recent Agent Activity │        │
│          │  │ @analyst — BRD done   │        │
│          │  │ @tester — 18/18 pass  │        │
│          │  └───────────────────────┘        │
└──────────┴───────────────────────────────────┘
```

## 4. Components [SPECULATIVE]
- **Health Score Card:** Overall workspace verification score
- **Task Kanban:** Visual task board (TODO → IN_PROGRESS → DONE)
- **Agent Activity Feed:** Recent agent completions with metrics
- **Drift Indicator:** Green/yellow/red sync status
- **Quality Trend:** Line chart of execution report scores over time
- **Audit Log Viewer:** Searchable/filterable audit log table

## 5. Interactions [SPECULATIVE]
- Click task → view task detail + subtasks
- Click agent → view recent execution reports
- Click drift indicator → run `/sync --check`
- Filter by date range, agent, or status

## 6. States
- **Healthy:** All green — verification passing, no drift, tasks on track
- **Warning:** Yellow — drift detected, tasks blocked, quality dipping
- **Critical:** Red — verification failing, multiple blockers

## 7. Design Tokens [SPECULATIVE]
- Color system: Green/Yellow/Red for health + Blue for info + Gray for neutral
- Typography: System font stack (no custom fonts for MVP)
- Spacing: 8px grid system
- Cards: Rounded corners, subtle shadow

## 8. Accessibility [SPECULATIVE]
- WCAG 2.1 AA compliance target
- All charts have tabular data alternative
- Color not sole indicator (icons + text labels)

## 9. Constraints
- CLI is primary interface — dashboard is supplementary
- Must work without external services (localhost only for MVP)
- Data sourced from existing files (TASK_REGISTRY, AUDIT_LOG, MEMORY.md)

## 10. Open Questions
- [?] Is a web dashboard needed at all, or are CLI reports sufficient? Needs user validation
- [?] Should this be a separate npm package or built into the scanner?
- [?] What authentication/auth model for multi-user access?
- [?] Real-time updates via WebSocket or polling?
