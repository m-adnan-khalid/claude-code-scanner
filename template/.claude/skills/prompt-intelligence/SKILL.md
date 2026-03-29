---
name: prompt-intelligence
description: Intercept, classify, score, and improve any rough prompt before execution. Runs 5 alignment passes (role, domain, context, rules, structure) and shows a diff for user approval.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, AskUserQuestion
argument-hint: '"your rough prompt here"'
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @output-validator]
---

# Prompt Intelligence: $ARGUMENTS

You are the PROMPT INTELLIGENCE LAYER. The user has submitted a rough prompt.
Your job: classify it, improve it, show the diff, get approval, then execute.

RAW_PROMPT="$ARGUMENTS"

## STAGE 1 — INTERCEPT & CLASSIFY

### Step 1: Capture & Classify
Classify the raw prompt into one of these types:

| Type | Name | Description |
|------|------|-------------|
| TYPE_1 | VAGUE | Missing context, ambiguous intent, incomplete |
| TYPE_2 | MISALIGNED | Intent clear but conflicts with role/domain/rules |
| TYPE_3 | WEAK | Intent clear but poorly structured for Claude to act on |
| TYPE_4 | RISKY | Could cause destructive, out-of-scope, or cross-role action |
| TYPE_5 | STRONG | Well-formed, aligned, actionable as-is |

### Step 2: Score on 5 Dimensions (1-10 each)

| Dimension | Question |
|-----------|----------|
| CLARITY | Is the intent unambiguous? |
| SCOPE | Is the scope bounded or open-ended? |
| ALIGNMENT | Does it match role permissions + domain rules? |
| CONTEXT | Does it reference the right files/entities/patterns? |
| SAFETY | Does it risk destructive or out-of-scope action? |

### Step 3: Fast-Path Check
If TYPE_5 AND all scores >= 8: skip to STAGE 4 (execute directly).
Otherwise: proceed to STAGE 2.

Output Stage 1 result:
```
-------------------------------------------
PROMPT RECEIVED
Type: [TYPE_1-5]
Scores: Clarity [n] | Scope [n] | Alignment [n] | Context [n] | Safety [n]
Overall: [avg]/10
Status: [NEEDS IMPROVEMENT | STRONG — EXECUTING]
-------------------------------------------
```

## STAGE 2 — IMPROVE & ALIGN (5 Passes)

Run all 5 improvement passes in order. Each pass reads a different source of truth.

### Pass 1: ROLE ALIGNMENT
Read `.claude/session.env` to get `CURRENT_ROLE`.
Read the role section in CLAUDE.md for that role.

Check against:
- Is the action within this role's permissions?
- Is the file scope within this role's allowed paths?
- Is the command/agent being invoked available to this role?

If violation found:
- Tag: `ROLE_VIOLATION: "[what]" not permitted for [ROLE]`
- Rewrite prompt to stay within role boundaries
- Or flag: "this requires [higher role] — route to them?"

If aligned: note `ROLE: aligned`

### Pass 2: DOMAIN ALIGNMENT
Read: `/docs/GLOSSARY.md`, `/docs/ARCHITECTURE.md`, relevant files in `/docs/patterns/`.

Check against:
- Does the prompt use correct domain terminology from GLOSSARY?
- Does it reference correct entity/service names?
- Does it align with architecture (no boundary violations)?
- Does it match relevant patterns in `/docs/patterns/`?

Corrections:
- Replace informal/wrong terms with GLOSSARY terms
- Replace vague entity references with exact names from ARCHITECTURE.md
- Add pattern reference if missing
- Tag each fix: `DOMAIN_FIX: "[old]" -> "[new]"`

If docs don't exist yet (new project), skip this pass with note: `DOMAIN: no docs yet — skipped`

### Pass 3: CONTEXT INJECTION
Read: `MEMORY.md` (if exists), `TODO.md` (if exists), run `git status`, check `git branch`.

Inject missing context:
- If prompt says "the last thing we did" -> resolve to exact item from MEMORY.md
- If prompt says "the current task" -> resolve to exact item from TODO.md or active task file
- If prompt could conflict with uncommitted changes -> add warning
- If prompt is a continuation -> add: "continuing from: [last completed]"
- If relevant files not mentioned -> add: "reading context from [files]"

Tag each: `CONTEXT_INJECT: [what] (from: [source])`

### Pass 4: CLAUDE.md RULES ALIGNMENT
Read CLAUDE.md — ALL ROLES section + current role section.

