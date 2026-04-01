---
name: qa-plan
description: Create a QA test plan for a feature — test cases, acceptance criteria, risk areas, test data requirements.
user-invocable: true
context: fork
allowed-tools: Read, Write, Grep, Glob, Agent
argument-hint: '"feature name" [--task TASK-id]'
roles: [QA, TechLead]
agents: [@qa-lead, @tester, @qa-automation]
---

**Lifecycle: T3 (planning/docs) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior planning outputs
3. **Git state:** Run `git status`, `git branch` → get branch
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **Project docs:** Scan `.claude/project/` for existing planning docs to avoid duplication

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# QA Plan: $ARGUMENTS

## Process
1. Read feature requirements and acceptance criteria
2. Invoke @qa-lead to create test plan
3. Identify risk areas and edge cases
4. Define test data requirements
5. Output structured test plan with: test cases, priority, type (manual/automated), expected results

## Definition of Done
- Test plan created with test cases, acceptance criteria mapped, risk areas identified, test data defined.

## Next Steps
- `/workflow qa TASK-{id}` to execute tests.

## Rollback
- `/qa-plan --update` to revise.

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [what was planned/documented]
- **When:** [timestamp]
- **Result:** [document created/updated]
- **Output:** [file path of output document]
- **Next Step:** [recommended next planning phase or implementation step]

### Update TODO
If this planning output creates actionable work, add items to TODO.md.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Planning complete. Here's what you can do:
             - Review output at the generated file path
             - Run the next planning phase command
             - Say "/scaffold" or "/feature-start" to begin implementation
```
