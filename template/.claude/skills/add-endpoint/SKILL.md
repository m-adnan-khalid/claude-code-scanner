---
name: add-endpoint
description: Scaffold a new API endpoint with route, service, model, and tests. Follows project conventions automatically.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"endpoint description" [--method GET|POST|PUT|DELETE] [--path /api/v1/...]'
---

# Add Endpoint: $ARGUMENTS

## Process
1. Read existing endpoints for patterns (route structure, auth, validation)
2. Invoke @api-builder to scaffold: route → service → model → test
3. Follow project's architecture (Clean Architecture layers, repository pattern, etc.)
4. Add tests (unit + integration)
5. Run test suite to verify
