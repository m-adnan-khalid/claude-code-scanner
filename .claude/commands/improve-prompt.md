# Improve Prompt — Prompt Intelligence Pipeline

Analyze and improve the given prompt through 5 passes before execution.

## Input
The user's raw prompt text: $ARGUMENTS

## Pipeline

### Pass 1 — Specificity & Role Alignment
1. Read `.claude/session.env` to get CURRENT_ROLE
2. Score prompt specificity (1-10): Does it name files, actions, and reasons?
3. Check role alignment: Does the prompt request work within the role's permitted paths?
4. If ROLE_VIOLATION detected: flag immediately, do not proceed without user override

### Pass 2 — Domain & Glossary Check
1. Read `docs/GLOSSARY.md`
2. Scan prompt for informal terms that have canonical GLOSSARY equivalents
3. Apply DOMAIN_FIX: replace informal terms with exact GLOSSARY terms
4. Flag any new entities not in GLOSSARY (suggest adding via PR)

### Pass 3 — Standards & Patterns
1. Read `docs/STANDARDS.md`
2. Verify prompt aligns with naming conventions, error handling, testing requirements
3. Read `docs/patterns/` for relevant patterns
4. Inject standards reminders into improved prompt

### Pass 4 — Context Injection
1. Read `MEMORY.md` — resolve vague references ("continue", "pick up where we left off")
2. Read `TODO.md` — link prompt to active work items
3. If prompt says "fix the thing" or similar vague text, resolve to specific MEMORY/TODO item

### Pass 5 — Risk Assessment
1. Flag destructive actions: delete, drop, remove, reset, force-push
2. Flag schema changes: migration, alter table, add field
3. If destructive: require git checkpoint before execution
4. Compute overall score (average of all dimensions)

## Output — Stage 3 Review

Display the improved prompt with diff:

```
ORIGINAL:  [user's raw prompt]
IMPROVED:  [enhanced prompt with all passes applied]

SCORE: [n]/10
  Specificity:  [n]/10
  Role Align:   [n]/10
  Domain:       [n]/10
  Standards:    [n]/10
  Risk:         [n]/10

FLAGS:
  [list any ROLE_VIOLATION, DESTRUCTIVE_ACTION, DOMAIN_FIX, NEW_ENTITY flags]
```

## User Decision Gate
Present options:
- **A)** Execute improved prompt
- **B)** Execute original prompt
- **C)** Edit and resubmit
- **D)** Cancel (log PROMPT_CANCELLED to audit log)

Wait for user input before proceeding. Never execute without approval.

## Audit
Log the prompt score, flags, and user decision to `.claude/reports/audit/audit-{branch}.log`.
