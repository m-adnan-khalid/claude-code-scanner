---
name: setup-observability
description: Set up full observability stack — structured logging, distributed tracing (OpenTelemetry), metrics, error tracking (Sentry), APM, health checks, and dashboards. Auto-detects tech stack and installs matching tools.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--stack elt|datadog|grafana|aws] [--scope full|logging|tracing|metrics|errors|health] [--library pino|winston|structlog|zap]'
roles: [DevOps, TechLead, BackendDev, FullStackDev]
agents: [@infra, @observability-engineer, @api-builder]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. Re-read task/output files before each step — never rely on in-memory state alone.
4. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# Observability Setup: $ARGUMENTS

## Auto-Detection
```bash
# Detect language/framework
[ -f package.json ] && echo "LANG: node/ts"
[ -f pyproject.toml ] || [ -f requirements.txt ] && echo "LANG: python"
[ -f go.mod ] && echo "LANG: go"
[ -f pom.xml ] || [ -f build.gradle ] && echo "LANG: java"

# Detect existing observability
grep -q "@sentry" package.json 2>/dev/null && echo "ERRORS: sentry"
grep -q "pino\|winston\|bunyan" package.json 2>/dev/null && echo "LOGGING: node-logger"
grep -q "@opentelemetry" package.json 2>/dev/null && echo "TRACING: opentelemetry"
grep -q "dd-trace" package.json 2>/dev/null && echo "APM: datadog"
grep -q "newrelic" package.json 2>/dev/null && echo "APM: newrelic"
grep -q "prom-client" package.json 2>/dev/null && echo "METRICS: prometheus"
grep -rq "structlog\|loguru" requirements.txt pyproject.toml 2>/dev/null && echo "LOGGING: python-logger"
grep -q "go.uber.org/zap\|zerolog\|log/slog" go.mod 2>/dev/null && echo "LOGGING: go-logger"
```

## 1. Structured Logging Setup

### Node.js/TypeScript — pino (recommended)
```bash
npm install pino pino-http pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME || '{service-name}',
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password',
            'body.token', 'body.secret', 'body.creditCard', '*.ssn'],
    censor: '[REDACTED]',
  },
});

// Express/Fastify middleware
import pinoHttp from 'pino-http';
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
```

### Node.js — winston (alternative)
```bash
npm install winston
```

```typescript
// src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  ),
  defaultMeta: { service: '{service-name}' },
  transports: [new winston.transports.Console()],
});
```

### Python — structlog (recommended)
```bash
pip install structlog
```

```python
# app/logging_config.py
import structlog
import logging

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer() if os.environ.get("ENV") == "production"
        else structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.getLevelName(os.environ.get("LOG_LEVEL", "INFO"))
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(service="{service-name}")

# Request ID middleware (FastAPI)
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response
```

### Go — slog (stdlib, Go 1.21+)
```go
// pkg/logger/logger.go
package logger

import (
	"log/slog"
	"os"
)

func New(service string) *slog.Logger {
	var handler slog.Handler
	if os.Getenv("ENV") == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}
	return slog.New(handler).With("service", service)
}

// Middleware for request ID
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = uuid.NewString()
		}
		ctx := context.WithValue(r.Context(), "requestId", requestID)
		w.Header().Set("X-Request-ID", requestID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
```

## 2. Distributed Tracing — OpenTelemetry

### Node.js
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http
```

```typescript
// src/instrumentation.ts (load BEFORE app code)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME || '{service-name}',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown());
```

### Python
```bash
pip install opentelemetry-sdk opentelemetry-instrumentation opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install  # auto-install instrumentations
```

```python
# app/tracing.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

resource = Resource.create({"service.name": "{service-name}"})
provider = TracerProvider(resource=resource)
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)
```

## 3. Error Tracking — Sentry

### Node.js
```bash
npm install @sentry/node
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Scrub PII
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### Python
```bash
pip install sentry-sdk
```

```python
import sentry_sdk
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    environment=os.environ.get("ENV", "development"),
    traces_sample_rate=0.1,
    before_send=lambda event, hint: scrub_pii(event),
)
```

## 4. Metrics — Prometheus

### Node.js
```bash
npm install prom-client
```

```typescript
// src/lib/metrics.ts
import { Registry, collectDefaultMetrics, Histogram, Counter } from 'prom-client';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry],
});

export const httpErrors = new Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors',
  labelNames: ['method', 'route', 'status'],
  registers: [registry],
});

// GET /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
```

## 5. Health Check Endpoint

```typescript
// src/routes/health.ts
app.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      cache: await checkCache(),
      // Add more dependency checks
    },
  };
  const allHealthy = Object.values(checks.checks).every(c => c.status === 'ok');
  res.status(allHealthy ? 200 : 503).json(checks);
});

// Kubernetes probes
app.get('/healthz', (req, res) => res.status(200).send('ok'));           // liveness
app.get('/readyz', async (req, res) => {                                  // readiness
  const dbOk = await checkDatabase();
  res.status(dbOk ? 200 : 503).send(dbOk ? 'ready' : 'not ready');
});
```

## 6. Log Aggregation Stack (Docker Compose)

### ELK Stack (Elasticsearch + Logstash + Kibana)
```yaml
# docker-compose.observability.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports: ["9200:9200"]
    volumes: ["es-data:/usr/share/elasticsearch/data"]

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    ports: ["5601:5601"]
    depends_on: [elasticsearch]

  # App logs → stdout → Docker log driver → Logstash → Elasticsearch
  logstash:
    image: docker.elastic.co/logstash/logstash:8.12.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on: [elasticsearch]

volumes:
  es-data:
```

### Grafana + Loki + Tempo (Lightweight Alternative)
```yaml
# docker-compose.observability.yml
services:
  grafana:
    image: grafana/grafana:latest
    ports: ["3001:3000"]
    volumes: ["grafana-data:/var/lib/grafana"]

  loki:
    image: grafana/loki:latest
    ports: ["3100:3100"]

  tempo:
    image: grafana/tempo:latest
    ports: ["3200:3200", "4317:4317", "4318:4318"]

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports: ["4317:4317", "4318:4318"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml

volumes:
  grafana-data:
```

## Verification
After setup, verify:
```bash
# Check health endpoint
curl -s http://localhost:{port}/health | python3 -m json.tool

# Check metrics endpoint
curl -s http://localhost:{port}/metrics | head -20

# Check logs are structured JSON
{start-command} 2>&1 | head -5 | python3 -m json.tool

# Check request ID propagation
curl -v http://localhost:{port}/api/v1/test 2>&1 | grep -i "x-request-id"
```

## Definition of Done
- Structured JSON logging configured with PII redaction
- Request ID middleware installed and propagating
- Health check endpoint responding at /health
- Error tracking configured (Sentry or equivalent)
- Metrics endpoint at /metrics (if Prometheus)
- OpenTelemetry tracing initialized (if distributed)
- All verified with real requests

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Output:** [file path if any]
- **Next Step:** [recommended next action]

### Update TODO
If this work was linked to a TODO item, mark it done. If follow-up needed, add new TODO.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Context Recovery
If context is lost (compaction, pause, resume):
1. Find most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read `## Session Context` → restore state
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
