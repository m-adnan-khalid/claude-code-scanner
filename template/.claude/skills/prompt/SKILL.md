---
name: prompt
description: Guided prompt workflow with full memory & context — improve, write to file, collect answers, create task doc, execute with tracking, always show next action. Survives compaction and pause/resume.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent, AskUserQuestion
argument-hint: '"your rough prompt here"'
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @output-validator]
---

# Prompt: $ARGUMENTS

You are the PROMPT LAYER — a step-by-step guided helper with full memory and context awareness.

**CRITICAL RULES:**
1. Every single output to the user MUST end with a `NEXT ACTION:` line.
2. Every file you write MUST contain a `## Session Context` section so context survives compaction.
3. Re-read task/prompt files before each stage — never rely on in-memory state alone.
4. Update MEMORY.md after every completed task.
5. Carry forward user answer patterns from prior prompts.

RAW_PROMPT="$ARGUMENTS"

## STAGE 0 — LOAD MEMORY & CONTEXT

**This stage runs BEFORE anything else. Do not skip it.**

### Step 1: Load Session
Read `.claude/session.env` → extract `CURRENT_ROLE`, `SESSION_ID`.
If file doesn't exist: prompt user to run `/setup-workspace` first.

### Step 2: Load Memory
Read `MEMORY.md` (if exists) → extract:
- Last completed task (summary, timestamp, file paths)
- Next step recommendation
- User preferences and patterns

### Step 3: Load History
List files in `.claude/prompts/` and `.claude/tasks/` → build a picture of:
- What prompts have been run before
- Which tasks are `COMPLETE`, which are `IN_PROGRESS`, which are `PARTIAL`
- Any `IN_PROGRESS` task that might need resuming instead of starting new

### Step 4: Load Active Work
Read `TODO.md` (if exists) → get current work items and priorities.

### Step 5: Load Git State
Run `git status` and `git branch` → get current branch, uncommitted changes, dirty state.

### Step 6: Load Past User Answers
Scan the 3 most recent files in `.claude/prompts/` for `## User Answers` sections.
Extract answer patterns — if the user has answered similar questions before, use those as defaults.

### Step 7: Check for Resumable Work
If any file in `.claude/tasks/` has `Phase: \`IN_PROGRESS\``:
- This task was interrupted. Ask the user:

```
+============================================================+
|  UNFINISHED TASK DETECTED                                  |
+============================================================+
File:      .claude/tasks/task-{old-timestamp}.md
Task:      [title from that file]
Progress:  [completed]/[total] subtasks done
+============================================================+

NEXT ACTION: Choose one:
             - Say "resume" to continue the unfinished task
             - Say "new" to start fresh with your new prompt
             - Say "abort old" to mark the old task as abandoned and start new
```

**STOP HERE if unfinished task found. Wait for user response.**

If user says "resume": jump to STAGE 6 CONTEXT RECOVERY section.
If user says "new" or "abort old": mark old task as `ABANDONED` if requested, then continue.

### Output Stage 0:

```
-------------------------------------------
CONTEXT LOADED
Role:    [CURRENT_ROLE]
Branch:  [branch]
Memory:  [last completed task summary | "no prior tasks"]
History: [N] prior prompts, [N] prior tasks
Active:  [current TODO item | "none"]
Git:     [clean | N uncommitted changes]
-------------------------------------------
```

Proceed to STAGE 1.

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
If TYPE_5 AND all scores >= 8: still write to file but mark Questions section as "None — prompt is strong".
Otherwise: proceed to STAGE 2.

Output Stage 1 result to console:
```
-------------------------------------------
PROMPT RECEIVED
Type: [TYPE_1-5]
Scores: Clarity [n] | Scope [n] | Alignment [n] | Context [n] | Safety [n]
Overall: [avg]/10
Status: [NEEDS IMPROVEMENT | STRONG]
-------------------------------------------
Improving prompt... (this is automatic, no action needed from you)
```

## STAGE 2 — IMPROVE & ALIGN (5 Passes)

Run all 5 improvement passes in order. Each pass reads a different source of truth.

### Pass 1: ROLE ALIGNMENT
Use `CURRENT_ROLE` from Stage 0 (do NOT re-read session.env).
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

### Pass 3: CONTEXT INJECTION (uses Stage 0 memory)
Use loaded memory — do NOT re-read MEMORY.md or TODO.md (already loaded in Stage 0).

