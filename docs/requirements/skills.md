# Requirements: Skill System

**Source:** BRD FR-004, CLAUDE.md, README.md
**Owner:** @analyst | **Story:** STORY-006

---

## Functional Requirements

### FR-SKL-001: Skill Registration
Every skill SHALL have a SKILL.md file with YAML frontmatter: name, description, invocation (automatic/manual).

**AC:**
GIVEN a skill directory exists in `.claude/skills/`
WHEN checked
THEN it contains a SKILL.md with valid frontmatter

### FR-SKL-002: Context Forking
Skills with heavy workloads SHALL use `context: fork` to avoid exhausting the parent context.

**AC:**
GIVEN a skill has `context: fork` in its frontmatter
WHEN invoked
THEN it runs in a separate context that doesn't consume the parent's budget

### FR-SKL-003: Lifecycle Protocol
Every skill SHALL follow its lifecycle tier protocol (_protocol.md): T1 (multi-step), T2 (audit), T3 (planning), T4 (testing), T5 (utility).

**AC:**
GIVEN a skill is classified as T2 (audit)
WHEN invoked
THEN it follows the audit protocol: scope → scan → analyze → report → recommend

### FR-SKL-004: Skill Invocation
Automatic skills SHALL trigger without user command; manual skills SHALL require explicit `/command` invocation.

**AC:**
GIVEN a skill has `invocation: automatic`
WHEN its trigger condition is met
THEN it executes without user explicitly calling it

---

## Non-Functional Requirements

### NFR-SKL-001: Skill Count Consistency
The documented skill count SHALL match the actual number of SKILL.md files in the template.

### NFR-SKL-002: Skill Independence
Skills SHALL not depend on other skills — each is self-contained with its own instructions.
