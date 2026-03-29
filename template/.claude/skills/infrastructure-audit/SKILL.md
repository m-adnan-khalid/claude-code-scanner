---
name: infrastructure-audit
description: Infrastructure security and compliance audit — SOC 2 controls, cloud security posture, IaC scanning (Terraform/CloudFormation), container security, network policies, and secrets management.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--framework soc2|iso27001|cis|all] [--scope full|iac|containers|network|secrets] [--cloud aws|azure|gcp]'
roles: [CTO, TechLead, Architect, DevOps]
agents: [@infra, @security, @gatekeeper]
---

# Infrastructure Security & Compliance Audit: $ARGUMENTS

## Auto-Detection
```bash
mkdir -p .claude/reports/infrastructure

# Detect IaC
ls *.tf 2>/dev/null && echo "IAC: terraform"
ls template.yaml sam-template.yaml 2>/dev/null && echo "IAC: cloudformation/sam"
ls Pulumi.yaml 2>/dev/null && echo "IAC: pulumi"
ls cdk.json 2>/dev/null && echo "IAC: aws-cdk"
ls ansible.cfg 2>/dev/null && echo "IAC: ansible"

# Detect containers
ls Dockerfile 2>/dev/null && echo "CONTAINER: docker"
ls docker-compose*.yml 2>/dev/null && echo "CONTAINER: compose"
ls k8s/ kustomization.yaml Chart.yaml 2>/dev/null && echo "CONTAINER: kubernetes"

# Detect CI/CD
ls .github/workflows/*.yml 2>/dev/null && echo "CICD: github-actions"
ls .gitlab-ci.yml 2>/dev/null && echo "CICD: gitlab"
ls Jenkinsfile 2>/dev/null && echo "CICD: jenkins"

# Detect cloud config
ls serverless.yml 2>/dev/null && echo "CLOUD: serverless"
ls fly.toml vercel.json netlify.toml render.yaml 2>/dev/null
```

## Phase 1: IaC Security Scanning

### Terraform
```bash
# tfsec — static analysis for Terraform
npx @aquasecurity/tfsec . \
  --format json \
  --out .claude/reports/infrastructure/tfsec-results.json \
  2>&1 | tee .claude/reports/infrastructure/tfsec-output.txt

# checkov — policy-as-code scanner
checkov -d . \
  --output json \
  --output-file-path .claude/reports/infrastructure/ \
  2>&1 | tee .claude/reports/infrastructure/checkov-output.txt

# Manual checks if tools not available
echo "=== Terraform Security Review ==="
grep -rn "0.0.0.0/0" *.tf 2>/dev/null && echo "WARN: Open CIDR block found"
grep -rn "publicly_accessible.*true" *.tf 2>/dev/null && echo "WARN: Publicly accessible resource"
grep -rn "encrypted.*false" *.tf 2>/dev/null && echo "WARN: Unencrypted resource"
grep -rn "password\|secret\|key" *.tf 2>/dev/null | grep -v "variable\|data\|#" && echo "WARN: Possible hardcoded secret"
```

### Docker Security
```bash
# Dockerfile lint
npx dockerlint Dockerfile 2>/dev/null || \
  npx hadolint Dockerfile 2>/dev/null || \
  echo "Install hadolint for Dockerfile analysis"

# Manual Dockerfile checks
echo "=== Dockerfile Security Review ==="
grep -n "FROM.*:latest" Dockerfile 2>/dev/null && echo "WARN: Using :latest tag (pin versions)"
grep -n "USER root" Dockerfile 2>/dev/null && echo "WARN: Running as root"
grep -n "ADD " Dockerfile 2>/dev/null && echo "WARN: Use COPY instead of ADD"
grep -n "ENV.*PASSWORD\|ENV.*SECRET\|ENV.*KEY" Dockerfile 2>/dev/null && echo "CRITICAL: Secret in ENV"
! grep -q "USER " Dockerfile 2>/dev/null && echo "WARN: No non-root USER directive"
! grep -q "HEALTHCHECK" Dockerfile 2>/dev/null && echo "WARN: No HEALTHCHECK"
```

### Kubernetes Security
```bash
echo "=== Kubernetes Security Review ==="
# Check for security issues in K8s manifests
grep -rn "privileged: true" k8s/ 2>/dev/null && echo "CRITICAL: Privileged container"
grep -rn "hostNetwork: true" k8s/ 2>/dev/null && echo "WARN: Host network access"
grep -rn "hostPID: true" k8s/ 2>/dev/null && echo "WARN: Host PID access"
grep -rn "readOnlyRootFilesystem: false" k8s/ 2>/dev/null && echo "WARN: Writable root filesystem"
grep -rn "runAsUser: 0" k8s/ 2>/dev/null && echo "CRITICAL: Running as root"
! grep -rq "resources:" k8s/ 2>/dev/null && echo "WARN: No resource limits defined"
! grep -rq "securityContext:" k8s/ 2>/dev/null && echo "WARN: No security context"
! grep -rq "networkPolicy" k8s/ 2>/dev/null && echo "WARN: No network policies"
```

## Phase 2: SOC 2 Controls Checklist

