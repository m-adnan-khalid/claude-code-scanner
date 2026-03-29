---
name: api-docs
description: Generate or update API documentation — OpenAPI/Swagger specs from code, endpoint inventory, example requests/responses.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[--generate|--update|--validate] [--format openapi|markdown]"
roles: [BackendDev, FullStackDev, TechLead, Architect]
agents: [@docs-writer, @api-builder]
---

# API Docs: $ARGUMENTS

## Process
1. Scan all API route files for endpoints
2. Invoke @docs-writer to generate documentation
3. For each endpoint: method, path, params, body, response, auth, examples
4. Generate OpenAPI 3.0 spec or Markdown reference
5. Validate spec against actual implementation
6. Output: API reference document + endpoint inventory

## Definition of Done
- OpenAPI spec valid, all endpoints documented, examples included, spec matches code.

## Next Steps
- `/review-pr` or `/deploy`.

## Rollback
- Regenerate from code with `/api-docs --force`.
