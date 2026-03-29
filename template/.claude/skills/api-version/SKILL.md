---
name: api-version
description: >
  API versioning management — add new API versions, deprecate old endpoints, generate migration
  guides, validate backward compatibility, and track version lifecycle.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[add v2 | deprecate v1/endpoint | status | migrate v1-to-v2 | validate]"
effort: high
roles: [BackendDev, FullStackDev, TechLead, Architect]
agents: [@api-builder, @architect, @docs-writer]
---

# /api-version $ARGUMENTS

## Commands
- `/api-version add v2` — Create new API version (copy routes, update version prefix)
- `/api-version deprecate v1/users` — Mark endpoint deprecated with sunset date + migration path
- `/api-version status` — Show all versions, endpoints per version, deprecation schedule
- `/api-version migrate v1-to-v2` — Generate client migration guide (breaking changes, new endpoints)
- `/api-version validate` — Check backward compatibility between versions

## Process

### Add Version
1. Detect versioning strategy: URL path (/v1/), header (Accept-Version), query (?version=2)
2. Copy current version's routes/controllers to new version directory
3. Update route prefixes and version constants
4. Create version changelog: `docs/api/v{N}-changelog.md`
5. Update OpenAPI spec with new version

### Deprecate
1. Add deprecation header to endpoint: `Deprecation: true`, `Sunset: {date}`
2. Add warning response header: `Warning: 299 - "This endpoint is deprecated. Use /v2/users instead."`
3. Log deprecation in API docs with migration path
4. Create monitoring alert for deprecated endpoint usage

### Validate
1. Compare request/response schemas between versions
2. Flag breaking changes: removed fields, type changes, renamed endpoints
3. Verify deprecated endpoints still function (not removed prematurely)
4. Check that new version handles all use cases of old version

## Definition of Done
- New version created with all endpoints functional
- Deprecated endpoints marked with sunset date and migration path
- No breaking changes without explicit documentation
- Client migration guide generated
