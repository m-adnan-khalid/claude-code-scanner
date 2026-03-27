---
name: launch-mvp
description: >
  MVP launch orchestrator. Validates all Must-Have features are complete, runs cross-feature
  integration tests, executes launch checklist, triggers final deployment, monitors, and
  transitions to post-MVP phase.
  Trigger: when all MVP features are complete and user wants to launch.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
argument-hint: '[--check | --force | --post-mvp]'
effort: high
---

# /launch-mvp — MVP Launch Orchestrator

## Overview
Final orchestration from "all features built" to "product launched". Validates completeness,
runs integration tests across all features, executes the launch checklist from
DEPLOY_STRATEGY.md, and transitions the project to post-MVP mode.

## Usage
```
/launch-mvp                  # Full launch pipeline (validate → test → deploy → monitor)
/launch-mvp --check          # Dry run — show readiness without launching
/launch-mvp --force          # Skip readiness checks (emergency launch)
/launch-mvp --post-mvp       # Transition to post-MVP development phase
```

## Launch Pipeline

### Step 0: Pre-Flight File Check

```
Validate all required files exist BEFORE starting any checks:

1. .claude/project/PROJECT.md → if missing: "No project found. Run /new-project first"
2. .claude/project/BACKLOG.md → if missing: "No backlog found. Run /feature-map first"
3. .claude/project/DEPLOY_STRATEGY.md → if missing: "No deploy strategy. Run /deploy-strategy first"
4. .claude/project/ARCHITECTURE.md → if missing: warn (not fatal for launch)
5. .claude/tasks/ directory → if empty: "No task records found. Build features with /mvp-kickoff first"

If any critical file missing: EXIT with specific remediation command.
```

### Step 1: Readiness Validation

```
1. FEATURE COMPLETENESS
   - Read BACKLOG.md: count Must-Have features
   - For each Must-Have: verify status = COMPLETE
   - For each COMPLETE feature: verify TASK-{id}.md status = CLOSED
   - If ANY Must-Have not COMPLETE:
     → List incomplete features
     → Show: "X/Y features complete. Cannot launch. Run /mvp-kickoff next"
     → EXIT (unless --force)

2. QUALITY GATE
   - For each completed feature: read execution report
   - Check: no quality score < 70
   - Check: no hallucination score >= 2
   - Check: no regression score >= 2
   - Check: total test coverage > 75%
   - If ANY quality gate fails:
     → Show failing features with scores
     → EXIT (unless --force)

3. OPEN ISSUES CHECK
   - Scan all TASK-{id}.md files for open bugs (status != CLOSED/VERIFIED)
   - Check for P0/P1 bugs (must be zero)
   - If open P0/P1 bugs found:
     → List bugs with severity and task
     → EXIT (always — cannot launch with P0/P1 bugs)
```

### Step 2: Cross-Feature Integration Testing

```
Spawn @tester + @qa-lead:

@tester:
  1. Read ALL completed feature TASK-{id}.md files
  2. Identify cross-feature interactions:
     - API endpoints from Feature 1 used by Feature 2's frontend
     - Shared data models across features
     - Authentication flow touching all features
     - Shared middleware/services
  3. Write integration test suite:
     - End-to-end user journey tests spanning multiple features
     - API contract validation between features
     - Auth flow across all protected endpoints
     - Error handling consistency check
  4. Run the integration test suite
  5. Report: pass/fail with details

@qa-lead:
  1. Review integration test results
  2. Identify untested cross-feature paths
  3. Create final QA report:
     - Features tested in isolation: Y (from individual QA phases)
     - Features tested in integration: Y (from this step)
     - Cross-feature bugs found: N
     - Recommendation: LAUNCH_READY / NEEDS_FIXES

If bugs found:
  → Route to @debugger for fixes
  → Re-run integration tests (max 3 iterations)
  → If still failing after 3: escalate to user
```

### Step 3: Launch Checklist Execution

