# Observability Strategy

> Generated during pre-development planning

## Pillars

```
        /  Tracing  \           <- Distributed request tracing (OpenTelemetry)
       /--------------\
      /    Metrics      \       <- Application & infrastructure metrics (Prometheus)
     /--------------------\
    /      Logging          \   <- Structured logs with correlation IDs
   /________________________\
```

## Logging

| Setting | Value |
|---------|-------|
| Library | {pino/winston/structlog/zap/slog} |
| Format | JSON (production), human-readable (development) |
| Default Level | INFO (production), DEBUG (development) |
| Transport | stdout → {log aggregator} |
| Retention | {30 days hot, 90 days warm, 1 year cold} |

### Log Levels
| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Unexpected failures requiring attention | DB down, unhandled exception |
| WARN | Degraded but recoverable | Retry succeeded, rate limit near |
| INFO | Business events, key operations | User login, order created |
| DEBUG | Diagnostic details | Query params, cache hit/miss |

### Standard Fields
Every log line MUST include:
- `timestamp` (ISO 8601)
- `level` (error/warn/info/debug)
- `message` (human-readable description)
- `service` (service name)
- `requestId` (correlation ID from X-Request-ID header)
- `userId` (if authenticated, for audit trail)

### PII Rules
- NEVER log: passwords, tokens, API keys, JWTs, credit cards, SSNs
- REDACT: email (show domain only), phone (last 4), names (in debug only)
- Use logger's built-in redaction (pino `redact`, winston custom format)

## Metrics

| Setting | Value |
|---------|-------|
| Library | {prom-client/micrometer/prometheus-client} |
| Endpoint | /metrics |
| Scrape Interval | 15s |
| Dashboard | {Grafana/Datadog/CloudWatch} |

### Key Metrics
| Metric | Type | Labels |
|--------|------|--------|
| `http_request_duration_seconds` | Histogram | method, route, status |
| `http_requests_total` | Counter | method, route, status |
| `http_errors_total` | Counter | method, route, status |
| `db_query_duration_seconds` | Histogram | operation, table |
| `cache_hits_total` / `cache_misses_total` | Counter | cache_name |
| `queue_depth` | Gauge | queue_name |
| `active_connections` | Gauge | pool_name |

## Tracing

| Setting | Value |
|---------|-------|
| Library | {OpenTelemetry/@opentelemetry/sdk-node} |
| Exporter | {OTLP → Jaeger/Tempo/Datadog} |
| Sample Rate | {100% dev, 10% production} |
| Propagation | W3C Trace Context |

### Span Naming Convention
- HTTP: `{METHOD} {route}` (e.g., `GET /api/users/:id`)
- DB: `{operation} {table}` (e.g., `SELECT users`)
- Queue: `{operation} {queue}` (e.g., `PUBLISH orders`)
- Cache: `{operation} {cache}` (e.g., `GET user-cache`)

## Error Tracking

| Setting | Value |
|---------|-------|
| Tool | {Sentry/Bugsnag/Rollbar} |
| Environment | {production, staging} |
| Sample Rate | {100% errors, 10% transactions} |
| Source Maps | Uploaded on deploy |

## Health Checks

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health` | Full health with dependency checks | `{ status, checks: { db, cache, ... } }` |
| `GET /healthz` | Liveness probe (K8s) | `200 OK` |
| `GET /readyz` | Readiness probe (K8s) | `200` if ready, `503` if not |

## Alerting

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| Error rate spike | > 1% for 5 min | P1 | {PagerDuty/Slack} |
| Response time degradation | p95 > 2s for 10 min | P2 | {Slack} |
| Service down | Health check fails 3x | P0 | {PagerDuty} |
| Disk usage | > 85% | P2 | {Slack} |
| Memory usage | > 90% for 5 min | P1 | {PagerDuty/Slack} |

## Log Aggregation Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Collection | {Fluentd/Fluent Bit/Vector} | Ship logs from containers |
| Storage | {Elasticsearch/Loki/CloudWatch} | Index and store logs |
| Visualization | {Kibana/Grafana/CloudWatch} | Search, dashboards |
| Tracing | {Jaeger/Tempo/Datadog} | Distributed trace visualization |
| Metrics | {Prometheus/Datadog/CloudWatch} | Time-series metrics |
| Alerting | {PagerDuty/OpsGenie/Slack} | Incident notification |

## Commands
- `/setup-observability` — install and configure the full stack
- `/logging-audit` — audit current logging practices
- `/incident-readiness` — validate monitoring and alerting coverage
