# Requirements: Pipeline System

**Source:** BRD FR-001, FR-002, FR-007, FR-008
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-PIPE-001: Codebase Scanning
The system SHALL scan a target directory recursively and identify all technology markers (languages, frameworks, databases, tools).

**AC:**
GIVEN a directory containing source code
WHEN the scanner runs
THEN a TECH_MANIFEST JSON is produced containing language, framework, database, and tooling entries

### FR-PIPE-002: Environment Generation
The system SHALL consume TECH_MANIFEST and generate all Claude Code artifacts with project-specific values replacing all placeholders.

**AC:**
GIVEN a valid TECH_MANIFEST JSON
WHEN the generator runs
THEN CLAUDE.md, agents/, skills/, hooks/, rules/ are produced with zero remaining `{placeholder}` tokens

### FR-PIPE-003: Artifact Validation
The system SHALL validate generated artifacts for line count limits, JSON validity, hook permissions, and context budget compliance.

**AC:**
GIVEN generated artifacts exist
WHEN the validator runs
THEN each artifact is checked against its constraint (CLAUDE.md < 200 lines, rules < 50 lines, JSON parseable, hooks executable)

### FR-PIPE-004: Smithery Integration
The system SHALL query the Smithery MCP registry for servers matching the detected tech stack and install up to 5 scoped servers.

**AC:**
GIVEN TECH_MANIFEST identifies a tech stack
WHEN Smithery integration runs
THEN matching MCP servers are identified, installed, and scoped to relevant agents via mcpServers field

---

## Non-Functional Requirements

### NFR-PIPE-001: Pipeline Performance
The complete scan-to-validate pipeline SHALL complete in under 5 minutes for a project with < 10,000 files.

### NFR-PIPE-002: Idempotency
Running the pipeline twice on the same project SHALL produce identical output (deterministic generation).

### NFR-PIPE-003: Error Recovery
If any pipeline phase fails, the system SHALL log the failure, report the phase that failed, and allow retry from that phase.
