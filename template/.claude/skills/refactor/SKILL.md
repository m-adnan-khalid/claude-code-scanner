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

# Refactor: $ARGUMENTS

## Process
1. Read target code and understand current structure
2. Run existing tests to establish green baseline
3. Invoke @code-quality to analyze current patterns and suggest improvements
4. Apply refactoring in small, testable steps:
   - Extract: pull function/class/module out
   - Rename: update all references across codebase
   - Move: relocate to correct architectural layer
   - Split: break large file into smaller focused files
5. Run tests after EACH step — never break green
6. Invoke @reviewer for quick review

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