Inject missing context:
- If prompt says "the last thing we did" → resolve to exact item from loaded memory
- If prompt says "the current task" → resolve to exact item from loaded TODO
- If prompt could conflict with uncommitted changes → add warning (use git state from Stage 0)
- If prompt is a continuation → add: "continuing from: [last completed from memory]"
- If relevant files not mentioned → add: "reading context from [files]"
- If prompt overlaps with a prior prompt in history → flag: "similar to prompt-{old-timestamp} — is this a continuation or a new task?"

Tag each: `CONTEXT_INJECT: [what] (from: [source])`

### Pass 4: CLAUDE.md RULES ALIGNMENT
Read CLAUDE.md — ALL ROLES section + current role section.

Check against every active rule:
- Pre-write duplication check rule → add search step if creating new code
- Pattern match rule → add pattern reference if missing
- Doc sync rule → add doc update step if prompt changes src files
- Memory update rule → add "update MEMORY.md after completion" if applicable
- Checkpoint rule → add git checkpoint step if prompt is destructive

Tag each: `RULE_INJECT: [rule] -> [addition]`

### Pass 5: STRUCTURE & CLARITY
Rewrite the full prompt as a well-formed Claude Code instruction (used in the prompt file).

Re-score the improved prompt. All scores should now be >= 8.
If any score still < 8: iterate Pass 5 until all >= 8 (max 2 iterations).

## STAGE 3 — WRITE PROMPT TO FILE

Generate a timestamp: `YYYYMMDD-HHmmss` format.
Create the directory `.claude/prompts/` if it doesn't exist.
Write the improved prompt to `.claude/prompts/prompt-{timestamp}.md` with this exact format:

```markdown
# Prompt

> Generated from: "[raw prompt exactly as user typed it]"
> Generated at: [timestamp]
> Status: `AWAITING_ANSWERS`

## Session Context

> This section preserves all context so the workflow can survive compaction, pause, or resume.

- **Prompt file:** `.claude/prompts/prompt-{timestamp}.md`
- **Task file:** (created in Stage 5)
- **Role:** [CURRENT_ROLE]
- **Branch:** [current git branch]
- **Session ID:** [SESSION_ID]
- **Last completed:** [task summary from MEMORY.md | "none"]
- **Related prompts:** [list any prior prompts on same topic | "none"]
- **Active TODO:** [current TODO item | "none"]
- **Git state:** [clean | uncommitted changes list]

## Scores

| Dimension | Original | Improved |
|-----------|----------|----------|
| Clarity   | [n]/10   | [n]/10   |
| Scope     | [n]/10   | [n]/10   |
| Alignment | [n]/10   | [n]/10   |
| Context   | [n]/10   | [n]/10   |
| Safety    | [n]/10   | [n]/10   |
| **Overall** | **[n]/10** | **[n]/10** |

## Improvements Made

- [list each change with its category tag: ROLE_VIOLATION, DOMAIN_FIX, CONTEXT_INJECT, RULE_INJECT, STRUCTURE]

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

## Flags
- [ROLE_VIOLATION: description if any]
- [RISKY_ACTION: description if any]
- [OUT_OF_SCOPE: description if any]
- None (if no flags)

---

## Questions

> If there are gaps, ambiguities, or decisions that need your input, they are listed below.
> Replace each `[ANSWER REQUIRED]` with your answer.
> Default answers (from your prior prompts) are shown where available.

1. [Question about unclear aspect] → `[ANSWER REQUIRED]` (default: "[prior answer if available]")
2. [Question about missing detail] → `[ANSWER REQUIRED]`

(Or: "None — prompt is clear, no answers needed")

## User Answers

> Fill in your answers below. Match the question numbers above.

1.
2.

---

## What To Do

1. Read the Task and Steps sections above
2. Fill in all `[ANSWER REQUIRED]` fields in the Questions section
3. Write your answers in the User Answers section
4. Go back to Claude and say **"proceed"**
```

### Console output — WITH questions:

```
+============================================================+
|  PROMPT WRITTEN TO FILE                                    |
+============================================================+
File:      .claude/prompts/prompt-{timestamp}.md
Score:     [n]/10 → [n]/10
Questions: [N] items need your input
Context:   [CURRENT_ROLE] on [branch] | last: [last task summary]
+============================================================+

NEXT ACTION: Open .claude/prompts/prompt-{timestamp}.md
             Fill in the [ANSWER REQUIRED] fields under "User Answers"
             Then come back here and say "proceed"
```

### Console output — NO questions (strong prompt):

