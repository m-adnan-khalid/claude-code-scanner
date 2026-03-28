---
name: fix-bug
description: Quick bug fix workflow — shorter than full /workflow for small targeted fixes. Reproduce, fix, test, verify.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"bug description" [--file path] [--test]'
---

# Fix Bug: $ARGUMENTS

## Quick Fix Flow (5 steps, not 13)
1. **Reproduce**: Find the bug, write a failing test
2. **Diagnose**: Invoke @debugger to find root cause
3. **Fix**: Apply minimal fix
4. **Test**: Run test suite, verify fix + no regressions
5. **Review**: Quick @reviewer check if change > 20 lines

## When to Use
- Small, isolated bugs (1-3 files)
- For larger bugs, use `/workflow new "fix: description"` instead

## Definition of Done
- [ ] Bug reproduced with a failing test
- [ ] Fix applied with minimal change footprint
- [ ] All tests pass including new regression test
- [ ] No regressions introduced (full test suite green)
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/review-pr` — get code review on the fix
- **Issues found:** `/workflow new "fix: description"` — escalate to full workflow for complex bugs
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `git stash` to shelve uncommitted changes, or `git revert <commit>` for committed fixes
- **Revert to previous state:** `git checkout -- <files>` to discard working changes
