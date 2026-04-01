# Prompt

Step-by-step guided prompt workflow with full memory and context tracking.
Every stage ends with a clear NEXT ACTION telling the user exactly what to do next.

## Input
The user's raw prompt text: $ARGUMENTS

## Memory & Context Loading (BEFORE anything else)

Before starting the pipeline, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE, SESSION_ID
2. **Memory:** Read `MEMORY.md` → get last completed task, next step, user preferences
3. **History:** List `.claude/prompts/` and `.claude/tasks/` → know what was done before, avoid duplicates
4. **Active work:** Read `TODO.md` → get current work items
5. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
6. **Past answers:** Scan recent prompt files for `## User Answers` → reuse patterns from prior prompts

Store all loaded context in a `## Context Loaded` block inside the prompt file so it survives conversation compaction.

## Pipeline

### Pass 1 — Specificity & Role Alignment
1. Use CURRENT_ROLE from loaded context
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

### Pass 4 — Context Injection (uses loaded memory)
1. Use MEMORY.md data to resolve vague references ("continue", "pick up where we left off")
2. Use TODO.md to link prompt to active work items
3. Use prompt history to detect duplicate/overlapping work
4. If prompt says "fix the thing" or similar vague text, resolve to specific MEMORY/TODO item
5. If prior prompt has relevant user answers, carry them forward as defaults

### Pass 5 — Risk Assessment
1. Flag destructive actions: delete, drop, remove, reset, force-push
2. Flag schema changes: migration, alter table, add field
3. If destructive: require git checkpoint before execution
4. Compute overall score (average of all dimensions)

## Output — Write Prompt to File

After all 5 passes, write the improved prompt to `.claude/prompts/prompt-{timestamp}.md`.

The file MUST contain a `## Session Context` section that stores:
- PROMPT_FILE path, TASK_FILE path (to be created later), CURRENT_ROLE, BRANCH, SESSION_ID
- Last completed task from MEMORY.md
- Related prior prompts (if any)
- This section ensures context survives conversation compaction or pause/resume

The file must also contain:
1. The improved prompt (Task, Context, Constraints, Steps, Definition of Done)
2. A `## Questions` section with `[ANSWER REQUIRED]` placeholders for any gaps
3. A `## User Answers` section where the user fills in responses
4. A `## What To Do` section with instructions

**NEXT ACTION output (if questions exist):**
> NEXT ACTION: Open `.claude/prompts/prompt-{timestamp}.md`, fill in the [ANSWER REQUIRED] fields in the User Answers section, then come back and say "proceed".

**NEXT ACTION output (if no questions):**
> NEXT ACTION: Review the prompt at `.claude/prompts/prompt-{timestamp}.md`. If it looks good, say "proceed". To edit, modify the file first.

## User Confirmation

Wait for the user to say "proceed", "run it", "go", "confirm", or similar.

When confirmed:
1. Read the prompt file again (re-load full context from `## Session Context`)
2. If any `[ANSWER REQUIRED]` remain:
   - **NEXT ACTION:** "Questions [1, 3] still need answers. Open the file and fill them in, then say 'proceed' again."
3. Once all answers provided — proceed to Create Task Document

## Create Task Document

Create `.claude/tasks/task-{timestamp}.md` with:
- Link back to the prompt file
- User answers applied to implementation plan
- Subtasks with implementation details and progress log
- `## Session Context` section (copied from prompt file + TASK_FILE path added)

Update the prompt file: add `Task: .claude/tasks/task-{timestamp}.md` to Session Context.

**NEXT ACTION output:**
> NEXT ACTION: I'm now starting subtask 1 of [N]: "[subtask title]". No action needed from you — I'll update the task document as I go. Say "pause" anytime to stop.

## Execute with Task Tracking

For EACH subtask:
1. **Re-read task document** before each subtask (in case of context loss from compaction)
2. Before: mark `IN_PROGRESS` in task doc, output:
   > WORKING ON: Subtask [n]/[N] — "[title]"
3. After success: mark `DONE`, output:
   > DONE: Subtask [n]/[N] — "[title]"
   > NEXT ACTION: Moving to subtask [n+1]/[N] — "[next title]". No action needed.
4. After failure: mark `FAILED`, output:
   > FAILED: Subtask [n]/[N] — "[title]" — [reason]
   > NEXT ACTION: Choose one: say "retry" to try again, "skip" to move on, or "abort" to stop.

After ALL subtasks:
- Mark task document phase `IN_PROGRESS` → `COMPLETE` / `PARTIAL` / `BLOCKED`
- Update prompt file status to `COMPLETE`
- Update prompt file with execution results

## Post-Execution Memory Updates

1. **Update MEMORY.md** (create if doesn't exist):
   - Add entry: task summary, timestamp, prompt file path, task file path, result
   - Set "Last Completed" and "Next Step"
2. **Update TODO.md** if task was linked to a TODO item
3. **Check docs** — if src files changed, flag docs that may need update
4. **Audit log** — log everything to `.claude/reports/audit/audit-{branch}.log`

**NEXT ACTION output:**
> NEXT ACTION: All done. Review the task at `.claude/tasks/task-{timestamp}.md`. Say "commit" to commit changes, or continue with your next task.

## Context Recovery (pause/resume/compaction)

If at any point context is lost (conversation compaction, pause, resume, new session):
1. Read the most recent file in `.claude/tasks/` that has `Phase: IN_PROGRESS`
2. Read its `## Session Context` section to restore: PROMPT_FILE, TASK_FILE, ROLE, BRANCH
3. Read the `## Progress Log` to find the last completed subtask
4. Resume from the next pending subtask
5. Output:
   > RESUMED: Picking up from subtask [n+1]/[N] — "[title]"
   > Context restored from .claude/tasks/task-{timestamp}.md
   > NEXT ACTION: No action needed — continuing execution. Say "pause" anytime.

## CRITICAL RULES
1. **Every single output to the user MUST end with a `NEXT ACTION:` line.**
2. **Every file written MUST contain a `## Session Context` section** so context survives compaction.
3. **Re-read task/prompt files before each stage** — never rely on in-memory state alone.
4. **Update MEMORY.md after every completed task** — future prompts depend on this.
5. **Carry forward user answer patterns** — if the user answered similar questions before, pre-fill defaults.