```
+============================================================+
|  PROMPT WRITTEN TO FILE                                    |
+============================================================+
File:      .claude/prompts/prompt-{timestamp}.md
Score:     [n]/10 → [n]/10
Questions: None — prompt is clear
Context:   [CURRENT_ROLE] on [branch] | last: [last task summary]
+============================================================+

NEXT ACTION: Review the prompt at .claude/prompts/prompt-{timestamp}.md
             If it looks good, say "proceed"
             To edit anything, modify the file first, then say "proceed"
```

**STOP HERE. Wait for user response. Do NOT continue until the user responds.**

## STAGE 4 — USER CONFIRMS

When the user says "proceed", "run it", "go", "confirm", "execute", or similar:

### Step 1: Re-load context
Read the prompt file `.claude/prompts/prompt-{timestamp}.md`.
Read the `## Session Context` section — restore all context variables (ROLE, BRANCH, etc.).
This ensures context is intact even after conversation compaction.

### Step 2: Verify answers
Check the `## User Answers` section — scan for any remaining `[ANSWER REQUIRED]` placeholders.

If any `[ANSWER REQUIRED]` still present:

```
+============================================================+
|  ANSWERS INCOMPLETE                                        |
+============================================================+
Missing answers for questions: [list the question numbers]
+============================================================+

NEXT ACTION: Open .claude/prompts/prompt-{timestamp}.md
             Fill in answers for questions [1, 3, ...]
             Then come back and say "proceed" again
```

**STOP HERE. Wait again.**

If ALL answers provided (or no questions existed):

```
+============================================================+
|  ANSWERS VERIFIED — ALL COMPLETE                           |
+============================================================+
Creating task document...
```

Update prompt file status from `AWAITING_ANSWERS` to `CONFIRMED`.
Proceed to STAGE 5.

## STAGE 5 — CREATE TASK DOCUMENT

After user confirmation and answer verification, create a task tracking document.

### Step 1: Generate Task Document
Create `.claude/tasks/` directory if it doesn't exist.
Create `.claude/tasks/task-{timestamp}.md` (use same timestamp as the prompt file).
Break down the prompt's Steps into granular implementation subtasks.

Write the task document with this exact format:

```markdown
# Task: [task summary from prompt]

> Prompt: `.claude/prompts/prompt-{timestamp}.md`
> Created: [timestamp]
> Phase: `IN_PROGRESS`

## Session Context

> Copied from prompt file. Ensures context survives compaction, pause, or resume.

- **Prompt file:** `.claude/prompts/prompt-{timestamp}.md`
- **Task file:** `.claude/tasks/task-{timestamp}.md`
- **Role:** [CURRENT_ROLE]
- **Branch:** [current git branch]
- **Session ID:** [SESSION_ID]
- **Last completed:** [from memory]
- **Current subtask:** 1
- **Total subtasks:** [N]

---

## Implementation Plan

### Overview
[1-2 sentence summary of what will be implemented, incorporating user answers]

### User Answers Applied
- Q1: [question] → [user's answer]
- Q2: [question] → [user's answer]
(or "No questions were needed")

### Files to Touch
- `[file path]` — [what changes]
- `[file path]` — [what changes]

### Dependencies
- [any prerequisites, packages, or setup needed]
- None (if no dependencies)

---

## Subtasks

- [ ] **1. [Subtask title]**
  - Description: [what to do]
  - Files: `[file(s)]`
  - Expected output: [what success looks like]
  - Status: `PENDING`

- [ ] **2. [Subtask title]**
  - Description: [what to do]
  - Files: `[file(s)]`
  - Expected output: [what success looks like]
  - Status: `PENDING`

- [ ] **3. [Subtask title]**
  - Description: [what to do]
  - Files: `[file(s)]`
  - Expected output: [what success looks like]
  - Status: `PENDING`

[... repeat for all subtasks broken down from the prompt Steps]

---

## Progress Log

| # | Subtask | Status | Started | Completed | Notes |
|---|---------|--------|---------|-----------|-------|
| 1 | [title] | PENDING | — | — | — |
| 2 | [title] | PENDING | — | — | — |
| 3 | [title] | PENDING | — | — | — |

---

## Summary

- Total subtasks: [N]
- Completed: 0/[N]
- In progress: 0
- Failed: 0
- Phase: `IN_PROGRESS`
- Result: —
```

### Step 2: Update Prompt File
Edit the prompt file — add the task file path to the `## Session Context` section:
- Change `**Task file:** (created in Stage 5)` to `**Task file:** .claude/tasks/task-{timestamp}.md`

