# Testing Strategy

> Generated during pre-development planning

## Test Pyramid

```
        /  E2E  \           <- Few, slow, expensive (critical user journeys only)
       /----------\
      / Integration \       <- Moderate, test service boundaries and data flow
     /----------------\
    /    Unit Tests     \   <- Many, fast, cheap (business logic, utilities, models)
   /____________________\
```

## Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| Unit tests | {80%+} | Core business logic, utilities, models |
| Integration tests | {60%+} | API endpoints, DB queries, service interactions |
| E2E tests | {Critical paths} | User journeys: signup, purchase, core workflow |
| Load tests | {Key endpoints} | Login, search, checkout — endpoints under heaviest load |

## Testing Stack

| Type | Tool | Config File |
|------|------|------------|
| Unit | {Jest/Vitest/Pytest/Go test} | {config path} |
| Integration | {Supertest/Pytest/etc.} | {config path} |
| E2E | {Playwright/Cypress/Detox} | {config path} |
| Load | {k6/Locust/JMeter} | {config path} |
| Coverage | {Istanbul/c8/coverage.py} | {config path} |

## Test Categories

### Unit Tests
- **What to test:** Business logic, utility functions, data transformations, validation rules, state management
- **What NOT to test:** Framework internals, third-party libraries, trivial getters/setters
- **Patterns:** Arrange-Act-Assert, Given-When-Then
- **Mocking strategy:** Mock external dependencies (APIs, DB), never mock the thing under test

### Integration Tests
- **What to test:** API endpoints (request → response), database queries, service-to-service communication, authentication flows
- **What NOT to test:** UI rendering, external third-party APIs (use contract tests)
- **Database strategy:** {real DB per test / test containers / in-memory}
- **API testing:** {supertest / httpx / REST-assured}

### E2E Tests
- **What to test:** Critical user journeys end-to-end
- **Critical paths:**
  1. {User registration and login}
  2. {Core feature workflow}
  3. {Payment/checkout flow}
  4. {Data export/reporting}
- **Environment:** {staging / dedicated test env}
- **Data strategy:** {seed data / factory / snapshot}

### Load Tests
- **Baseline targets:**
  - Response time p95: {< 500ms}
  - Throughput: {X requests/second}
  - Error rate: {< 0.1%}
- **Key scenarios:**
  1. {Normal load — expected daily traffic}
  2. {Peak load — 3x normal}
  3. {Stress test — find breaking point}

## Quality Gates (must pass before merge)

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage does not decrease
- [ ] No new lint/type errors
- [ ] E2E smoke tests pass (for critical path changes)
- [ ] Performance baseline not regressed (for API changes)

## Test Naming Convention

```
{unit/integration/e2e}/{feature}/{scenario}.test.{ext}

Example:
tests/unit/auth/login-validation.test.ts
tests/integration/api/create-order.test.ts
tests/e2e/checkout/complete-purchase.test.ts
```

## CI/CD Test Pipeline

```
PR opened
  → Lint + Type check (< 1 min)
  → Unit tests (< 3 min)
  → Integration tests (< 5 min)
  → Coverage report + comparison
  → E2E smoke (< 10 min, critical paths only)

Pre-deploy
  → Full E2E suite
  → Load test baseline check
  → Security scan
```
