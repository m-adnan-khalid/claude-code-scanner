---
name: add-component
description: Scaffold a new UI component with template, styles, tests, and optionally a Storybook story.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"component name" [--type page|layout|widget|form]'
roles: [FrontendDev, FullStackDev, TechLead]
agents: [@frontend, @tester, @scaffolder]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. Re-read task/output files before each step — never rely on in-memory state alone.
4. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# Add Component: $ARGUMENTS

## Process
1. Read existing components for patterns (naming, structure, styling approach)
2. Invoke @frontend to scaffold: component → styles → test → story
3. Follow project conventions (React/Vue/Svelte/Flutter patterns)
4. Add prop types/interfaces
5. Run lint + tests

## Definition of Done
- Component renders, tests pass, follows project conventions, Storybook story (if applicable).

## Next Steps
- `/add-page` to wire up, or continue development.

## Rollback
- **Undo scaffolding:** `git checkout -- <component-dir>/` to revert generated files
- **Remove component:** `rm -rf <component-dir>/` then `git checkout .` to clean up
- **Re-scaffold differently:** `/add-component "Name" --force` to overwrite

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
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