### Step 3: Output to Console

```
+============================================================+
|  TASK DOCUMENT CREATED                                     |
+============================================================+
File:      .claude/tasks/task-{timestamp}.md
Subtasks:  [N] items
Phase:     IN_PROGRESS
Context:   [CURRENT_ROLE] on [branch]
+============================================================+

NEXT ACTION: Starting subtask 1/[N] — "[first subtask title]"
             No action needed from you — I'll work through each subtask.
             Say "pause" anytime to stop execution.
```

Proceed immediately to STAGE 6.

## STAGE 6 — EXECUTE WITH LIVE TASK TRACKING

Execute each subtask from the task document. **Update the task document in real-time** as you work.

### BEFORE EACH SUBTASK — Context Check
1. Re-read `.claude/tasks/task-{timestamp}.md` (protects against context loss from compaction)
2. Read `## Session Context` → restore ROLE, BRANCH, current subtask number
3. Read `## Progress Log` → confirm which subtask is next
4. Update `## Session Context` → set `Current subtask: [n]`

### For EACH subtask:

#### 6a. Before starting the subtask:
1. Update the subtask checkbox and status in the task document:
   - Change `- [ ]` to `- [~]`
   - Change `Status: \`PENDING\`` to `Status: \`IN_PROGRESS\``
2. Update the Progress Log table:
   - Set Status to `IN_PROGRESS`
   - Set Started to current timestamp
3. Update the Summary:
   - Increment "In progress" count
4. Output to console:

```
WORKING ON: Subtask [n]/[N] — "[title]"
```

#### 6b. Execute the subtask:
- Follow the subtask description exactly
- After each action: verify result before moving on

#### 6c. After subtask completes successfully:
1. Update the subtask checkbox and status in the task document:
   - Change `- [~]` to `- [x]`
   - Change `Status: \`IN_PROGRESS\`` to `Status: \`DONE\``
2. Update the Progress Log table:
   - Set Status to `DONE`
   - Set Completed to current timestamp
   - Add any relevant notes
3. Update the Summary:
   - Increment "Completed" count (e.g., `Completed: 2/5`)
   - Decrement "In progress" count
4. Update `## Session Context` → set `Current subtask: [n+1]`
5. Output to console:

If MORE subtasks remain:
```
DONE: Subtask [n]/[N] — "[title]"

NEXT ACTION: Moving to subtask [n+1]/[N] — "[next title]"
             No action needed from you.
```

If this was the LAST subtask:
```
DONE: Subtask [n]/[N] — "[title]"

All subtasks complete. Finalizing...
```

#### 6d. If a subtask FAILS:
1. Update the subtask checkbox and status:
   - Change `- [~]` to `- [!]`
   - Change `Status: \`IN_PROGRESS\`` to `Status: \`FAILED\``
2. Update the Progress Log table:
   - Set Status to `FAILED`
   - Add failure reason in Notes
3. Output to console:

```
FAILED: Subtask [n]/[N] — "[title]"
Reason: [what went wrong]

NEXT ACTION: Choose one:
             - Say "retry" to try subtask [n] again
             - Say "skip" to move to subtask [n+1]
             - Say "abort" to stop all execution
```

**STOP HERE. Wait for user response before continuing.**

- If **"retry"**: retry the subtask once. If it succeeds, mark `DONE` and continue. If it fails again, ask again (retry/skip/abort).
- If **"skip"**: mark subtask as `SKIPPED`, move to next subtask with:
  ```
  SKIPPED: Subtask [n]/[N] — "[title]"

  NEXT ACTION: Moving to subtask [n+1]/[N] — "[next title]"
               No action needed from you.
  ```
- If **"abort"**: stop execution, go to STAGE 7 with `PARTIAL` or `BLOCKED` phase.

#### 6e. If user says "pause" at any time:
1. Finish the current subtask if possible, or mark as `PAUSED`
2. Update task document — ensure `## Session Context` has the correct `Current subtask` number
3. Output:

```
PAUSED: Execution stopped after subtask [n]/[N]
Completed: [n]/[N] | Remaining: [N-n]/[N]

NEXT ACTION: Say "resume" to continue from subtask [n+1]
             Say "abort" to stop completely
             Or review the task document at .claude/tasks/task-{timestamp}.md
```

**STOP HERE. Wait for user response.**

### Context Recovery (resume after pause, compaction, or new session)

If at any point the user says "resume" or context was lost:

