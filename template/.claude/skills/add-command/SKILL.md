---
name: add-command
description: >
  Scaffold a new CLI command with argument parsing, help text, validation, and tests.
  Supports Commander.js, Yargs, Oclif, Click, Typer, Cobra, Clap, and custom CLI frameworks.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"command-name" [--flags "flag1,flag2"] [--subcommands "sub1,sub2"]'
effort: high
roles: [BackendDev, FullStackDev, TechLead]
agents: [@api-builder, @tester, @scaffolder]
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


# /add-command $ARGUMENTS

## Process
1. **Detect CLI framework:** Commander.js, Yargs, Oclif, Click, Typer, Cobra (Go), Clap (Rust), argparse
2. **Scaffold command:**
   - Command file with argument definitions, help text, handler function
   - Register in command index/router
   - Add validation for required arguments
   - Add --help output
3. **Add subcommands** (if `--subcommands` specified):
   - Create subcommand files
   - Register in parent command
   - Each with own args/help/handler
4. **Generate tests:**
   - Test: command runs with valid args → expected output
   - Test: command with missing required args → error message
   - Test: command --help → shows usage
   - Test: each subcommand runs independently
5. **Update documentation:**
   - Add to README CLI reference table
   - Update man page / --help root listing

## Definition of Done
- Command runs with `cli command-name --flag value`
- Help text shows for `cli command-name --help`
- Invalid args show clear error with usage hint
- Tests pass for happy path + error cases

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
