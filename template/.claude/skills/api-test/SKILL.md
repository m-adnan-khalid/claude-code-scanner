---
name: api-test
description: Run real API test suites — Postman/Newman collections, HTTP test scripts, contract tests. Validates endpoints, schemas, auth flows, error handling, and response times.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--tool newman|httpyac|hurl|bruno|supertest] [--collection "path"] [--env "staging|local"] [--base-url "http://..."] [--auth-token "token"]'
roles: [QA, BackendDev, FullStackDev, TechLead]
agents: [@tester, @qa-lead, @api-builder, @qa-automation]
---

# API Testing: $ARGUMENTS

## Auto-Detection
```bash
# Detect installed tools and collections
npx newman --version 2>/dev/null && echo "FOUND: newman"
hurl --version 2>/dev/null && echo "FOUND: hurl"
npx httpyac --version 2>/dev/null && echo "FOUND: httpyac"

# Detect collections/test files
ls *.postman_collection.json 2>/dev/null && echo "COLLECTION: postman"
ls **/*.hurl 2>/dev/null && echo "COLLECTION: hurl"
ls **/*.http 2>/dev/null && echo "COLLECTION: httpyac"
ls **/bruno/**/*.bru 2>/dev/null && echo "COLLECTION: bruno"

# Detect OpenAPI spec for auto-generation
ls openapi.yaml openapi.json swagger.json api-spec.yaml 2>/dev/null && echo "SPEC: openapi"
```

## Tool 1: Newman (Postman CLI — Most Popular)

### Install
```bash
npm install -g newman newman-reporter-htmlextra
```

### Run Collection
```bash
mkdir -p .claude/reports/api

newman run ${COLLECTION:-api-tests.postman_collection.json} \
  --environment ${ENV:-local.postman_environment.json} \
  --reporters cli,htmlextra,junit \
  --reporter-htmlextra-export .claude/reports/api/newman-report.html \
  --reporter-junit-export .claude/reports/api/newman-results.xml \
  --env-var "baseUrl=${BASE_URL:-http://localhost:8000}" \
  ${AUTH_TOKEN:+--env-var "authToken=$AUTH_TOKEN"} \
  --delay-request 100 \
  --timeout-request 10000 \
  2>&1 | tee .claude/reports/api/newman-output.txt
```

### Generate Collection from OpenAPI (if no collection exists)
```bash
# Convert OpenAPI to Postman collection
npx openapi-to-postmanv2 -s openapi.yaml -o api-tests.postman_collection.json -p
```

## Tool 2: Hurl (Fast, Git-friendly HTTP Testing)

### Install
```bash
# macOS
brew install hurl
# Linux
curl -LO https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb && sudo dpkg -i hurl_amd64.deb
```

### Generate Hurl Tests (if none exist)
```hurl
# tests/api/health.hurl
GET {{base_url}}/health
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
duration < 200

# tests/api/auth-login.hurl
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
{
  "email": "test@test.com",
  "password": "Test1234!"
}
HTTP 200
[Captures]
token: jsonpath "$.access_token"
[Asserts]
jsonpath "$.access_token" isString
duration < 1000

# tests/api/protected-endpoint.hurl
GET {{base_url}}/api/v1/users/me
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.email" == "test@test.com"

# tests/api/unauthorized.hurl
GET {{base_url}}/api/v1/users/me
HTTP 401
```

### Execute Hurl
```bash
mkdir -p .claude/reports/api

hurl --test \
  --variable base_url=${BASE_URL:-http://localhost:8000} \
  --report-junit .claude/reports/api/hurl-results.xml \
  --report-html .claude/reports/api/hurl-report/ \
  --very-verbose \
  tests/api/*.hurl \
  2>&1 | tee .claude/reports/api/hurl-output.txt
```

## Tool 3: HTTPyac (.http files — VS Code compatible)

### Execute
```bash
mkdir -p .claude/reports/api

npx httpyac send tests/api/*.http \
  --all \
  --output short \
  --var baseUrl=${BASE_URL:-http://localhost:8000} \
  --junit > .claude/reports/api/httpyac-results.xml \
  2>&1 | tee .claude/reports/api/httpyac-output.txt
```

