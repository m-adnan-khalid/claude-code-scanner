# Developer Onboarding Guide

Welcome! Follow the track for your role below.

## All Roles — First Steps
1. Clone repo and install dependencies
2. Run `/setup-workspace` — sets your `CURRENT_ROLE` in `.claude/session.env`
3. Verify CLAUDE.md version: check `## FRAMEWORK VERSION` matches latest
4. Run `/audit-system` — confirms your local setup is correct
5. Run `/daily-sync` — pulls latest, shows team activity

## Role-Specific Reading (10 Role Tracks)

### CTO / VP Engineering
- Read: CLAUDE.md (full), docs/ARCHITECTURE.md, docs/adr/
- Commands: /audit-system, /org-report, /progress-report executive, /sync --full-rescan
- Agents: @team-lead, @architect, @gatekeeper, @process-coach, @cto
- Workflow: `/audit-system` to check health, then `/org-report` for team dashboard

### Architect
- Read: CLAUDE.md, docs/ARCHITECTURE.md, docs/adr/, docs/patterns/, .claude/agents/
- Commands: /architecture, /design-review, /dependency-check, /impact-analysis
- Agents: @architect, @code-quality, @security, @explorer
- Focus: System design, pattern governance, ADR creation and review
- Workflow: `/design-review` on PRs, `/architecture` for new modules, `/impact-analysis` before changes

### Tech Lead
- Read: CLAUDE.md, docs/ARCHITECTURE.md, docs/adr/, docs/patterns/, .claude/agents/, .claude/hooks/
- Commands: /architecture, /design-review, /dependency-check, /impact-analysis, /org-report
- Agents: @team-lead, @architect, @code-quality, @security, @explorer
- Focus: Orchestration, agent definitions, hook management, team coordination
- Workflow: `/daily-sync` then `/org-report`, assign tasks via @team-lead

### Backend Dev
- Read: CLAUDE.md (Backend Dev section), docs/STANDARDS.md, docs/GLOSSARY.md, docs/patterns/
- Commands: /add-endpoint, /api-test, /fix-bug, /migrate
- Agents: @api-builder, @debugger, @tester, @database
- Profile: .claude/profiles/backend.md
- Workflow: `/feature-start` then `/add-endpoint`, run `/api-test`, finish with `/feature-done`

### Frontend Dev
- Read: CLAUDE.md (Frontend Dev section), docs/STANDARDS.md, docs/GLOSSARY.md, docs/patterns/
- Commands: /add-component, /add-page, /e2e-browser, /visual-regression
- Agents: @frontend, @debugger, @tester, @ux-designer
- Profile: .claude/profiles/frontend.md
- Workflow: `/feature-start` then `/add-component`, run `/e2e-browser`, finish with `/feature-done`

### Full Stack Dev
- Read: CLAUDE.md (Full Stack section), docs/STANDARDS.md, docs/GLOSSARY.md, docs/patterns/
- Commands: All dev commands + /impact-analysis, /api-test, /e2e-browser
- Agents: @api-builder, @frontend, @debugger, @tester, @database
- Profile: .claude/profiles/fullstack.md
- Workflow: `/impact-analysis` before cross-layer changes, file ADR if architectural

### QA / SDET
- Read: CLAUDE.md (QA section), docs/STANDARDS.md, docs/patterns/test-pattern.md
- Commands: /qa-plan, /e2e-browser, /e2e-mobile, /api-test, /coverage-track, /load-test
- Agents: @qa-lead, @tester, @qa-automation, @gatekeeper
- Profile: .claude/profiles/qa-engineer.md
- Workflow: `/qa-plan` for new features, `/e2e-browser` + `/api-test` for validation, `/coverage-track` for gaps

### DevOps / Platform
- Read: CLAUDE.md (DevOps section), docs/ARCHITECTURE.md, .claude/CLAUDE.ci.md
- Commands: /deploy, /infrastructure-audit, /cicd-audit, /incident-readiness
- Agents: @infra, @security, @gatekeeper
- Profile: .claude/profiles/devops.md
- Workflow: `/infrastructure-audit` first, then `/cicd-audit`, `/deploy` when ready

### Product Owner / PM
- Read: CLAUDE.md (PM section), docs/ARCHITECTURE.md (overview only)
- Commands: /product-spec, /feature-map, /progress-report, /clarify, /brainstorm
- Agents: @product-owner, @strategist, @ideator
- Workflow: `/brainstorm` for ideas, `/product-spec` to formalize, `/progress-report` to track

### Designer / UX
- Read: CLAUDE.md (Designer section), docs/STANDARDS.md (naming only)
- Commands: /design-review, /accessibility-audit, /visual-regression
- Agents: @ux-designer, @frontend (read-only), @code-quality
- Workflow: `/design-review` on UI PRs, `/accessibility-audit` before release, `/visual-regression` for CSS changes

## Your First Task
1. Run `/daily-sync`
2. Run `/feature-start` — creates a role-prefixed branch
3. Do your work using role-appropriate commands
4. Run `/feature-done` — checks doc sync, runs QA gate
5. Submit PR for review

## Getting Help
- `/clarify` — ask questions about requirements
- `/audit-system` — check your setup
- Check docs/GLOSSARY.md for terminology
