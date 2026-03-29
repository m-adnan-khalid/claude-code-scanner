---
name: incident-readiness
description: Incident response and disaster recovery readiness audit — validates DR plans, runbooks, backup/restore procedures, RTO/RPO targets, monitoring, alerting, and on-call setup.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--scope full|dr-plan|runbooks|monitoring|backup|on-call] [--generate]'
roles: [DevOps, TechLead, CTO, Architect]
agents: [@infra, @security, @gatekeeper]
---

# Incident Readiness Audit: $ARGUMENTS

## Phase 1: Disaster Recovery Plan

### DR Plan Existence Check
```bash
mkdir -p .claude/reports/incident-readiness

echo "=== Disaster Recovery Documentation ==="
# Check for DR/incident docs
for f in "DR-PLAN" "DISASTER-RECOVERY" "INCIDENT-RESPONSE" "RUNBOOK" "PLAYBOOK" "ON-CALL"; do
  find . -maxdepth 3 -iname "*${f}*" -not -path "*/node_modules/*" 2>/dev/null
done

# Check project docs
ls .claude/project/RUNBOOK.md 2>/dev/null && echo "OK: Runbook exists"
ls .claude/project/SECURITY_MODEL.md 2>/dev/null && echo "OK: Security model exists"
```

### DR Plan Checklist
- [ ] **RTO defined** (Recovery Time Objective — max acceptable downtime)
- [ ] **RPO defined** (Recovery Point Objective — max acceptable data loss)
- [ ] **Service tiers classified** (Tier 1: critical, Tier 2: important, Tier 3: nice-to-have)
- [ ] **Recovery procedures documented** for each service tier
- [ ] **Communication plan** (who to notify, escalation chain)
- [ ] **DR plan tested** within last 6 months
- [ ] **Post-mortem template** exists for incident review

### RTO/RPO Assessment
| Service | Current RTO | Target RTO | Current RPO | Target RPO | Gap |
|---------|-------------|-----------|-------------|-----------|-----|
| Database | ? | 1 hour | ? | 15 min | ? |
| App Server | ? | 15 min | ? | N/A | ? |
| Cache | ? | 5 min | ? | N/A | ? |
| File Storage | ? | 30 min | ? | 1 hour | ? |

## Phase 2: Runbook Completeness

### Check for Operational Runbooks
```bash
echo "=== Runbook Audit ==="
RUNBOOK=$(find . -maxdepth 3 -iname "*runbook*" -not -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -n "$RUNBOOK" ]; then
  echo "Runbook: $RUNBOOK ($(wc -l < $RUNBOOK) lines)"

  # Check for essential procedures
  for proc in "deploy" "rollback" "scale" "restart" "database" "backup" "restore" "debug" "monitor" "alert" "incident" "rotate" "secret"; do
    grep -qi "$proc" "$RUNBOOK" && echo "  OK: $proc procedure" || echo "  MISSING: $proc procedure"
  done
else
  echo "CRITICAL: No runbook found"
fi
```

### Required Runbook Procedures
- [ ] **Deployment** — How to deploy to staging and production
- [ ] **Rollback** — How to revert a bad deployment
- [ ] **Scaling** — How to scale up/down (horizontal/vertical)
- [ ] **Restart** — How to restart each service
- [ ] **Database recovery** — How to restore from backup
- [ ] **Secret rotation** — How to rotate API keys, tokens, passwords
- [ ] **Incident response** — Step-by-step for outages
- [ ] **Log access** — How to find and read logs
- [ ] **Monitoring** — Where to check system health
- [ ] **Alerting** — How alerts work, who gets paged
- [ ] **SSL/TLS renewal** — Certificate renewal process
- [ ] **Dependency outage** — What to do when a third-party service goes down

## Phase 3: Backup & Restore Validation

```bash
echo "=== Backup Configuration ==="

# Check for backup configs
grep -rn "backup\|snapshot\|dump\|pg_dump\|mongodump\|mysqldump" \
  . --include="*.{yml,yaml,json,tf,sh,toml}" \
  --exclude-dir=node_modules 2>/dev/null | head -10

# Check for automated backup schedules
grep -rn "schedule\|cron" . --include="*.{yml,yaml,json,tf}" \
  --exclude-dir=node_modules 2>/dev/null | grep -i "backup" | head -5

# Docker volume backup
grep -n "volumes:" docker-compose*.yml 2>/dev/null && echo "INFO: Docker volumes defined — check backup strategy"
```

### Backup Checklist
- [ ] **Database backups** automated (daily minimum)
- [ ] **File/media backups** automated
- [ ] **Backup retention** policy defined (7 days, 30 days, etc.)
- [ ] **Backup encryption** at rest
- [ ] **Backup stored off-site** (different region/cloud)
- [ ] **Restore tested** within last 30 days
- [ ] **Restore time** measured and within RTO
- [ ] **Point-in-time recovery** available (database WAL/binlog)

## Phase 4: Monitoring & Alerting

