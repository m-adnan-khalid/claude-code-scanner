# Additional Skill Templates to Generate

## Always Generate

### /onboard
```yaml
---
name: onboard
description: Onboard a new developer. Use when someone is new to the project.
user-invocable: true
context: fork
agent: explorer
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[area or topic to focus on]"
---
Walk through: architecture overview, setup verification ({install_cmd}, {build_cmd}, {test_cmd}), domain terms, key concepts, first task guidance.
Focus on $ARGUMENTS if provided.
```

### /add-feature
```yaml
---
name: add-feature
description: Scaffold a new feature following project patterns.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
argument-hint: "[feature description]"
---
1. Find closest existing pattern
2. Scaffold files in correct directories with naming conventions
3. Implement with proper error handling and logging
4. Write tests following existing patterns
5. Verify: {test_cmd} → {lint_cmd} → {build_cmd}
```

### /fix-bug
```yaml
---
name: fix-bug
description: Systematic bug fixing. Use when something is broken.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
argument-hint: "[bug description or error message]"
---
1. Reproduce with failing test
2. Trace code path from entry to failure
3. Fix root cause (not symptom)
4. Verify: failing test passes, no regressions
Run {test_cmd} after fix.
```

### /review-pr
```yaml
---
name: review-pr
description: Review a PR against project standards.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[PR-number]"
---
`gh pr diff $0` — check conventions, tests, security, performance, backward compatibility.
Output: APPROVE/CHANGES_REQUESTED with file:line comments.
```

### /design-review
```yaml
---
name: design-review
description: Architecture and design review for proposed changes.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
argument-hint: "[change description]"
---
@explorer: analyze fit with existing architecture, propose file locations, compare alternatives, flag breaking changes. Output Mermaid diagram.
```

### /qa-plan
```yaml
---
name: qa-plan
description: Generate QA test plan for current changes.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
---
Analyze `git diff {base}...HEAD`. Generate: happy path scenarios, error/edge cases, regression tests, performance checks, cross-browser matrix. Format as checkable table.
```

### /signoff
```yaml
---
name: signoff
description: Generate sign-off request for QA, business, or tech lead.
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[qa|business|tech] [task-id]"
---
qa: test results, known issues, recommendation.
business: acceptance criteria verification, demo URL, impact, rollback plan.
tech: all prior sign-offs, architecture/security review status, merge strategy.
```

### /deploy
```yaml
---
name: deploy
description: Deploy with pre/post checks.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[staging|production] [pr-number]"
---
Pre-checks → merge PR → deploy → health check → smoke test. Rollback on failure.
```

### /standup
```yaml
---
name: standup
description: Auto-generate daily standup from active task data.
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
---
Read .claude/tasks/. Output: yesterday (completed), today (planned), blockers, metrics.
```

### /discover-skills
```yaml
---
name: discover-skills
description: Search Smithery for matching skills and install them.
user-invocable: true
disable-model-invocation: true
allowed-tools: Bash
---
`smithery skill search "$ARGUMENTS"` → evaluate match → install → `/context` to verify budget.
```

### /architecture
```yaml
---
name: architecture
description: Generate or explain project architecture.
user-invocable: true
context: fork
agent: explorer
allowed-tools: Read, Grep, Glob, Bash
---
System context, container diagram, component diagram, data flow, key decisions. Mermaid diagrams.
```

### /execution-report
```yaml
---
name: execution-report
description: Generate post-execution analytics report with success scoring, hallucination detection, and regression impact analysis.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[task-id|last|all] [--phase N] [--verbose]"
---
Collect execution metadata, calculate success score (0-100), check for hallucinations (verify file refs, function names, conventions), assess regression impact (test suite, coverage delta), and output scored report to .claude/reports/executions/.
```

### /sync
```yaml
---
name: sync
description: Detect drift between Claude Code environment and actual codebase. Updates CLAUDE.md, agents, skills, rules, hooks when roles change or project evolves.
user-invocable: true
context: fork
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Agent
argument-hint: "[--check|--fix|--full-rescan] [--component agents|skills|rules|hooks|claude-md|all]"
---
Drift detection across 8 categories: agents, skills, hooks, rules, CLAUDE.md, settings, tech stack, structure.
--check: report only. --fix: auto-repair. --full-rescan: re-scan + regenerate.
Updates manifest.json for future drift tracking.
```

### /context-check
```yaml
---
name: context-check
description: Check current context usage and enforce the 60% working budget. Use between workflow phases or when responses feel slow.
user-invocable: true
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[--compact] [--force]"
---
Run /context, evaluate against budget thresholds (GREEN <40%, YELLOW 40-60%, ORANGE 60-75%, RED 75%+).
If ORANGE+: compact with focus on current task/phase. Log context pressure in task record.
Auto-invoked between every workflow phase transition.
```

