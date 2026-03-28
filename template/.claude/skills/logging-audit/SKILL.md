---
name: logging-audit
description: Audit logging practices — structured logging compliance, PII leak detection, log level usage, correlation ID coverage, missing log points, and observability gap analysis.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--scope full|pii|levels|correlation|coverage|observability] [--fix]'
---

# Logging Audit: $ARGUMENTS

## Phase 1: Logging Library Detection

```bash
mkdir -p .claude/reports/logging

echo "=== Logging Library Detection ==="

# Node.js
grep -q '"pino"' package.json 2>/dev/null && echo "LOGGER: pino (structured, fast)"
grep -q '"winston"' package.json 2>/dev/null && echo "LOGGER: winston"
grep -q '"bunyan"' package.json 2>/dev/null && echo "LOGGER: bunyan"
grep -q '"morgan"' package.json 2>/dev/null && echo "HTTP_LOGGER: morgan"
grep -q '"pino-http"' package.json 2>/dev/null && echo "HTTP_LOGGER: pino-http"

# Python
grep -rq "structlog\|loguru" requirements.txt pyproject.toml 2>/dev/null && echo "LOGGER: structlog/loguru"
grep -rq "^import logging\|from logging" --include="*.py" . 2>/dev/null && echo "LOGGER: stdlib logging"

# Go
grep -q "go.uber.org/zap" go.mod 2>/dev/null && echo "LOGGER: zap"
grep -q "zerolog" go.mod 2>/dev/null && echo "LOGGER: zerolog"
grep -q "log/slog" go.mod 2>/dev/null && echo "LOGGER: slog (stdlib)"

# Java
grep -rq "log4j\|logback\|slf4j" pom.xml build.gradle 2>/dev/null && echo "LOGGER: log4j/logback/slf4j"

# Error tracking
grep -q "@sentry" package.json 2>/dev/null && echo "ERRORS: sentry"
grep -rq "sentry.sdk\|sentry-sdk" requirements.txt pyproject.toml 2>/dev/null && echo "ERRORS: sentry"

# Observability
grep -q "@opentelemetry" package.json 2>/dev/null && echo "TRACING: opentelemetry"
grep -q "prom-client" package.json 2>/dev/null && echo "METRICS: prometheus"
grep -q "dd-trace" package.json 2>/dev/null && echo "APM: datadog"
```

## Phase 2: PII Leak Detection

```bash
echo "=== PII in Logs Scan ==="

# Find log statements that may contain PII
grep -rn --include="*.{ts,js,py,go,java,rb}" \
  -iE "(console\.log|logger\.(info|debug|warn|error)|log\.(info|debug|warn|error)|print\(|println|slog\.(Info|Debug|Warn|Error))" \
  . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | \
  grep -iE "(password|token|secret|key|auth|credit|ssn|email|phone|address|cookie|session)" \
  > .claude/reports/logging/pii-in-logs.txt 2>/dev/null

PII_COUNT=$(wc -l < .claude/reports/logging/pii-in-logs.txt 2>/dev/null || echo 0)
echo "Potential PII in logs: $PII_COUNT occurrences"

if [ "$PII_COUNT" -gt 0 ]; then
  echo ""
  echo "Top PII leak risks:"
  head -20 .claude/reports/logging/pii-in-logs.txt
fi

# Check for PII redaction
echo ""
echo "=== PII Redaction Mechanisms ==="
grep -rn --include="*.{ts,js,py,go}" \
  -iE "(redact|mask|sanitize|scrub|censor|\[REDACTED\])" \
  . --exclude-dir=node_modules 2>/dev/null | head -10
REDACT_COUNT=$(grep -rc "redact\|mask\|sanitize\|scrub" --include="*.{ts,js,py,go}" . --exclude-dir=node_modules 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
echo "Redaction mechanisms found: ${REDACT_COUNT:-0}"
```

## Phase 3: Log Level Usage Analysis

