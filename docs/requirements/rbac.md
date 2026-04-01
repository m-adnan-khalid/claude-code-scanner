# Requirements: RBAC System

**Source:** BRD FR-009, ADR-0001
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-RBAC-001: Role Storage
The system SHALL store the user's current role in `.claude/session.env` as `CURRENT_ROLE=<role>`.

**AC:**
GIVEN a user runs `/setup-workspace`
WHEN they select their role
THEN `CURRENT_ROLE` is written to `.claude/session.env` with one of the 10 valid role values

### FR-RBAC-002: Path-Scoped Enforcement
The system SHALL enforce file path restrictions per role via the PreToolUse scope-guard hook.

**AC:**
GIVEN a Backend Dev role is active
WHEN the user attempts to write to `src/ui/Component.tsx`
THEN the scope-guard hook blocks the write with exit code 2 and message "Scope violation"

### FR-RBAC-003: Agent Access Control
Each agent SHALL declare which roles may invoke it and reject invocations from unauthorized roles.

**AC:**
GIVEN an agent has `Callable by: PM, CTO, TechLead` in its access control
WHEN a Frontend Dev attempts to invoke it
THEN the agent exits with "Agent @[name] is restricted to PM/CTO/TechLead roles"

### FR-RBAC-004: Branch Naming
Each role SHALL use a branch naming convention: `<role-prefix>/feature-name`.

**AC:**
GIVEN a Backend Dev creates a branch
WHEN the branch is named `backend/add-user-endpoint`
THEN branch-naming-check hook passes

### FR-RBAC-005: Pre-Write Rule
ALL roles SHALL search for existing implementations, check patterns, and check GLOSSARY before creating new code.

**AC:**
GIVEN any agent is about to create a new file
WHEN the pre-write rule triggers
THEN the agent verifies no duplicate exists AND checks docs/patterns/ AND checks docs/GLOSSARY.md

---

## Non-Functional Requirements

### NFR-RBAC-001: Role Switching
Role switching SHALL require re-running `/setup-workspace` — no runtime role changes.

### NFR-RBAC-002: Audit Trail
Every role-scoped action SHALL be logged to AUDIT_LOG with role, timestamp, and action.
