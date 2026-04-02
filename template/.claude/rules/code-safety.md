---
paths: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs", "**/*.swift", "**/*.kt", "**/*.dart", "**/*.rs", "**/*.cpp", "**/*.c", "**/*.php", "**/*.scala"]
---
# Code Safety — Type Safety, Error Handling, Testability, Concurrency

## Type Safety
- No `any`, `object`, `dynamic`, or equivalent — use specific types or generics
- No unsafe type casts unless in thin adapter layer with comment
- Nullable types must be explicitly handled — no implicit null propagation
- Use discriminated unions / sealed classes / enums over loose string types

## External API Verification (MANDATORY — see accuracy.md)
- Before using any external API/framework/library: follow the 3-step in accuracy.md
- Step 1: Read dependency file for exact version | Step 2: WebSearch version-specific docs | Step 3: Write code
- Never assume API signatures from training data — always verify against installed version's docs

## Error Handling
- Define domain-specific error types — never throw generic `Error`/`Exception`
- Catch specific types — no bare `catch {}` or `except Exception`
- Every error: message + error code + original cause
- Network/IO calls MUST have timeouts — no infinite waits
- Retry only idempotent ops — non-idempotent fail fast
- Translate infrastructure errors to domain errors at boundary
- Never swallow errors — log or propagate

## Testability
- All dependencies injectable — no `new ConcreteService()` in business logic
- No static methods/singletons for business logic
- No direct env access — inject config object
- No direct `Date.now()`/`time.time()` — inject time provider
- No direct filesystem access in business logic — use abstracted service
- No hardcoded URLs/endpoints — inject via config

## Concurrency & Async
- All async calls awaited or fire-and-forget with error handler
- No nested callbacks beyond 1 level — use async/await
- Shared mutable state must use synchronization (locks, atomics, channels)
- Immutable data preferred for concurrent access

## Memory & Resource Management
- Subscriptions/listeners/observers must be disposed on cleanup
- Resources closed in `finally`/`defer`/`using`/`with`
- String concatenation in loops: use buffer/builder
- Cache entries must have TTL or explicit invalidation
