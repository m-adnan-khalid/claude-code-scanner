# PROJECT.md — Claude Code Scanner

## Project Metadata
| Field | Value |
|-------|-------|
| Project Name | Claude Code Scanner |
| Version | 2.2.0 |
| Domain | AI Development Automation / SDLC Tooling |
| Status | ACTIVE — pending npm publish |
| Author | adnan-prompts |
| License | MIT |
| Repository | github.com/m-adnan-khalid/claude-code-scanner |
| Node.js | >= 18 (no external dependencies) |
| Built | 2026-04-01 from document intelligence scan |

## Phase Tracker
| # | Phase | Status | Evidence |
|---|-------|--------|----------|
| 1 | Ideation | ✅ DONE | IDEA_CANVAS.md populated (STORY-001 DONE, 3 gap stories registered) |
| 2 | Product Spec | ✅ DONE | PRODUCT_SPEC.md populated (17 features, 4 journeys) |
| 3 | Feature Map / Backlog | ✅ DONE | BACKLOG.md populated (9 active, 7 archived, dependency tree) |
| 4 | Domain Model | ✅ DONE | DOMAIN_MODEL.md (31 entities, 4 bounded contexts) + GLOSSARY.md (32 terms) |
| 5 | Tech Stack | ✅ DONE | Node.js, JSON, Markdown, GitHub Actions (from docs/ARCHITECTURE.md) |
| 6 | Architecture | ✅ DONE | Two-layer design documented (docs/ARCHITECTURE.md) |
| 7 | BRD | ✅ DONE | BRD.md populated (14 sections, 15 FRs, 8 NFRs, RACI matrix) |
| 8 | Requirements | ✅ DONE | 6 requirement files in docs/requirements/ (30 FRs, 12 NFRs) |
| 9 | Launch | ⚠️ PARTIAL | Framework certified 100% (CERT-FINAL), npm publish pending |

## Key Documents
| Document | Path | Status |
|----------|------|--------|
| IDEA_CANVAS | .claude/project/IDEA_CANVAS.md | DONE (3 gap stories pending) |
| PRODUCT_SPEC | .claude/project/PRODUCT_SPEC.md | DONE |
| BACKLOG | .claude/project/BACKLOG.md | DONE |
| DOMAIN_MODEL | .claude/project/DOMAIN_MODEL.md | DONE |
| GLOSSARY | .claude/project/GLOSSARY.md | DONE |
| BRD | .claude/project/BRD.md | DONE |
| ARCHITECTURE | docs/ARCHITECTURE.md | DONE (existing) |
| STANDARDS | docs/STANDARDS.md | DONE (existing) |
| ONBOARDING | docs/ONBOARDING.md | DONE (existing) |
| TASK_REGISTRY | .claude/project/TASK_REGISTRY.md | ACTIVE |

## Decision Log
| # | Decision | Source | Date | Status |
|---|----------|--------|------|--------|
| D-001 | Use Node.js built-ins only, no external dependencies | CONTRIBUTING.md | 2026-03-29 | ACCEPTED |
| D-002 | Two-layer architecture: root (scanner) + template (product) | docs/ARCHITECTURE.md | 2026-03-29 | ACCEPTED |
| D-003 | 10-role RBAC with PreToolUse hook enforcement | docs/adr/0001-enterprise-rbac.md | 2026-03-29 | ACCEPTED |
| D-004 | Event-driven hook runtime with isolated subprocesses | docs/ARCHITECTURE.md | 2026-03-29 | ACCEPTED |
| D-005 | Placeholder-based template engine for artifact generation | docs/ARCHITECTURE.md | 2026-03-29 | ACCEPTED |
| D-006 | MIT license for open source distribution | package.json | 2026-03-29 | ACCEPTED |
| D-007 | GitHub Actions for CI/CD pipeline | TODO.md | 2026-03-29 | ACCEPTED |
| D-008 | npm registry for distribution | MEMORY.md | 2026-03-29 | PENDING |

## Risk Register
| # | Risk | Source | Impact | Mitigation | Story |
|---|------|--------|--------|------------|-------|
| R-001 | npm publish not yet completed | MEMORY.md | HIGH — blocks distribution | Execute npm publish workflow | — |
| R-002 | Interactive CLI mode undefined | TODO.md | MED — user experience gap | Define in PRODUCT_SPEC | STORY-002 |
| R-003 | Plugin system undefined | TODO.md | MED — extensibility gap | Design plugin architecture | STORY-002 |
| R-004 | No video walkthrough | TODO.md | LOW — onboarding gap | Create video demo | — |
| R-005 | Skill count discrepancy — RESOLVED | README vs CLAUDE.md | RESOLVED — all docs updated to 87 | Audit completed 2026-04-01 | — |

## Open Items (from scan)
| # | Item | Source | Action | Priority |
|---|------|--------|--------|----------|
| OI-001 | Publish to npm registry | MEMORY.md, TODO.md | npm publish workflow | HIGH |
| OI-002 | Add interactive CLI mode | TODO.md | Design + implement | MED |
| OI-003 | Create plugin system | TODO.md | Architecture design needed | MED |
| OI-004 | Create video walkthrough | TODO.md | Record demo | LOW |
