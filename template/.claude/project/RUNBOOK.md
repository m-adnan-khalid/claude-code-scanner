# Operations Runbook

## Service Overview
{project-name} — {one-line description}
- **Production URL:** {url}
- **Staging URL:** {url}
- **Health check:** {endpoint}
- **Monitoring:** {dashboard-url}

## Common Operations

### Deploy
```bash
{deploy command}
```

### Rollback
```bash
{rollback command}
```

### Restart Services
```bash
{restart command}
```

### View Logs
```bash
{log command}
```

## Incident Response
1. **Detect**: alert fires or user reports issue
2. **Assess**: check health endpoint, error rates, logs
3. **Mitigate**: rollback if deploy-related, scale if load-related
4. **Communicate**: notify stakeholders
5. **Resolve**: fix root cause
6. **Review**: post-incident review, update runbook

## Common Issues & Debugging

### Service won't start
- Check: {common causes}
- Fix: {common solutions}

### Database connection errors
- Check: {connection string, credentials, network}
- Fix: {common solutions}

### High latency
- Check: {slow queries, resource usage, external deps}
- Fix: {common solutions}

## Escalation
- **L1**: On-call developer — restart, rollback, basic debugging
- **L2**: Tech lead — architecture issues, complex bugs
- **L3**: External — cloud provider, third-party services
