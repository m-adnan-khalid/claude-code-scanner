---
name: refactor
description: Targeted code refactoring — extract, rename, move, split, restructure. Preserves behavior while improving structure.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"refactor description" [--scope path/to/module] [--type extract|rename|move|split]'
roles: [BackendDev, FrontendDev, FullStackDev, TechLead]
agents: [@code-quality, @reviewer, @tester]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. **Verify Docs (3-step)**: Read dependency files for exact versions → WebSearch `"<framework> <version> <API> docs"` → only then write code (per accuracy.md 3-step rule)
16. Re-read task/output files before each step — never rely on in-memory state alone.
16. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
16. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
16. **Active work:** Read `TODO.md` (if exists) → get current work items
16. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# Refactor: $ARGUMENTS

## Process
1. Read target code and understand current structure
2. Run existing tests to establish green baseline
16. Invoke @code-quality to analyze current patterns and suggest improvements
16. Apply refactoring in small, testable steps:
   - Extract: pull function/class/module out
   - Rename: update all references across codebase
   - Move: relocate to correct architectural layer
   - Split: break large file into smaller focused files
16. Run tests after EACH step — never break green
16. Invoke @reviewer for quick review

## Rules
- NEVER change behavior — only structure
- Run tests after every change
- If tests break, revert and try a smaller step

## Definition of Done
- [ ] All existing tests pass (no behavior change)
- [ ] Code review clean — no structural concerns raised
- [ ] Refactoring improves at least one measurable quality metric (complexity, duplication, cohesion)
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/review-pr` — get code review on the refactored code
- **Issues found:** `/fix-bug "regression from refactor"` — address any unintended behavior changes
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `git stash pop` to restore stashed pre-refactor state, or `git revert <commit>` for committed changes
- **Revert to previous state:** `git checkout <pre-refactor-branch>` to return to original structure

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Output:** [file path if any]
- **Next Step:** [recommended next action]

### Update TODO
If this work was linked to a TODO item, mark it done. If follow-up needed, add new TODO.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Context Recovery
If context is lost (compaction, pause, resume):
1. Find most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read `## Session Context` → restore state
16. Read `## Progress Log` → find last completed step
16. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
