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
- `/mobile-audit` — mobile quality audit (if applicable)
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
