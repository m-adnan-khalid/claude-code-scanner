---
paths: ["**/*.ts", "**/*.js", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs"]
---
# Logging Standards (detailed reference — summary in code-standards.md)

## Format
- Use **structured JSON logging** in production (machine-parseable)
- Include: `timestamp`, `level`, `message`, `service`, `requestId`, `userId` (if authed)
- Human-readable format allowed in development only

## Log Levels
| Level | When to Use | Example |
|-------|------------|---------|
| `ERROR` | Unexpected failures requiring attention | DB connection lost, unhandled exception |
| `WARN` | Degraded but recoverable situations | Retry succeeded, fallback used, rate limit near |
| `INFO` | Business events and key operations | User login, order created, payment processed |
| `DEBUG` | Diagnostic detail for troubleshooting | Query params, cache hit/miss, function entry |

- Default production level: `INFO`
- Never use `console.log` in production — use the project's logger

## Correlation & Request Tracing
- Every HTTP request MUST have a `requestId` (UUID) propagated through all layers
- Accept `X-Request-ID` header from upstream; generate if absent
- Pass `requestId` to all downstream calls, DB queries, queue messages
- Log `requestId` in every log line for distributed trace correlation

## NEVER Log (PII & Secrets)
- Passwords, tokens, API keys, JWTs, session IDs
- Full credit card numbers, SSNs, bank accounts
- Email content, message bodies
- Health/medical data, biometric data
- Full request/response bodies containing user data
- Exception: last 4 chars of tokens/cards for debugging

## Always Log
- Authentication attempts (success + failure) with userId
- Authorization failures with resource + action
- Input validation failures (without the invalid data)
- External service calls (url, method, status, duration)
- Database query duration (slow query threshold: >500ms)
- Startup/shutdown events with config summary (no secrets)
