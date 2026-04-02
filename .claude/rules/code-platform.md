---
paths: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs", "**/*.swift", "**/*.kt", "**/*.dart", "**/*.rs", "**/*.cpp", "**/*.c", "**/*.php", "**/*.scala"]
---
# Code Platform — Database, API, i18n, Platform-Specific

## Database & Persistence
- All queries parameterized — zero string interpolation
- Batch operations for bulk insert/update — never loop single queries
- Transaction scope minimal — hold only as long as needed
- Migrations backwards-compatible or include rollback plan
- All queried fields must have indexes

## API Design (REST/GraphQL/gRPC)
- HTTP methods semantically correct (GET/POST/PUT/PATCH/DELETE)
- All list endpoints must support pagination
- Status codes semantically accurate (201, 404, 409, etc.)
- Input validated at API boundary — reject early with clear errors
- Request/response envelope consistent across all endpoints

## Internationalization (i18n)
- No hardcoded user-facing strings — use resource files/i18n keys
- Dates/numbers/currency: locale-aware formatters only
- Timestamps stored as UTC — local only for display
- No string concatenation for sentences — use parameterized templates

## Platform-Specific (applied by scan results)
- **Web:** Semantic HTML, ARIA, keyboard nav, error boundaries, lazy loading
- **Mobile:** Lifecycle mgmt, permission handling, background task limits, battery efficiency
- **Desktop:** UI on main thread, heavy work offloaded, window state persistence
- **Embedded:** No unbounded allocations, deterministic timing, HAL, minimal ISRs