```bash
echo "=== Log Level Distribution ==="

# Count log statements by level
for level in "error\|ERROR" "warn\|WARN\|warning\|WARNING" "info\|INFO" "debug\|DEBUG" "trace\|TRACE\|verbose\|VERBOSE"; do
  COUNT=$(grep -rc "$level" --include="*.{ts,js,py,go,java,rb}" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
  LABEL=$(echo "$level" | cut -d'|' -f1 | tr '[:lower:]' '[:upper:]')
  echo "  $LABEL: ${COUNT:-0}"
done

# Check for console.log in production code (bad practice)
echo ""
echo "=== console.log Usage (should be replaced with logger) ==="
CONSOLE_COUNT=$(grep -rc "console\.\(log\|warn\|error\|debug\|info\)" --include="*.{ts,js,tsx,jsx}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test --exclude-dir=__test__ 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
echo "console.* in production code: ${CONSOLE_COUNT:-0}"

if [ "${CONSOLE_COUNT:-0}" -gt 0 ]; then
  grep -rn "console\.\(log\|warn\|error\)" --include="*.{ts,js,tsx,jsx}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test 2>/dev/null | head -15
fi

# Check for print() in Python production code
PRINT_COUNT=$(grep -rc "^[^#]*\bprint(" --include="*.py" . --exclude-dir=venv --exclude-dir=.git --exclude-dir=test 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
echo "print() in Python production code: ${PRINT_COUNT:-0}"
```

## Phase 4: Correlation ID / Request Tracing

```bash
echo "=== Correlation ID Coverage ==="

# Check for request ID middleware
grep -rn --include="*.{ts,js,py,go,java}" \
  -iE "(request.?id|correlation.?id|trace.?id|x-request-id|X-Request-ID)" \
  . --exclude-dir=node_modules 2>/dev/null | head -10

REQUEST_ID=$(grep -rc "request.?id\|correlation.?id\|X-Request-ID" --include="*.{ts,js,py,go}" . --exclude-dir=node_modules 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
echo "Request/Correlation ID references: ${REQUEST_ID:-0}"

# Check if request ID is in middleware
echo ""
grep -rn --include="*.{ts,js,py,go}" \
  -iE "(middleware|RequestID|requestId|request_id)" \
  . --exclude-dir=node_modules 2>/dev/null | grep -i "log\|trace\|header" | head -5

# Check async context propagation
grep -rn --include="*.{ts,js}" "AsyncLocalStorage\|continuation-local\|cls-hooked" . --exclude-dir=node_modules 2>/dev/null | head -3
grep -rn --include="*.py" "contextvars\|ContextVar" . --exclude-dir=venv 2>/dev/null | head -3
```

## Phase 5: Structured Logging Compliance

```bash
echo "=== Structured Logging Check ==="

# Check if logs output JSON
grep -rn --include="*.{ts,js}" "JSON\|json\|format.*json\|JSONRenderer\|json_format" . --exclude-dir=node_modules 2>/dev/null | grep -i "log\|pino\|winston\|bunyan" | head -5

# Check for consistent log fields
echo ""
echo "Standard fields usage:"
for field in "timestamp\|time" "level\|severity" "message\|msg" "service" "requestId\|request_id\|traceId\|trace_id"; do
  COUNT=$(grep -rc "$field" --include="*.{ts,js,py,go}" . --exclude-dir=node_modules 2>/dev/null | awk -F: '{sum+=$2} END{print sum}')
  LABEL=$(echo "$field" | cut -d'|' -f1)
  echo "  $LABEL: ${COUNT:-0} references"
done
```

## Phase 6: Observability Coverage

```bash
echo "=== Health Check Endpoints ==="
grep -rn --include="*.{ts,js,py,go,rb}" \
  -iE "(health|healthz|readyz|readiness|liveness|/status)" \
  . --exclude-dir=node_modules 2>/dev/null | grep -i "route\|get\|endpoint\|app\.\|router\." | head -5

echo ""
echo "=== Metrics Endpoint ==="
grep -rn --include="*.{ts,js,py,go}" \
  -iE "(/metrics|prometheus|prom.client|Histogram|Counter|Gauge)" \
  . --exclude-dir=node_modules 2>/dev/null | head -5

echo ""
echo "=== Error Tracking ==="
grep -rn --include="*.{ts,js,py,go}" \
  -iE "(Sentry|Bugsnag|Rollbar|TrackJS|captureException|captureMessage)" \
  . --exclude-dir=node_modules 2>/dev/null | head -5

echo ""
echo "=== Distributed Tracing ==="
grep -rn --include="*.{ts,js,py,go}" \
  -iE "(opentelemetry|otel|tracer|span|trace\.get|Jaeger|Zipkin)" \
  . --exclude-dir=node_modules 2>/dev/null | head -5
```

