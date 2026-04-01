# Requirements: Workflow System

**Source:** BRD FR-008, FR-010, CLAUDE.md, README.md
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-WFL-001: 13-Phase Feature Lifecycle
The system SHALL enforce a 13-phase feature workflow: daily-sync → feature-start → explore → plan → implement → test → review → fix → verify → document → feature-done → PR → merge.

**AC:**
GIVEN a developer starts a feature
WHEN they follow the workflow
THEN each phase has a defined entry condition, exit condition, and quality gate

### FR-WFL-002: QA Gates Between Phases
The system SHALL enforce QA gates between phases — a phase cannot complete without its gate passing.

**AC:**
GIVEN the implement phase is complete
WHEN the developer attempts to move to review
THEN the QA gate checks: tests pass, coverage adequate, no lint errors

### FR-WFL-003: New Project 8-Phase Pipeline
The system SHALL support new-project mode with 8 phases: brainstorm → spec → features → domain → tech → architecture → scaffold → deploy.

**AC:**
GIVEN a user runs `/new-project "idea"`
WHEN all 8 phases complete
THEN each phase has produced a populated document AND a scaffolded project exists

### FR-WFL-004: Context Check Between Phases
The system SHALL require `/context-check` between workflow phases to verify context budget.

**AC:**
GIVEN a phase completes
WHEN the next phase is about to start
THEN context usage is checked against limits (startup <20%, working <60%)
AND warning issued at 45%, 60%, 75% thresholds

### FR-WFL-005: Loop Flows with Circuit Breaker
The system SHALL support loop flows (recurring tasks) with circuit breaker to prevent infinite loops.

**AC:**
GIVEN a loop flow is configured with max iterations
WHEN the iteration count exceeds the limit
THEN the circuit breaker stops the loop and reports final status

---

## Non-Functional Requirements

### NFR-WFL-001: Workflow Resumability
If a workflow is interrupted, it SHALL be resumable from the last completed phase.

### NFR-WFL-002: Phase Timing
Each workflow phase SHALL log start/end timestamps for execution reporting.