```
Read .claude/project/DEPLOY_STRATEGY.md launch checklist.

Execute each checklist item:

AUTOMATED CHECKS:
- [ ] All features pass QA → read from Step 1 (auto)
- [ ] CI pipeline green → run CI checks (auto)
- [ ] Staging environment tested → verify staging deploy exists (auto)
- [ ] Database migrations tested → check migration status (auto)
- [ ] Dependencies scanned → run npm audit / pip-audit (auto)

INFRASTRUCTURE CHECKS (spawn @infra):
- [ ] Production environment ready → verify cloud resources
- [ ] HTTPS enforced → check TLS config
- [ ] CORS configured → verify allowed origins
- [ ] Rate limiting enabled → check middleware config
- [ ] Security headers set → check response headers
- [ ] Monitoring configured → verify monitoring endpoints
- [ ] Alerting configured → verify alert rules
- [ ] Backup strategy tested → verify backup exists

MANUAL VERIFICATION (ask user):
- [ ] DNS configured and propagated?
- [ ] SSL certificate active?
- [ ] Domain accessible?
- [ ] Payment/billing configured (if applicable)?

Report: N/M checklist items complete
If any CRITICAL items fail: EXIT (unless --force)
```

### Step 4: Final Deployment

```
Spawn @infra:

1. Pre-deployment snapshot:
   - Tag current release: v1.0.0-mvp
   - Backup database
   - Snapshot current state

2. Deploy to production:
   - Follow DEPLOY_STRATEGY.md deployment method
   - Blue-green / rolling / canary as specified

3. Post-deployment verification:
   - Health check endpoints
   - Smoke test critical paths
   - Verify all features accessible

4. If deployment fails:
   - Auto-rollback to snapshot
   - Report failure to user
   - Log in PROJECT.md Decision Log
```

### Step 5: Post-Launch Monitoring

```
Monitor for 30 minutes (configurable):
- Error rate < 1%
- Response time p95 < 500ms
- CPU/memory within thresholds
- No 5xx errors on critical paths

If issues detected:
- Alert user with specifics
- Offer: continue monitoring / rollback / investigate

If monitoring passes:
- Update PROJECT.md: status → LAUNCHED
- Update BACKLOG.md: mark all Must-Have as DEPLOYED
- Generate Launch Report
```

### Step 6: Launch Report

```
## MVP Launch Report: {project-name}

### Summary
- **Launch Date:** {timestamp}
- **Features Delivered:** {count} Must-Have features
- **Total Development Time:** {duration from first feature to launch}
- **Pre-Development Time:** {duration of 8 pre-dev phases}

### Features Delivered
| Feature | Task ID | Quality Score | Tests | Bugs Found | Bugs Fixed |
|---------|---------|---------------|-------|------------|------------|

### Quality Summary
- Average quality score: {N}/100
- Total tests: {N} (unit: {N}, integration: {N}, e2e: {N})
- Test coverage: {N}%
- Total bugs found in QA: {N} (all resolved)
- Cross-feature integration bugs: {N}
- Rollbacks during development: {N}

### Infrastructure
- Hosting: {platform}
- Monitoring: {tool} — dashboard link
- Alerting: configured for {metrics}
- Rollback plan: {method}

### Next Steps
1. Monitor production for 48 hours
2. Review user feedback
3. Start Should-Have features: /mvp-kickoff --post-mvp
4. Set up /sync for ongoing maintenance

Save to: .claude/reports/mvp-launch-report.md
```

## Post-MVP Transition (`--post-mvp`)

```
1. Read BACKLOG.md Should-Have features
2. Re-prioritize based on:
   - User feedback (if available)
   - Technical debt from MVP development
   - New insights from launch monitoring
3. Update PROJECT.md: status → POST_MVP
4. Present Should-Have feature list with updated priorities
5. Suggest: "/mvp-kickoff next" to start first post-MVP feature

Post-MVP changes to workflow:
- Features deploy to existing production (not greenfield)
- Integration testing includes ALL existing features
- Monitoring window extended for riskier changes
- /sync runs weekly to keep environment in sync
```

## Outputs
- `.claude/reports/mvp-launch-report.md` — comprehensive launch report
- Updated `.claude/project/PROJECT.md` — status = LAUNCHED
- Updated `.claude/project/BACKLOG.md` — all Must-Have = DEPLOYED
- Integration tests in test directory

## Prerequisites
- All Must-Have features in BACKLOG.md must have status COMPLETE (or use --force)
- `.claude/project/DEPLOY_STRATEGY.md` must exist