## Phase 7: Missing Log Points Detection

Check critical operations that SHOULD have logging but don't:

```bash
echo "=== Missing Log Points ==="

# Auth operations without logging
echo "Auth without logging:"
grep -rn --include="*.{ts,js,py,go}" -iE "(login|authenticate|authorize|signIn|sign_in)" . --exclude-dir=node_modules 2>/dev/null | \
  while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    NEARBY=$(sed -n "$((LINE_NUM-3)),$((LINE_NUM+5))p" "$FILE" 2>/dev/null)
    echo "$NEARBY" | grep -qi "log\|logger" || echo "  MISSING LOG: $FILE:$LINE_NUM"
  done 2>/dev/null | head -10

# Error handlers without logging
echo ""
echo "Error handlers without logging:"
grep -rn --include="*.{ts,js}" "catch\s*(" . --exclude-dir=node_modules 2>/dev/null | \
  while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    NEARBY=$(sed -n "$((LINE_NUM)),$((LINE_NUM+3))p" "$FILE" 2>/dev/null)
    echo "$NEARBY" | grep -qi "log\|logger\|console\|sentry\|throw" || echo "  SILENT CATCH: $FILE:$LINE_NUM"
  done 2>/dev/null | head -10
```

## Report Template

```markdown
# Logging Audit Report
Date: {ISO timestamp}
Logger: {pino|winston|structlog|zap|none}
Error Tracking: {Sentry|Bugsnag|none}
Tracing: {OpenTelemetry|Datadog|none}

## Summary
| Area | Score | Status |
|------|-------|--------|
| Logging Library | N/10 | {structured logger installed?} |
| PII Protection | N/10 | {redaction configured? PII leaks found?} |
| Log Levels | N/10 | {proper distribution? console.log removed?} |
| Correlation IDs | N/10 | {request ID middleware? propagation?} |
| Structured Format | N/10 | {JSON in production? consistent fields?} |
| Observability | N/10 | {health check? metrics? errors? tracing?} |
| **Overall** | **N/60** | |

## PII Leak Risk
| # | File:Line | Log Statement | PII Type | Risk |
|---|-----------|--------------|----------|------|
| 1 | {file}:{line} | logger.info(user) | Email, name | HIGH |

## Log Level Distribution
| Level | Count | % | Expected Range |
|-------|-------|---|---------------|
| ERROR | N | N% | 5-15% |
| WARN | N | N% | 10-20% |
| INFO | N | N% | 40-60% |
| DEBUG | N | N% | 20-40% |

## console.log / print() Usage
| File | Count | Action |
|------|-------|--------|
| {file} | N | Replace with logger |

## Observability Gaps
| Component | Status | Action |
|-----------|--------|--------|
| Structured Logger | YES/NO | Install pino/winston/structlog |
| Request ID Middleware | YES/NO | Add X-Request-ID propagation |
| Health Endpoint | YES/NO | Add /health endpoint |
| Metrics Endpoint | YES/NO | Add /metrics with prom-client |
| Error Tracking | YES/NO | Install Sentry |
| Distributed Tracing | YES/NO | Install OpenTelemetry |
| PII Redaction | YES/NO | Configure redact rules |

## Missing Log Points
| Location | Operation | Risk |
|----------|-----------|------|
| {file}:{line} | Auth without logging | HIGH |
| {file}:{line} | Silent catch block | MEDIUM |

## Evidence
- PII scan: `.claude/reports/logging/pii-in-logs.txt`
- Level analysis: `.claude/reports/logging/level-distribution.txt`

## Verdict
**PASS** — Structured logging with PII protection and observability.
OR
**FAIL** — {N} critical gaps. See recommendations above.

## Next Steps
- `/setup-observability` to install missing components
```

Save to `.claude/reports/logging/report-{date}.md`

## Definition of Done
- Logging library identified and evaluated
- PII leak scan completed
- Log level distribution analyzed
- Correlation ID coverage assessed
- Structured logging compliance checked
- Observability components inventoried
- Missing log points flagged
- Report saved to `.claude/reports/logging/`
