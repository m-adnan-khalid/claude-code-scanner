---
name: cicd-audit
description: CI/CD pipeline security and quality audit — secrets exposure, deployment gates, environment parity, pipeline hardening, and supply chain security.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--platform github|gitlab|jenkins|circleci|all] [--scope full|secrets|gates|supply-chain] [--fix]'
---

# CI/CD Pipeline Audit: $ARGUMENTS

## Auto-Detection
```bash
mkdir -p .claude/reports/cicd

# Detect CI/CD platform
ls .github/workflows/*.yml 2>/dev/null && echo "PLATFORM: github-actions"
ls .gitlab-ci.yml 2>/dev/null && echo "PLATFORM: gitlab-ci"
ls Jenkinsfile 2>/dev/null && echo "PLATFORM: jenkins"
ls .circleci/config.yml 2>/dev/null && echo "PLATFORM: circleci"
ls azure-pipelines.yml 2>/dev/null && echo "PLATFORM: azure-devops"
ls bitbucket-pipelines.yml 2>/dev/null && echo "PLATFORM: bitbucket"
ls .travis.yml 2>/dev/null && echo "PLATFORM: travis-ci"

# Count workflow files
echo "Workflow files: $(ls .github/workflows/*.yml .gitlab-ci.yml Jenkinsfile .circleci/config.yml 2>/dev/null | wc -l)"
```

## Phase 1: Secrets Security

```bash
echo "=== CI/CD Secrets Audit ==="

# Scan for hardcoded secrets in pipeline configs
for f in $(ls .github/workflows/*.yml .gitlab-ci.yml Jenkinsfile .circleci/config.yml azure-pipelines.yml 2>/dev/null); do
  echo "--- $f ---"
  # Direct secret values (not references)
  grep -n -iE "(password|secret|token|key|api_key)\s*[:=]\s*['\"][^$\{]" "$f" 2>/dev/null && echo "  CRITICAL: Hardcoded secret found"

  # Check proper secret references
  grep -c "secrets\.\|VAULT\|SSM\|Secret" "$f" 2>/dev/null | xargs echo "  Secret references:"
done

# Check for secrets in environment files tracked by git
git ls-files | grep -iE "\.env|secret|credential|\.key|\.pem" 2>/dev/null && echo "CRITICAL: Secret files tracked in git"

# Check .gitignore covers secrets
for pattern in ".env" "*.pem" "*.key" "credentials" "secrets"; do
  grep -q "$pattern" .gitignore 2>/dev/null && echo "OK: $pattern in .gitignore" || echo "WARN: $pattern not in .gitignore"
done
```

## Phase 2: Pipeline Security Hardening

### GitHub Actions Specific
```bash
echo "=== GitHub Actions Security ==="
for wf in .github/workflows/*.yml; do
  [ -f "$wf" ] || continue
  echo "--- $(basename $wf) ---"

  # Pin actions to SHA (not tags)
  grep -n "uses:" "$wf" | grep -v "@[a-f0-9]\{40\}" | grep -v "\./" && echo "  WARN: Actions not pinned to SHA"

  # Check permissions
  grep -q "permissions:" "$wf" && echo "  OK: Permissions defined" || echo "  WARN: No permissions block (defaults to read-write-all)"

  # Check for dangerous triggers
  grep -q "pull_request_target" "$wf" && echo "  WARN: pull_request_target can be exploited"
  grep -q "workflow_dispatch" "$wf" && echo "  INFO: Manual trigger enabled"

  # Check for script injection
  grep -n "github.event\.\(issue\|pull_request\|comment\)\.body\|github.event\..*\.title" "$wf" && echo "  WARN: Possible script injection via event context"

  # Check for GITHUB_TOKEN permissions
  grep -q "GITHUB_TOKEN" "$wf" && echo "  INFO: Uses GITHUB_TOKEN"

  # Check third-party actions
  grep "uses:" "$wf" | grep -v "actions/\|github/" | grep -v "\./" && echo "  REVIEW: Third-party actions used"
done
```

### General Pipeline Checks
```bash
echo "=== Pipeline Quality Gates ==="
for f in $(ls .github/workflows/*.yml .gitlab-ci.yml 2>/dev/null); do
  echo "--- $(basename $f) ---"

  # Check for required quality gates
  grep -qi "test\|jest\|pytest\|vitest\|mocha" "$f" && echo "  OK: Tests in pipeline" || echo "  WARN: No test step"
  grep -qi "lint\|eslint\|pylint\|flake8\|clippy" "$f" && echo "  OK: Linting in pipeline" || echo "  WARN: No lint step"
  grep -qi "type.*check\|tsc\|mypy\|pyright" "$f" && echo "  OK: Type checking in pipeline" || echo "  OPTIONAL: No type check step"
  grep -qi "audit\|snyk\|trivy\|grype\|dependabot" "$f" && echo "  OK: Security scan in pipeline" || echo "  WARN: No security scan step"
  grep -qi "coverage" "$f" && echo "  OK: Coverage in pipeline" || echo "  WARN: No coverage step"

  # Check for deployment approval gates
  grep -qi "environment\|approval\|review\|manual" "$f" && echo "  OK: Deployment gates" || echo "  WARN: No deployment approval gate"
done
```

