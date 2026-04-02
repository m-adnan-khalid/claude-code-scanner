# Deep Scan Instructions

## Backend Deep Scan (Agent 3)
Read actual source files, not just configs.

### Runtime & Framework
- Exact language/runtime version (from config, CI, Dockerfile)
- Module system (ESM, CommonJS, mixed)
- Framework patterns: middleware chain, DI, router structure, error handlers
- Custom abstractions on top of framework

### Version Manifest (MANDATORY OUTPUT)
After scanning, produce `TECH_MANIFEST.json` in `.claude/project/` with ALL detected versions:
```json
{
  "language": {"name": "{lang}", "version": "{ver}", "source": "{config file}"},
  "framework": {"name": "{fw}", "version": "{ver}", "source": "{config file}"},
  "dependencies": [
    {"name": "{pkg}", "version": "{ver}", "type": "runtime|dev|peer"}
  ],
  "platform": {"type": "web|mobile|desktop|embedded", "targets": ["{target versions}"]},
  "test_framework": {"name": "{fw}", "version": "{ver}"},
  "orm_database": {"orm": "{name}", "orm_version": "{ver}", "db": "{name}", "db_version": "{ver}"},
  "build_tools": [{"name": "{tool}", "version": "{ver}"}]
}
```
This manifest is used by ALL agents for the 3-step doc verification (accuracy.md). Agents read this file INSTEAD of re-parsing dependency files each time.

### API Layer
- READ every route file — list all endpoints (method + path)
- Request validation: Zod, Joi, Pydantic, class-validator
- Response format: envelope, direct, HAL, JSON:API
- Error format: codes, messages, status codes
- Pagination: cursor, offset, keyset
- Auth: JWT/session/OAuth — read the actual auth middleware
- Authorization: RBAC/ABAC — read actual permission checks

### Database Layer
- ORM, connection pooling, migration strategy
- Query patterns: raw SQL, query builder, repository, active record
- Transaction handling, caching strategy, read replicas

### Background & External
- Job queues: Bull, Celery, Sidekiq
- Events: pub/sub, domain events, message brokers
- Third-party APIs, SDKs, file storage, search engines

### Security & Observability
- Password hashing, token validation, input sanitization
- Logging library, format, levels, request tracing
- Metrics, health checks, error tracking

---

## Frontend Deep Scan (Agent 4)
Read 3-5 actual components.

### Framework & Rendering
- Exact version, rendering mode (CSR/SSR/SSG/ISR)
- Component flavor: hooks, Composition API, class-based, signals

### Routing & State
- Router library, route definition pattern (file-based/config-based)
- State: Redux/Zustand/Pinia/NgRx/Context
- Server state: React Query/SWR/Apollo
- Form state: React Hook Form/Formik

### Component Architecture
- File structure, naming, organization pattern
- Prop patterns, common component patterns (compound, HOC, hooks)
- Design system / UI library

### Styling & Build
- CSS Modules/Tailwind/styled-components/SCSS
- Bundler config, env var prefix (NEXT_PUBLIC_, VITE_)
- TypeScript strict mode, path aliases

### Testing & API
- Unit: Jest/Vitest + testing-library patterns
- E2E: Cypress/Playwright patterns
- HTTP client, API layer abstraction, error/loading handling

---

## Architecture Scan (Agent 5)
- Trace a request end-to-end through all layers
- Map module boundaries and dependency graph
- Identify circular dependencies
- Classify: monolith/modular monolith/microservices
- Document deployment topology, CDN, load balancer
- Map auth flow step-by-step
- Identify shared code across modules/packages

---

## Domain & Convention Scan (Agent 6)
Read 20+ files to establish patterns.

### Naming (per context)
- Variables, functions, classes/types, files, directories
- Test names, API endpoints, DB tables/columns, env vars

### Code Style (beyond linter)
- Import ordering/grouping, export style
- Ternary vs if-else preference, arrow vs function
- Async patterns: await, .then(), callbacks

### Conventions
- Error types/classes, how errors propagate
- Git commit format (from last 20 commits), branch naming
- Documentation: JSDoc/docstring coverage, README structure

### Structural Metrics (feeds into code-standards rule)
- Sample 20+ source files: count lines per file → compute median and P90
- Sample 20+ functions/methods: count lines per function → compute median and P90
- Typical parameter counts: note the max seen in well-structured functions
- Nesting depth: spot-check 10 files for max indent levels
- Import ordering: identify if stdlib-first, external-second, internal-third is followed
- Magic values: note if codebase uses constants/enums vs inline string/number literals
- Boolean naming: check if `is/has/should/can` prefixes are used consistently
- Report these metrics in scan-results.md under `## Code Standards Metrics`

