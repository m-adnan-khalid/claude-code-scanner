# Deep Scan Instructions

## Backend Deep Scan (Agent 3)
Read actual source files, not just configs.

### Runtime & Framework
- Exact language/runtime version (from config, CI, Dockerfile)
- Module system (ESM, CommonJS, mixed)
- Framework patterns: middleware chain, DI, router structure, error handlers
- Custom abstractions on top of framework

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

### Gotchas
- ALL TODO/FIXME/HACK comments with context
- Workarounds with explanatory comments
- Dead code, deprecated features still present
- Implicit ordering dependencies, magic values
- Existing AI config: .cursorrules, CLAUDE.md, .aider