## Phase 3: Supply Chain Security

```bash
echo "=== Supply Chain Security ==="

# Check for lock files (reproducible builds)
[ -f package-lock.json ] || [ -f yarn.lock ] || [ -f pnpm-lock.yaml ] && echo "OK: JS lock file exists" || echo "CRITICAL: No JS lock file"
[ -f poetry.lock ] || [ -f Pipfile.lock ] || [ -f requirements.txt ] && echo "OK: Python lock exists" || echo "WARN: No Python lock file"
[ -f go.sum ] && echo "OK: Go sum file exists"
[ -f Cargo.lock ] && echo "OK: Cargo lock file exists"

# Check for Dependabot/Renovate
[ -f .github/dependabot.yml ] && echo "OK: Dependabot configured" || echo "WARN: No Dependabot"
ls renovate.json .renovaterc* 2>/dev/null && echo "OK: Renovate configured"

# Check npm scripts for suspicious commands
grep -E '"(pre|post)(install|build|test|publish)"' package.json 2>/dev/null && echo "REVIEW: Lifecycle scripts found — check for malicious commands"

# Check for .npmrc publish config
grep -q "registry" .npmrc 2>/dev/null && echo "INFO: Custom registry configured"
```

## Phase 4: Environment Parity

```bash
echo "=== Environment Parity ==="

# Check for environment-specific configs
ls .env.development .env.staging .env.production 2>/dev/null | wc -l | xargs echo "Environment configs:"

# Compare env vars across environments
for env in development staging production; do
  [ -f ".env.${env}" ] && echo "  .env.${env}: $(grep -c '=' .env.${env}) vars" || echo "  .env.${env}: MISSING"
done

# Docker image consistency
grep "FROM " Dockerfile 2>/dev/null | head -1 | xargs echo "Base image:"
grep "FROM.*AS" Dockerfile 2>/dev/null && echo "INFO: Multi-stage build"

# Check staging matches production
echo ""
echo "Parity checklist:"
echo "  - [ ] Same base Docker image across environments"
echo "  - [ ] Same dependency versions (lock files used in CI)"
echo "  - [ ] Same database schema/migrations applied"
echo "  - [ ] Same environment variable names (values differ)"
echo "  - [ ] Same infrastructure topology (staging mirrors prod)"
```

## Report Template

```markdown
# CI/CD Pipeline Audit Report
Date: {ISO timestamp}
Platform: {GitHub Actions|GitLab CI|Jenkins|etc.}
Workflows: {count}

## Summary
| Area | Score | Critical | High | Medium |
|------|-------|----------|------|--------|
| Secrets Security | N/10 | N | N | N |
| Pipeline Hardening | N/10 | N | N | N |
| Quality Gates | N/10 | N | N | N |
| Supply Chain | N/10 | N | N | N |
| Environment Parity | N/10 | N | N | N |
| **Overall** | **N/50** | | | |

## Quality Gates Status
| Gate | Present | Blocking | Status |
|------|---------|----------|--------|
| Unit Tests | YES/NO | YES/NO | PASS/FAIL |
| Linting | YES/NO | YES/NO | PASS/FAIL |
| Type Checking | YES/NO | YES/NO | PASS/FAIL |
| Security Scan | YES/NO | YES/NO | PASS/FAIL |
| Coverage Check | YES/NO | YES/NO | PASS/FAIL |
| Deploy Approval | YES/NO | YES/NO | PASS/FAIL |

## Critical Findings
| # | Severity | Area | Finding | File:Line | Fix |
|---|----------|------|---------|-----------|-----|
| 1 | CRITICAL | Secrets | API key hardcoded in workflow | .github/workflows/deploy.yml:23 | Use GitHub Secrets |
| 2 | HIGH | Hardening | Actions not pinned to SHA | .github/workflows/*.yml | Pin to commit SHA |

## Evidence
- Pipeline analysis: `.claude/reports/cicd/pipeline-analysis.txt`
- Secrets scan: `.claude/reports/cicd/secrets-scan.txt`

## Verdict
**SECURE** — All critical controls pass.
OR
**AT RISK** — {N} critical findings. See above.
```

Save to `.claude/reports/cicd/report-{date}.md`

## Definition of Done
- All pipeline configs analyzed for secrets exposure
- Pipeline hardening checks completed
- Quality gates verified (tests, lint, scan, approval)
- Supply chain security validated (lock files, Dependabot)
- Environment parity assessed
- Report saved to `.claude/reports/cicd/`
