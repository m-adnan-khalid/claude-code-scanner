# Skills Index — Complete Reference (93 Skills)

> All skills organized by lifecycle tier and workflow category.

---

## Skill Tiers

| Tier | Category | Count | Required Sections |
|------|----------|-------|-------------------|
| **T1** | Multi-step execution | 24 | ALL (LOAD, steps, HANDOFF, NEXT ACTION, MEMORY) |
| **T2** | Audit/analysis | 18 | LOAD, NEXT ACTION, MEMORY |
| **T3** | Planning/docs | 12 | LOAD, NEXT ACTION, MEMORY |
| **T4** | Testing | 4 | LOAD, NEXT ACTION, MEMORY |
| **T5** | Status/utility | 30 | NEXT ACTION only |

---

## 1. New Project — Pre-Development (T3 Planning)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| brainstorm | `/brainstorm "idea"` | @ideator | IDEA_CANVAS.md |
| product-spec | `/product-spec` | @strategist | PRODUCT_SPEC.md |
| feature-map | `/feature-map` | @strategist | BACKLOG.md |
| domain-model | `/domain-model` | @architect | DOMAIN_MODEL.md |
| tech-stack | `/tech-stack` | @architect | TECH_STACK.md |
| architecture | `/architecture` | @architect | ARCHITECTURE.md |
| deploy-strategy | `/deploy-strategy` | @infra | DEPLOY_STRATEGY.md |
| methodology | `/methodology` | @process-coach | METHODOLOGY.md |
| clarify | `/clarify` | @product-owner | Clarification report |
| cost-estimate | `/cost-estimate` | @infra | Cost projections |
| create-story | `/create-story "title"` | @strategist | User story with BDD |
| pi-planning | `/pi-planning` | @team-lead | PI plan, program board |

## 2. New Project — Orchestrators (T1 Multi-step)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| new-project | `/new-project "idea"` | Orchestrator | Full pre-dev pipeline |
| idea-to-launch | `/idea-to-launch "idea"` | Orchestrator | Idea → deployed product |
| import-docs | `/import-docs "path"` | Orchestrator | Imported project files |
| scaffold | `/scaffold` | @scaffolder | Project files |

## 3. Existing Project — Setup (T1/T5)

| Skill | Command | Tier | Agent | Output |
|-------|---------|------|-------|--------|
| scan-codebase | `/scan-codebase` | T5 | 6 parallel agents | TECH_MANIFEST |
| generate-environment | `/generate-environment` | T1 | Orchestrator | All .claude/ artifacts |
| validate-setup | `/validate-setup` | T5 | Orchestrator | Validation report |
| setup-smithery | `/setup-smithery` | T1 | Orchestrator | MCP configuration |
| scan-and-build | `/scan-and-build` | T1 | Orchestrator | Full workspace from docs |

## 4. MVP Orchestration (T1/T5)

| Skill | Command | Tier | Agent | Output |
|-------|---------|------|-------|--------|
| mvp-kickoff | `/mvp-kickoff next` | T1 | @team-lead | Workflow task |
| mvp-status | `/mvp-status` | T5 | @team-lead | Progress dashboard |
| launch-mvp | `/launch-mvp` | T1 | Orchestrator | Deployed MVP |

## 5. Development Workflow (T1)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| workflow | `/workflow new "desc"` | Orchestrator | 14-phase SDLC |
| feature-start | `/feature-start` | @team-lead | Branch + task setup |
| feature-done | `/feature-done` | @team-lead | Cleanup + close |
| parallel-dev | `/parallel-dev` | @team-lead | Parallel task analysis |

## 6. Development Utilities (T1)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| add-endpoint | `/add-endpoint "POST /api/x"` | @api-builder | Route, service, model, tests |
| add-component | `/add-component "Name"` | @frontend | Component, styles, tests |
| add-page | `/add-page "route"` | @frontend | Page with layout, data |
| add-command | `/add-command "name"` | @api-builder | CLI command scaffold |
| add-scene | `/add-scene "Level1"` | @frontend | Game scene (Unity/Godot/etc.) |
| add-template | `/add-template "name"` | @frontend | Email/notification template |
| fix-bug | `/fix-bug "desc"` | @debugger | 5-step bug fix |
| hotfix | `/hotfix "issue"` | @debugger | Fast-track production fix |
| refactor | `/refactor "target"` | @code-quality | Targeted refactoring |
| migrate | `/migrate "desc"` | @database | Database migration |
| deploy | `/deploy staging` | @infra | Deployment |
| rollback | `/rollback deploy TASK-id` | @infra | Rollback |
| setup-workspace | `/setup-workspace` | Orchestrator | Role setup + session |
| onboard | `/onboard` | Orchestrator | Developer onboarding guide |

## 7. Review & Quality (T2/T5)

| Skill | Command | Tier | Agent | Output |
|-------|---------|------|-------|--------|
| review-pr | `/review-pr [PR]` | T5 | @reviewer + @security | Code review |
| design-review | `/design-review` | T2 | @architect + @code-quality | Design review |
| impact-analysis | `/impact-analysis "change"` | T2 | @explorer + @security | Blast radius report |
| dependency-check | `/dependency-check` | T2 | — | Dependency report |
| qa-plan | `/qa-plan "feature"` | T3 | @qa-lead | QA test plan |
| signoff | `/signoff tech TASK-id` | T5 | @team-lead/@qa-lead/@product-owner | Sign-off gate |