1. Find the most recent file in `.claude/tasks/` with `Phase: \`IN_PROGRESS\``
2. Read its `## Session Context` → restore PROMPT_FILE, TASK_FILE, ROLE, BRANCH, current subtask
3. Read `## Progress Log` → find last `DONE` subtask, calculate next pending subtask
4. Re-read the prompt file → restore user answers and full task context
5. Output:

```
+============================================================+
|  CONTEXT RECOVERED                                         |
+============================================================+
Task:      .claude/tasks/task-{timestamp}.md
Progress:  [completed]/[total] subtasks done
Resuming:  Subtask [n+1] — "[title]"
Role:      [CURRENT_ROLE] on [branch]
+============================================================+

NEXT ACTION: Resuming subtask [n+1]/[N] — "[title]"
             No action needed from you. Say "pause" anytime.
```

Continue execution from that subtask.

### Pre-Execution Safety
If any subtask involves destructive action (delete, reset, drop, overwrite):
```bash
git add -A && git commit -m "pre-prompt checkpoint — [task summary]"
```

## STAGE 7 — MARK COMPLETE & UPDATE MEMORY

After ALL subtasks are done (or final status determined):

### Step 1: Update Task Document Phase
Edit the task document `.claude/tasks/task-{timestamp}.md`:

1. Change `Phase: \`IN_PROGRESS\`` to the final phase:
   - `Phase: \`COMPLETE\`` — if all subtasks are DONE
   - `Phase: \`PARTIAL\`` — if some subtasks FAILED or were skipped
   - `Phase: \`BLOCKED\`` — if execution could not continue

2. Update the Summary section:
   ```markdown
   ## Summary

   - Total subtasks: [N]
   - Completed: [N]/[N]
   - Failed: [N]/[N] (if any)
   - Skipped: [N]/[N] (if any)
   - Phase: `COMPLETE`
   - Result: [summary of what was accomplished]
   - Completed at: [timestamp]
   ```

3. Add a final section:
   ```markdown
   ---

   ## Final Result

   - Phase: `COMPLETE`
   - Duration: [start to finish time]
   - Files changed: [list all files created/modified]
   - Tests: [pass/fail/skipped]
   - Docs: [updated/skipped/flagged]
   - Completed at: [timestamp]
   ```

### Step 2: Update Prompt File
Edit the prompt file `.claude/prompts/prompt-{timestamp}.md`:
- Change `Status: \`CONFIRMED\`` to `Status: \`COMPLETE\``
- Append:

```markdown
---

## Execution Result

- Status: COMPLETE | PARTIAL [reason] | BLOCKED [reason]
- Task document: `.claude/tasks/task-{timestamp}.md`
- Subtasks: [completed]/[total]
- Files changed: [list]
- Tests: [pass/fail/skipped]
- Docs: [updated/skipped/flagged]
- Completed at: [timestamp]
```

### Step 3: Update MEMORY.md
This is MANDATORY — do not skip. Create MEMORY.md if it doesn't exist.

Add/update an entry with:
```markdown
## Last Completed
- **Task:** [task summary]
- **When:** [timestamp]
- **Prompt:** `.claude/prompts/prompt-{timestamp}.md`
- **Tracker:** `.claude/tasks/task-{timestamp}.md`
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Files changed:** [list]

## Next Step
- [recommended next action based on the work just completed]
```

### Step 4: Update TODO.md
If the completed task was linked to a TODO item, mark it as done.
If the task result suggests a follow-up, add it as a new TODO item.

### Step 5: Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | PROMPT_COMPLETE | [task summary] | [phase] | prompt:[prompt-file] task:[task-file] | subtasks:[completed]/[total] | files:[list]
```

### Step 6: Output Final Summary

```
+============================================================+
|  EXECUTION COMPLETE                                        |
+============================================================+
Task:      [what was done]
Prompt:    .claude/prompts/prompt-{timestamp}.md
Tracker:   .claude/tasks/task-{timestamp}.md
Subtasks:  [completed]/[total] DONE
Files:     [files changed]
Tests:     [pass/fail/skipped]
Docs:      [updated/skipped/flagged]
Memory:    Updated — [task summary]
Phase:     COMPLETE | PARTIAL | BLOCKED
+============================================================+

NEXT ACTION: Your task is complete. Here's what you can do:
             - Say "commit" to commit all changes
             - Say "/prompt [next task]" to start another task
             - Review results at .claude/tasks/task-{timestamp}.md
```