### CC6 — Logical and Physical Access Controls
- [ ] Unique user accounts (no shared credentials)
- [ ] MFA enabled for infrastructure access (cloud console, SSH, CI/CD)
- [ ] Least privilege principle (IAM roles scoped minimally)
- [ ] Access reviews conducted periodically
- [ ] Service accounts use short-lived credentials
- [ ] SSH key rotation policy
- [ ] VPN or private network for internal services

### CC7 — System Operations
- [ ] Monitoring and alerting configured (uptime, errors, security events)
- [ ] Incident response plan documented
- [ ] Change management process (PR reviews, approval gates)
- [ ] Automated deployments (no manual production changes)
- [ ] Rollback procedures tested
- [ ] Disaster recovery plan documented and tested

### CC8 — Change Management
- [ ] All changes go through version control
- [ ] Code review required before merge
- [ ] CI/CD pipeline runs tests before deployment
- [ ] Staging environment mirrors production
- [ ] Database migrations reviewed and reversible
- [ ] Feature flags for gradual rollouts

### CC9 — Risk Mitigation
- [ ] Dependency vulnerability scanning in CI
- [ ] Container image scanning
- [ ] Secrets scanning (prevent commits with secrets)
- [ ] Rate limiting on all public endpoints
- [ ] DDoS protection configured
- [ ] WAF (Web Application Firewall) configured

## Phase 3: Secrets Management Audit

```bash
echo "=== Secrets Management Audit ==="

# Scan for hardcoded secrets
grep -rn --include="*.{ts,js,py,java,go,yml,yaml,json,tf,env}" \
  -iE "(password|secret|api.?key|token|private.?key)\s*[:=]\s*['\"][^'\"]{8,}" \
  . --exclude-dir=node_modules --exclude-dir=.git \
  2>/dev/null | head -20

# Check .env files
ls .env .env.* 2>/dev/null && echo "FOUND: .env files"
grep -q ".env" .gitignore 2>/dev/null && echo "OK: .env in .gitignore" || echo "CRITICAL: .env NOT in .gitignore"

# Check for secrets in git history
git log --all --diff-filter=A -- '.env*' '*.pem' '*.key' 2>/dev/null | head -10

# Check secret management tool
grep -rn "vault\|aws.?secretsmanager\|aws.?ssm\|google.?secret" . \
  --include="*.{ts,js,py,yaml,yml,tf}" 2>/dev/null | head -5 && \
  echo "OK: Secret manager detected" || echo "WARN: No secret manager integration found"
```

## Phase 4: Network & Encryption

```bash
echo "=== Network & Encryption Audit ==="

# TLS configuration
grep -rn "https\|ssl\|tls\|certificate" . \
  --include="*.{yaml,yml,json,tf,conf,nginx}" 2>/dev/null | head -10

# CORS configuration
grep -rn "cors\|Access-Control-Allow" . \
  --include="*.{ts,js,py,java,go}" 2>/dev/null | head -10

# Security headers
grep -rn "helmet\|X-Frame-Options\|X-Content-Type\|Strict-Transport\|Content-Security-Policy" . \
  --include="*.{ts,js,py,java,go}" 2>/dev/null | head -10
```

## Report Template

```markdown
# Infrastructure Security & Compliance Report
Date: {ISO timestamp}
Framework: {SOC 2|ISO 27001|CIS Benchmark}
Scope: {IaC, Containers, Network, Secrets, Cloud}

## Summary
| Area | Score | Critical | High | Medium | Low |
|------|-------|----------|------|--------|-----|
| IaC Security | N/10 | N | N | N | N |
| Container Security | N/10 | N | N | N | N |
| Secrets Management | N/10 | N | N | N | N |
| Network Security | N/10 | N | N | N | N |
| Access Controls | N/10 | N | N | N | N |
| **Overall** | **N/50** | | | | |

## SOC 2 Controls Status
| Control | Status | Evidence |
|---------|--------|----------|
| CC6.1 Logical Access | PASS/FAIL | {details} |
| CC6.6 System Boundaries | PASS/FAIL | {details} |
| CC7.2 Monitoring | PASS/FAIL | {details} |
| CC8.1 Change Management | PASS/FAIL | {details} |

## Critical Findings
| # | Severity | Area | Finding | File | Remediation |
|---|----------|------|---------|------|-------------|
| 1 | CRITICAL | Secrets | API key in source code | config.ts:12 | Move to secret manager |
| 2 | HIGH | Docker | Running as root | Dockerfile:1 | Add USER directive |

## Evidence
- IaC scan: `.claude/reports/infrastructure/tfsec-results.json`
- Container scan: `.claude/reports/infrastructure/docker-lint.txt`
- Secrets scan: `.claude/reports/infrastructure/secrets-scan.txt`

## Verdict
**COMPLIANT** — All critical controls pass.
OR
**NON-COMPLIANT** — {N} critical findings. See above.
```

Save to `.claude/reports/infrastructure/report-{date}.md`

## Definition of Done
- IaC security scanned (Terraform/Docker/K8s)
- SOC 2 controls checklist evaluated
- Secrets management audited
- Network and encryption reviewed
- Report saved to `.claude/reports/infrastructure/`