## 8. Testing (T4)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| e2e-browser | `/e2e-browser` | @qa-automation | Playwright/Cypress E2E results |
| e2e-mobile | `/e2e-mobile` | @qa-automation | Maestro/Detox/Appium results |
| api-test | `/api-test` | @tester | Newman/Hurl/HTTPyac results |
| load-test | `/load-test` | @tester | k6/JMeter/Locust results |

## 9. Audit & Compliance (T2)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| accessibility-audit | `/accessibility-audit` | @qa-automation | WCAG 2.1 AA/AAA report |
| privacy-audit | `/privacy-audit` | @security | GDPR/CCPA data flow report |
| performance-audit | `/performance-audit` | @qa-automation | Lighthouse/CWV report |
| infrastructure-audit | `/infrastructure-audit` | @infra | SOC 2/IaC report |
| license-audit | `/license-audit` | @security | OSS license report |
| docs-audit | `/docs-audit` | @docs-writer | Documentation quality report |
| cicd-audit | `/cicd-audit` | @infra | Pipeline security report |
| incident-readiness | `/incident-readiness` | @infra | DR readiness report |
| security-audit | `/security-audit` | @security | OWASP Top 10 report |
| mobile-audit | `/mobile-audit` | @mobile | Mobile quality report |
| seo-audit | `/seo-audit` | @qa-automation | SEO audit report |
| firmware-audit | `/firmware-audit` | @security | Memory safety/RTOS report |
| logging-audit | `/logging-audit` | @security | Logging practices report |
| visual-regression | `/visual-regression` | @qa-automation | Screenshot diff report |
| coverage-track | `/coverage-track` | @tester | Coverage delta report |

## 10. Observability (T1/T2/T5)

| Skill | Command | Tier | Agent | Output |
|-------|---------|------|-------|--------|
| setup-observability | `/setup-observability` | T1 | @observability-engineer | Logging, tracing, metrics stack |
| logging-audit | `/logging-audit` | T2 | @security | Logging practices report |
| metrics | `/metrics` | T5 | — | Metrics dashboard |
| execution-report | `/execution-report` | T5 | — | Post-task analytics |

## 11. Versioning & Feature Management (T5)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| api-version | `/api-version add v2` | @api-builder | API version scaffold |
| api-docs | `/api-docs` | — | OpenAPI spec |
| feature-flags | `/feature-flags add FLAG` | @api-builder | Feature flag management |
| service-contract | `/service-contract define X` | @architect/@tester | Contract definitions |
| cms-manage | `/cms-manage add-content-type X` | @api-builder | CMS content types |
| manage-i18n | `/manage-i18n extract` | @frontend | i18n locale management |

## 12. Reporting & Analytics (T5)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| task-tracker | `/task-tracker status` | — | Task dashboard |
| standup | `/standup` | — | Daily standup report |
| progress-report | `/progress-report dev` | — | Progress report (dev/biz/exec) |
| execution-report | `/execution-report` | — | Post-task analytics |
| org-report | `/org-report` | @cto | Org health report |
| daily-sync | `/daily-sync` | — | Team sync status |
| changelog | `/changelog` | — | CHANGELOG.md |
| release-notes | `/release-notes [version]` | — | Release documentation |

## 13. Maintenance & Context (T5)

| Skill | Command | Agent | Output |
|-------|---------|-------|--------|
| sync | `/sync --check` | — | Drift detection/repair |
| context-check | `/context-check` | — | Context budget status |
| compact | `/compact "focus"` | — | Context compression |
| audit-system | `/audit-system` | — | 7-phase system audit |

---

## Skill-to-Phase Mapping

| SDLC Phase | Skills Used |
|------------|-------------|
| Phase 0 (Intake) | `/workflow new`, `/create-story` |
| Phase 1 (Task Setup) | `/feature-start` |
| Phase 2 (Impact) | `/impact-analysis`, `/security-audit` |
| Phase 3 (Architecture) | `/architecture`, `/design-review` |
| Phase 4 (Business) | `/clarify`, `/product-spec` |
| Phase 5 (Development) | `/add-endpoint`, `/add-component`, `/add-page`, `/migrate`, `/refactor` |
| Phase 6 (Dev Testing) | `/api-test`, `/e2e-browser`, `/coverage-track` |
| Phase 7 (Review) | `/review-pr`, `/design-review` |
| Phase 8 (PR + CI) | `/cicd-audit` |
| Phase 9 (QA) | `/qa-plan`, `/e2e-browser`, `/e2e-mobile`, `/load-test`, `/visual-regression` |
| Phase 10 (Sign-off) | `/signoff` |
| Phase 11 (Deploy) | `/deploy`, `/rollback` |
| Phase 12 (Monitor) | `/setup-observability`, `/logging-audit`, `/incident-readiness`, `/metrics` |
| Phase 13 (Report) | `/execution-report`, `/progress-report` |
