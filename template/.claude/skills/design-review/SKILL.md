---
name: design-review
description: Review architecture and design decisions. Check alignment with project patterns, scalability, and maintainability.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Agent
argument-hint: '"design description" [--scope backend|frontend|mobile|infra]'
---

# Design Review: $ARGUMENTS

## Process
1. Read current architecture (CLAUDE.md, ARCHITECTURE.md)
2. Invoke @architect to evaluate the design
3. Invoke @code-quality for pattern analysis
4. Check alignment with existing conventions
5. Output: APPROVED / NEEDS_REVISION with specific feedback
