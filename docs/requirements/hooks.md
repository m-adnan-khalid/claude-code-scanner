# Requirements: Hook System

**Source:** BRD FR-005, docs/ARCHITECTURE.md, docs/DOMAIN-TEST-GUIDE.md
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-HOOK-001: Event-Driven Execution
Hooks SHALL fire on their registered event (PreToolUse, PostToolUse, SessionStart, Stop, PreCompact).

**AC:**
GIVEN a hook is registered for PreToolUse event
WHEN a tool call occurs
THEN the hook script executes before the tool call proceeds

### FR-HOOK-002: Exit Code Semantics
Hooks SHALL use standardized exit codes: 0=pass, 1=block (dangerous action), 2=block (scope violation).

**AC:**
GIVEN a hook detects a scope violation
WHEN it exits with code 2
THEN the tool call is blocked with a scope violation message

### FR-HOOK-003: Isolated Execution
Each hook SHALL run in an isolated subprocess with no shared state between hooks.

**AC:**
GIVEN two hooks fire on the same event
WHEN they execute
THEN neither can read or modify the other's variables or state

### FR-HOOK-004: Scope Guard
The scope-guard hook SHALL block file writes outside the current role's allowed paths.

**AC:**
GIVEN CURRENT_ROLE=QA in session.env
WHEN a write to `src/api/router.js` is attempted
THEN scope-guard blocks with exit code 2

### FR-HOOK-005: Version Check
The version-check hook SHALL verify CLAUDE.md version matches the framework version on session start.

**AC:**
GIVEN CLAUDE.md has `FRAMEWORK VERSION: 1.0.0`
WHEN session starts and framework is at 1.0.1
THEN version-check outputs a warning with upgrade instructions

### FR-HOOK-006: Audit Logging
The post-tool-use hook SHALL log every tool call to AUDIT_LOG.md with timestamp, agent, action, and file path.

**AC:**
GIVEN an agent writes to `src/api/users.js`
WHEN the write completes
THEN AUDIT_LOG.md contains a new row: `| [timestamp] | @api-builder | WRITE | src/api/users.js |`

---

## Non-Functional Requirements

### NFR-HOOK-001: Hook Performance
Each hook SHALL complete execution in under 2 seconds to avoid blocking the user.

### NFR-HOOK-002: Failure Isolation
A failing hook SHALL not crash the session — it logs the error and allows the user to decide.
