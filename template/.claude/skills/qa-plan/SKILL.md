---
name: qa-plan
description: Create a QA test plan for a feature — test cases, acceptance criteria, risk areas, test data requirements.
user-invocable: true
context: fork
allowed-tools: Read, Write, Grep, Glob, Agent
argument-hint: '"feature name" [--task TASK-id]'
---

# QA Plan: $ARGUMENTS

## Process
1. Read feature requirements and acceptance criteria
2. Invoke @qa-lead to create test plan
3. Identify risk areas and edge cases
4. Define test data requirements
5. Output structured test plan with: test cases, priority, type (manual/automated), expected results
