---
name: onboard
description: Onboard a new developer — explain codebase structure, key files, conventions, how to run/test/deploy, and team workflow.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Agent
argument-hint: "[--role backend|frontend|mobile|fullstack] [--quick]"
---

# Onboard: $ARGUMENTS

## Process
1. Read CLAUDE.md for project overview
2. Read `.claude/project/` for architecture and domain knowledge
3. Invoke @explorer to analyze codebase structure
4. Generate onboarding guide:
   - Project overview and architecture
   - How to set up local dev environment
   - Key files and directories (with descriptions)
   - Code conventions and patterns
   - How to run, test, lint, deploy
   - Team workflow (methodology, PR process, review)
   - Common gotchas and debugging tips