### Type Safety Scan
- Check if strict mode enabled: `strict: true` (TS), `from __future__ import annotations` (Python), `#nullable enable` (C#), etc.
- Grep for `any`, `: object`, `dynamic`, `Object` in typed codebases — count occurrences
- Check for unsafe casts: `as Type` (TS), `(Type)` (Java/C#), `as!` (Swift), `!!` (Kotlin)
- Check for unhandled nullables: optional chaining vs null checks vs ignoring
- Report in scan-results.md under `## Type Safety Metrics`

### Error Handling Scan
- Grep for custom error/exception classes — list them, check hierarchy
- Grep for bare catch blocks: `catch {}`, `catch (e) {}`, `except:`, `except Exception`
- Grep for generic throws: `throw new Error(`, `raise Exception(`
- Check if network/IO calls have timeouts configured
- Check for swallowed errors: catch blocks with no logging or re-throw
- Report in scan-results.md under `## Error Handling Patterns`

### Constants & Config Scan
- Check if constants are in dedicated files or inline in business logic
- Grep for hardcoded URLs, IPs, ports, endpoints in source files
- Check for hardcoded user-facing strings vs i18n resource usage
- Check environment variable access: direct `process.env`/`os.environ` vs config injection
- Report in scan-results.md under `## Constants & Config Patterns`

### Testability Scan
- Check for `new ConcreteService()` inside business logic (non-injectable deps)
- Check for static methods used for business logic
- Check for direct time/clock access: `Date.now()`, `System.currentTimeMillis()`, `time.time()`
- Check for direct filesystem access in business logic classes
- Report in scan-results.md under `## Testability Patterns`

### Concurrency & Async Scan
- Grep for unhandled promises: `.then(` without `.catch(`, missing `await`
- Check for fire-and-forget patterns: goroutines without error channels, threads without join
- Check for shared mutable state: global variables modified by multiple functions
- Check for callback nesting depth (callback hell)
- Report in scan-results.md under `## Concurrency Patterns`

### Resource Management Scan
- Check for event listener registration without matching removal
- Check subscription patterns (RxJS, EventEmitter, signals) — are they disposed?
- Check for string concatenation in loops vs builder/buffer usage
- Check cache implementations for TTL or invalidation
- Report in scan-results.md under `## Resource Management Patterns`

### Database Scan
- Check for raw SQL strings with interpolation vs parameterized queries
- Check for single-query loops (N+1 pattern)
- Check transaction usage and scope
- Check migration files for rollback support
- Check for missing indexes on commonly queried fields
- Report in scan-results.md under `## Database Patterns`

### Logging Scan
- Check log format: structured (JSON/key=value) vs free-text
- Check log levels used: are ERROR/WARN/INFO/DEBUG used correctly?
- Grep for PII in log statements (email, password, token, ssn, phone)
- Check for correlation/request ID in log entries
- Report in scan-results.md under `## Logging Patterns`

### Platform-Specific Scan
- **Web:** Check for semantic HTML, ARIA usage, error boundaries, lazy loading, bundle analysis
- **Mobile:** Check lifecycle methods, permission handling, background task patterns, deep linking
- **Desktop:** Check main thread usage, worker threads, window state management
- **Embedded:** Check memory allocation patterns, interrupt handlers, HAL usage
- Report in scan-results.md under `## Platform Patterns`

### SOLID & Architecture Patterns (feeds into code-standards rule)
- Interface/abstract usage: grep for `interface`, `abstract class`, `Protocol` (Python), `trait` (Rust/PHP)
- Dependency injection: check if DI container exists (e.g., NestJS modules, Spring beans, Python inject)
- Constructor injection vs service locator: which pattern does the codebase use?
- Repository pattern: are DB queries behind interfaces or called directly in handlers?
- Service layer: do handlers call services, or contain business logic directly?
- Extension pattern: when new features are added, are new classes created (OCP) or existing ones modified?
- God classes: flag any class with 10+ public methods or 500+ lines
- if/else chains: flag any switch/if-else with 5+ branches that could be Strategy pattern
- Report in scan-results.md under `## Architecture Patterns`

### Gotchas
- ALL TODO/FIXME/HACK comments with context
- Workarounds with explanatory comments
- Dead code, deprecated features still present
- Implicit ordering dependencies, magic values
- Existing AI config: .cursorrules, CLAUDE.md, .aider
