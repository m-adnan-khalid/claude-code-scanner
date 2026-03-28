---
name: signoff
description: Sign-off gate — get tech, QA, or business approval for a task. Checks all criteria before approving.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[tech|qa|business] [TASK-id]"
---

# Sign-off: $ARGUMENTS

## Process
1. Read task file for current status and requirements
2. For tech sign-off: invoke @team-lead (architecture, code quality, test coverage)
3. For QA sign-off: invoke @qa-lead (all tests pass, QA plan complete, no open bugs)
4. For business sign-off: invoke @product-owner (acceptance criteria met, UX approved)
5. Output: APPROVED / REJECTED with specific reasons