Check against every active rule:
- Pre-write duplication check rule -> add search step if creating new code
- Pattern match rule -> add pattern reference if missing
- Doc sync rule -> add doc update step if prompt changes src files
- Memory update rule -> add "update MEMORY.md after completion" if applicable
- Checkpoint rule -> add git checkpoint step if prompt is destructive

Tag each: `RULE_INJECT: [rule] -> [addition]`

### Pass 5: STRUCTURE & CLARITY
Rewrite the full prompt as a well-formed Claude Code instruction:

```markdown
## Task
[clear single-sentence statement of what to do]

## Context
[role | branch | relevant files | last completed | current task]

## Constraints
[role scope | patterns to follow | rules from CLAUDE.md]

## Steps
1. [numbered, specific, testable steps]
2. ...

## Definition of Done
[exactly what output/state means this is complete]

## After Completion
[update MEMORY.md | update docs if needed | log to AUDIT_LOG | advance TODO]
```

Re-score the improved prompt. All scores should now be >= 8.
If any score still < 8: iterate Pass 5 until all >= 8 (max 2 iterations).

## STAGE 3 — REVIEW WITH USER

**Never silently execute the improved prompt.** Always show the diff and get approval.

Output this exact format:

```
+============================================================+
|  PROMPT INTELLIGENCE — REVIEW BEFORE EXECUTION             |
+============================================================+

ORIGINAL PROMPT:
"[raw prompt exactly as user typed it]"

Original Scores:
Clarity [n] | Scope [n] | Alignment [n] | Context [n] | Safety [n]
Overall: [n]/10  Type: [TYPE]

--------------------------------------------------------------
IMPROVEMENTS MADE:
[list each change with its category tag]

ROLE_VIOLATION fixed: [description if any]
DOMAIN_FIX:    "[old]" -> "[new]"  (reason)
CONTEXT_INJECT: [what] (from: [source])
RULE_INJECT:   [rule] -> [addition]
STRUCTURE:     [what was restructured]

--------------------------------------------------------------
IMPROVED PROMPT:
+------------------------------------------------------------+
## Task
[improved task statement]

## Context
[injected context]

## Constraints
[aligned constraints]

## Steps
1. [step]
2. [step]
...

## Definition of Done
[specific completion criteria]

## After Completion
[MEMORY.md | docs | AUDIT_LOG | TODO updates]
+------------------------------------------------------------+

Improved Scores:
Clarity [n] | Scope [n] | Alignment [n] | Context [n] | Safety [n]
Overall: [n]/10

--------------------------------------------------------------
FLAGS (if any):
[ROLE_VIOLATION: requires re-routing to different role]
[RISKY_ACTION: destructive step detected — checkpoint recommended]
[OUT_OF_SCOPE: [file] is outside your role's allowed paths]
[AMBIGUITY: [what was unclear] — assumed [what] — correct?]

--------------------------------------------------------------
DECISION:
  [A] Execute improved prompt
  [B] Edit improved prompt before executing
  [C] Go back to original prompt
  [D] Cancel

Reply with A, B, C, or D.
+============================================================+
```

Wait for user response using AskUserQuestion. Do not proceed until response received.

- If **A**: proceed to STAGE 4 with improved prompt
- If **B**: ask user for edits, apply them, re-score, show updated review, ask again
- If **C**: confirm "execute original as-is?", proceed only on confirmation
- If **D**: log cancellation, stop

## STAGE 4 — EXECUTE

User approved. Now execute the approved prompt.

### Pre-Execution
1. If prompt contains destructive action (delete, reset, drop, overwrite):
   ```bash
   git add -A && git commit -m "pre-prompt-intelligence checkpoint — [task summary]"
   ```
2. Log start:
   ```
   [timestamp] | [ROLE] | [branch] | PROMPT_EXECUTE | [task summary] | STARTED
   ```

### During Execution
- Follow the Steps exactly as written in the improved prompt
- After each step: verify result before moving to next
- If a step fails: note failure, retry once, then pause and report

### Post-Execution
1. Update MEMORY.md (if exists):
   - Last Completed: [task summary + timestamp]
   - Next Step: [next logical action]
2. If src files changed: check if docs need update
3. Advance TODO.md if applicable
4. Output completion summary:

```
+============================================================+
|  EXECUTION COMPLETE                                        |
+============================================================+
Task:    [what was done]
Files:   [files changed]
Tests:   [pass/fail/skipped]
Docs:    [updated/skipped/flagged]
Memory:  [updated/skipped]
TODO:    [item completed -> next item]
Status:  DONE | PARTIAL [reason] | BLOCKED [reason]
+============================================================+
```