```bash
echo "=== Monitoring & Alerting ==="

# Check for monitoring tools
grep -rn "sentry\|datadog\|newrelic\|prometheus\|grafana\|pagerduty\|opsgenie\|betterstack\|uptime" \
  . --include="*.{ts,js,py,yml,yaml,json,toml}" \
  --exclude-dir=node_modules 2>/dev/null | head -10

# Check for health check endpoints
grep -rn "health\|readiness\|liveness\|status" \
  . --include="*.{ts,js,py,go,rb}" \
  --exclude-dir=node_modules 2>/dev/null | grep -i "route\|endpoint\|get\|app\." | head -5

# Check for error tracking
grep -rn "Sentry\|Bugsnag\|Rollbar\|TrackJS" \
  . --include="*.{ts,js,py}" \
  --exclude-dir=node_modules 2>/dev/null | head -3

# Check for uptime monitoring
grep -rn "healthcheck\|HEALTHCHECK\|health_check" \
  . --include="Dockerfile" --include="docker-compose*" 2>/dev/null
```

### Monitoring Checklist
- [ ] **Application errors** tracked (Sentry/Bugsnag/Rollbar)
- [ ] **Uptime monitoring** configured (external ping)
- [ ] **Health check endpoint** exists (/health or /healthz)
- [ ] **Database health** monitored (connection pool, slow queries)
- [ ] **Disk/memory/CPU** alerts configured
- [ ] **Response time** tracked (p50, p95, p99)
- [ ] **Error rate** alerts (threshold: > 1%)
- [ ] **Log aggregation** configured (ELK, CloudWatch, Datadog)
- [ ] **Distributed tracing** enabled (if microservices)

### Alerting Checklist
- [ ] **Alert channels** configured (Slack, PagerDuty, email)
- [ ] **Severity levels** defined (P0: page immediately, P1: within 1h, P2: next business day)
- [ ] **Escalation policy** defined (who gets paged first, when to escalate)
- [ ] **On-call rotation** scheduled
- [ ] **Alert fatigue** managed (no noisy/duplicate alerts)
- [ ] **Runbook links** in alert messages (click to see fix procedure)

## Phase 5: On-Call & Incident Process

### Incident Response Process
- [ ] **Incident declaration** — How to declare an incident (severity levels)
- [ ] **Communication** — Status page, internal Slack channel, stakeholder updates
- [ ] **Roles** — Incident commander, communications lead, technical lead
- [ ] **War room** — Where to coordinate (Slack channel, Zoom, etc.)
- [ ] **Resolution** — Fix → verify → communicate → close
- [ ] **Post-mortem** — Blameless review within 48 hours
- [ ] **Action items** — Track and assign follow-ups
- [ ] **Metrics tracked** — MTTD (detect), MTTR (resolve), MTBF (between failures)

## Report Template

```markdown
# Incident Readiness Report
Date: {ISO timestamp}
Scope: {full|dr-plan|runbooks|monitoring|backup|on-call}

## Readiness Score
| Area | Score | Status |
|------|-------|--------|
| DR Plan | N/10 | GREEN/YELLOW/RED |
| Runbooks | N/10 | GREEN/YELLOW/RED |
| Backup & Restore | N/10 | GREEN/YELLOW/RED |
| Monitoring & Alerting | N/10 | GREEN/YELLOW/RED |
| On-Call & Incident Process | N/10 | GREEN/YELLOW/RED |
| **Overall** | **N/50** | |

## RTO/RPO Status
| Service | RTO Target | RTO Actual | RPO Target | RPO Actual | Status |
|---------|-----------|-----------|-----------|-----------|--------|
| Database | 1h | ? | 15m | ? | UNKNOWN |
| App | 15m | ? | N/A | N/A | UNKNOWN |

## Missing Runbooks
| Procedure | Criticality | Impact |
|-----------|-------------|--------|
| {procedure} | HIGH | Cannot recover from {scenario} |

## Monitoring Gaps
| Check | Configured | Alerting | Gap |
|-------|-----------|----------|-----|
| Error tracking | YES/NO | YES/NO | {gap} |
| Uptime | YES/NO | YES/NO | {gap} |
| Performance | YES/NO | YES/NO | {gap} |

## Critical Findings
| # | Severity | Area | Finding | Remediation |
|---|----------|------|---------|-------------|
| 1 | CRITICAL | Backup | No automated database backups | Configure daily pg_dump + S3 |
| 2 | HIGH | Monitoring | No error tracking | Install Sentry |

## Evidence
- Runbook analysis: `.claude/reports/incident-readiness/runbook-audit.txt`
- Monitoring scan: `.claude/reports/incident-readiness/monitoring-scan.txt`

## Verdict
**READY** — Incident response infrastructure meets requirements.
OR
**NOT READY** — {N} critical gaps. See findings above.
```

Save to `.claude/reports/incident-readiness/report-{date}.md`

## Generate Missing Docs (--generate flag)
If `--generate` is passed, create skeleton documents:
- DR plan template → `.claude/project/DR-PLAN.md`
- Incident response template → `.claude/project/INCIDENT-RESPONSE.md`
- On-call guide → `.claude/project/ON-CALL-GUIDE.md`
- Post-mortem template → `.claude/project/POST-MORTEM-TEMPLATE.md`

## Definition of Done
- DR plan existence and completeness validated
- Runbook procedures audited for completeness
- Backup strategy and restore testing verified
- Monitoring and alerting coverage assessed
- Incident response process reviewed
- Report saved to `.claude/reports/incident-readiness/`
