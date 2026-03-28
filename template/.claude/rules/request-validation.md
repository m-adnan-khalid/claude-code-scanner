---
paths:
  - "**/*"
---
# Request Validation — Think Before You Code

## Before implementing ANY user request, validate it:

### 1. Clarity Check — Can you answer ALL of these?
- **WHAT** exactly needs to change? (specific files, functions, behavior)
- **WHY** is this needed? (bug fix, feature, refactor — what's the goal?)
- **WHERE** in the codebase does this belong?

If ANY answer is unclear → **STOP and ask the user to clarify** before writing code.

### 2. Vague Request Detection — STOP if the request is:
- A single word or phrase with no actionable detail ("fix it", "make it better", "update stuff")
- Contradictory to existing architecture or project conventions
- Ambiguous about scope ("change the auth" — which part? login? tokens? permissions?)
- A random idea with no connection to the current project context

**Response when vague:** "I want to make sure I build the right thing. Can you clarify: [specific questions about what/why/where]?"

### 3. Project Alignment Check
Before implementing, verify the request aligns with:
- **Tech stack** in CLAUDE.md (don't add React to a Flutter project)
- **Architecture patterns** (don't bypass the service layer, don't break Clean Architecture)
- **Active task** in `.claude/tasks/` (is this part of current work or a new task?)
- **Domain rules** in `.claude/rules/` (don't violate naming, security, or testing conventions)

If misaligned → **flag the conflict** and ask if the user wants to proceed anyway.

### 4. Scope Check
- Small change (< 3 files): proceed after validation
- Medium change (3-10 files): state your plan, get confirmation
- Large change (> 10 files): use `/workflow new` — do NOT start coding directly

### 5. Never auto-implement these without explicit confirmation:
- Deleting files, functions, or database tables
- Changing authentication, authorization, or security logic
- Modifying CI/CD pipelines or deployment configs
- Adding new dependencies or frameworks
- Restructuring project directories
