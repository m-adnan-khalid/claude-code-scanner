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
