# Requirements: Agent System

**Source:** BRD FR-003, CLAUDE.md, docs/DOMAIN-TEST-GUIDE.md
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-AGT-001: Agent Frontmatter
Every agent SHALL have YAML frontmatter with: name, description, model, tools, and access restrictions.

**AC:**
GIVEN an agent file exists in `.claude/agents/`
WHEN parsed
THEN it contains valid YAML frontmatter with all required fields

### FR-AGT-002: Tool Restrictions
Read-only agents (architect, reviewer, security, explorer) SHALL NOT have Write, Edit, or Bash tools.

**AC:**
GIVEN the @architect agent definition
WHEN its tools field is checked
THEN Write, Edit, and Bash are absent

### FR-AGT-003: Handoff Protocol
Every agent SHALL end its output with a HANDOFF block specifying: from, to, reason, artifacts, next_agent_needs, execution_metrics.

**AC:**
GIVEN an agent completes its work
WHEN it produces output
THEN the last section is a HANDOFF block with all required fields

### FR-AGT-004: Context Recovery
Every agent SHALL be able to resume from a previous state by reading its task file and MEMORY.md.

**AC:**
GIVEN an agent loses context (compaction, timeout)
WHEN re-invoked
THEN it reads the active task file, finds the last completed step, and resumes without restarting

### FR-AGT-005: GLOSSARY Compliance
Every agent SHALL read docs/GLOSSARY.md before naming entities and use exact canonical terms.

**AC:**
GIVEN an agent creates a new entity reference
WHEN checked against GLOSSARY.md
THEN the term matches exactly (no synonyms)

---

## Non-Functional Requirements

### NFR-AGT-001: Agent Model Optimization
Agents with complex tasks SHALL use opus model; utility agents SHALL use sonnet for cost efficiency.

### NFR-AGT-002: Turn Limits
Agents SHALL have maxTurns configured to prevent runaway execution (default: 25).