### /rollback
```yaml
---
name: rollback
description: Rollback a failed deployment, revert code changes, or undo a workflow phase.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[deploy|code|phase] [task-id] [--to-commit SHA]"
---
Deploy rollback: revert merge, redeploy, health check.
Code rollback: revert commits or close PR.
Phase rollback: undo artifacts from target phase range, reset task status.
Safety: never force-push, always create revert commit, always run tests after.
```

### /migrate
```yaml
---
name: migrate
description: Create database migrations.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
argument-hint: "[migration description]"
---
Check schema → create migration file → write up/down → test → verify.
```

## Conditional Skills (generate ONLY if codebase has the layer)

### /add-endpoint — Generate if backend API exists
```yaml
---
name: add-endpoint
description: Create new API endpoint following project patterns.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---
1. Find closest existing endpoint in `{routes_dir}` — READ it
2. Create: route in `{routes_dir}`, handler in `{handlers_dir}`, schema in `{schemas_dir}`, service in `{services_dir}`
3. Add validation using {validation_library}, auth using {auth_pattern}
4. Write tests in `{api_test_dir}`: happy path, validation errors, auth errors, not found
5. Verify: {test_cmd} → {lint_cmd} → {type_check_cmd}
```

### /add-component — Generate if frontend exists
```yaml
---
name: add-component
description: Create new UI component following project patterns.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---
1. Find similar component in `{component_dir}` — READ it for exact pattern
2. Create: component `{ComponentName}.{ext}`, test `{ComponentName}.test.{ext}`, styles if co-located
3. Follow: {prop_pattern}, {styling_approach}, {export_pattern}
4. Write tests: render, behavior, props variations
5. Verify: {frontend_test_cmd} → {frontend_build_cmd}
```

### /add-page — Generate if frontend has routing
```yaml
---
name: add-page
description: Create new page/route.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---
1. Pages in `{pages_dir}` use {file-based | config-based} routing
2. READ existing page for: data loading pattern, layout, error handling
3. Create page, set up data loading ({getServerSideProps | loader | useEffect})
4. Apply layout, add navigation link
5. Write test, verify with {dev_cmd}
```

### Real Environment Testing Skills (always included):
- `/e2e-browser` — real browser E2E tests (Playwright/Cypress). Auto-detects framework, captures screenshots/traces/videos.
- `/e2e-mobile` — real mobile E2E tests (Maestro/Detox/Appium/Flutter/XCUITest/Espresso). Runs on emulator/device.
- `/api-test` — real API test suites (Newman/Hurl/HTTPyac/Bruno/Supertest). Real HTTP requests with assertions.
- `/load-test` — real load/performance tests (k6/JMeter/Locust/Artillery). Measures throughput, latency, error rates.
- `/visual-regression` — visual screenshot comparison (Playwright/BackstopJS/Percy). Detects CSS/layout regressions.
- `/coverage-track` — real coverage parsing (Istanbul/c8/coverage.py/go cover). Tracks deltas, enforces thresholds.

### Audit & Compliance Skills (always included):
- `/accessibility-audit` — WCAG 2.1 AA/AAA scanning (axe-core, Pa11y, Lighthouse). Automated + manual checklist.
- `/privacy-audit` — GDPR/CCPA compliance. PII detection, data flow mapping, consent, data subject rights.
- `/performance-audit` — Lighthouse, Core Web Vitals, bundle size analysis, performance budget enforcement.
- `/infrastructure-audit` — SOC 2 controls, IaC scanning (Terraform/Docker/K8s), secrets management, network security.
- `/license-audit` — OSS license compliance, SPDX validation, copyleft risk detection.
- `/docs-audit` — README quality scoring, API docs completeness, ADR validation, changelog compliance.
- `/cicd-audit` — Pipeline secrets, deployment gates, supply chain security, environment parity.
- `/incident-readiness` — DR plan validation, runbook completeness, backup/restore, monitoring, on-call readiness.

### Observability & Logging Skills (always included):
- `/setup-observability` — full observability stack setup (structured logging, OpenTelemetry tracing, Prometheus metrics, Sentry errors, health checks). Auto-detects tech stack.
- `/logging-audit` — audit logging practices (PII leak detection, log level distribution, correlation ID coverage, console.log usage, observability gaps).

### Additional conditional skills:
- If i18n: `/add-translation` (translation file format + key naming)
- If GraphQL: `/add-query`, `/add-mutation` (schema + resolver patterns)
- If Storybook: `/add-story` (story format + decorators)
- If WebSocket: `/add-channel` (event patterns)
