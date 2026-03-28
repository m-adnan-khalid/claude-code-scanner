---
name: review-pr
description: Review a pull request — check code quality, test coverage, security, architecture alignment, and conventions.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[PR-number|branch-name]"
---

# Review PR: $ARGUMENTS

## Process
1. Read the diff (git diff main...branch or gh pr diff)
2. Invoke @reviewer for code quality review
3. Invoke @security for security review (if auth/data changes)
4. Check test coverage delta
5. Verify architecture alignment
6. Output structured review with APPROVE / REQUEST_CHANGES / COMMENT
