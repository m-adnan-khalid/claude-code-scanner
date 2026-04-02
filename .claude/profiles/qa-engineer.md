# QA Engineer Profile

## Role
QA engineer focused on test strategy, test automation, quality metrics, and release validation.

## Primary Agents
- `@qa-lead` — test planning, QA strategy, QA sign-off
- `@tester` — writing and running automated tests
- `@debugger` — for reproducing and investigating bugs
- `@code-quality` — for code quality audit and duplication checks
- `@security` — for security testing review

## Key Skills
- `/workflow new "test task"` — SDLC workflow (routes to QA phases)
- `/e2e-browser` — real browser E2E tests (Playwright/Cypress)
- `/e2e-mobile` — real mobile E2E tests (Maestro/Detox/Appium)
- `/api-test` — real API test suites (Newman/Hurl/HTTPyac)
- `/load-test` — real load/performance tests (k6/JMeter/Locust)
- `/visual-regression` — visual screenshot comparison (BackstopJS/Playwright)
- `/coverage-track` — coverage parsing, delta tracking, threshold enforcement
- `/mobile-audit` — mobile quality audit (if applicable)
- `/accessibility-audit` — WCAG 2.1 AA/AAA compliance scanning
- `/performance-audit` — Lighthouse, Core Web Vitals measurement
- `/metrics` — team quality and velocity metrics

## Typical Workflow
```
/workflow new "test coverage for feature X"
# @qa-lead creates test plan (Phase 9)
# @tester writes automated tests (Phase 6)
# @qa-lead provides QA sign-off (Phase 10)
```

## Focus Areas
- Test strategy (unit, integration, e2e, load, security)
- Test automation frameworks (Jest, Playwright, Cypress, Pytest)
- Coverage analysis and uncovered path identification
- Regression testing and test suite maintenance
- Performance and load testing (k6, Locust)
- Mobile testing (device matrix, emulators, Detox, Appium)
- Accessibility testing (WCAG compliance, screen readers)
- Bug reproduction, triage, and severity classification

## Context Loading
Your session loads:
- CLAUDE.md (project overview)
- `.claude/rules/testing.md` (test patterns)
- `.claude/project/PRODUCT_SPEC.md` (acceptance criteria)
- `.claude/project/BACKLOG.md` (feature requirements)