## Tool 4: Supertest (Node.js — programmatic)
For projects already using Supertest in their test suite:
```bash
# Run API-specific tests
npx jest --testPathPattern='api|endpoint|route' \
  --reporters=default --reporters=jest-junit \
  2>&1 | tee .claude/reports/api/supertest-output.txt

# Or vitest
npx vitest run --reporter=junit tests/api/ \
  2>&1 | tee .claude/reports/api/vitest-api-output.txt
```

## Auto-Generate API Tests from OpenAPI Spec
When an OpenAPI/Swagger spec exists, auto-generate comprehensive tests:

```bash
# Read spec
SPEC=$(ls openapi.yaml openapi.json swagger.json 2>/dev/null | head -1)

if [ -n "$SPEC" ]; then
  echo "Found OpenAPI spec: $SPEC"
  # Parse endpoints and generate Hurl tests
  # (Agent reads spec and generates test files)
fi
```

The agent should:
1. Parse every endpoint from the spec
2. Generate tests for: happy path, auth required, validation errors, not found
3. Chain dependent requests (create → read → update → delete)
4. Assert response schemas match spec
5. Check response times

## Contract Testing
Validate API responses match their schemas:
```bash
# Validate responses against OpenAPI spec
npx swagger-cli validate openapi.yaml
npx openapi-diff base-spec.yaml current-spec.yaml > .claude/reports/api/breaking-changes.json
```

## Report Template
```markdown
# API Test Report
Date: {ISO timestamp}
Tool: {Newman|Hurl|HTTPyac|Supertest}
Base URL: {url}
Environment: {local|staging}

## Summary
| Metric | Value |
|--------|-------|
| Total Requests | N |
| Passed | N |
| Failed | N |
| Avg Response Time | Nms |
| Total Duration | Ns |

## Results by Endpoint
| Method | Endpoint | Status | Response Time | Assertions | Result |
|--------|----------|--------|--------------|------------|--------|
| GET | /health | 200 | 45ms | 2/2 | PASS |
| POST | /api/v1/auth/login | 200 | 230ms | 3/3 | PASS |
| GET | /api/v1/users/me | 200 | 180ms | 2/2 | PASS |
| GET | /api/v1/users/me (no auth) | 401 | 12ms | 1/1 | PASS |
| POST | /api/v1/data (invalid) | 422 | 15ms | 2/2 | PASS |

## Auth Flow Verification
| Step | Endpoint | Expected | Actual | Status |
|------|----------|----------|--------|--------|
| Register | POST /auth/register | 201 | 201 | PASS |
| Login | POST /auth/login | 200 + token | 200 + token | PASS |
| Protected | GET /users/me | 200 | 200 | PASS |
| No Auth | GET /users/me | 401 | 401 | PASS |
| Bad Token | GET /users/me | 401 | 401 | PASS |

## Response Time Analysis
| Endpoint | Min | Avg | p95 | p99 | Max | Status |
|----------|-----|-----|-----|-----|-----|--------|
| GET /health | Nms | Nms | Nms | Nms | Nms | PASS |

## Failed Tests
| # | Endpoint | Expected | Actual | Error |
|---|----------|----------|--------|-------|
| 1 | {method} {path} | {expected} | {actual} | {message} |

## Schema Validation
| Endpoint | Schema Match | Breaking Changes |
|----------|-------------|-----------------|
| GET /users | YES | NONE |

## Evidence
- HTML Report: `.claude/reports/api/{tool}-report.html`
- JUnit XML: `.claude/reports/api/{tool}-results.xml`
- Raw Output: `.claude/reports/api/{tool}-output.txt`

## Verdict
**PASS** — All {N} API tests passed. Avg response time: {N}ms.
OR
**FAIL** — {N} failures. See Failed Tests above.
```

Save to `.claude/reports/api/report-{date}.md`

## Definition of Done
- All API endpoints tested (happy path + error cases)
- Auth flow verified end-to-end
- Response times measured against thresholds
- Schema validation passed (if OpenAPI spec exists)
- Structured report saved to `.claude/reports/api/`
