# Business Requirements Document — Claude Code Scanner

**Version:** 1.0
**Owner:** @analyst
**Created:** 2026-04-01
**Story:** STORY-005
**Status:** IN_REVIEW

---

## 1. Executive Summary

Claude Code Scanner is an open-source CLI tool that automates the creation of enterprise-grade Claude Code development environments. It scans existing codebases or starts from new ideas, generating complete configurations including 30 agents, 93 skills, 44 hooks (25 root + 19 template), 11 rules, and 10-role RBAC — validated to 100% certification.

**Business Objective:** Reduce Claude Code environment setup from days of manual configuration to minutes of automated generation.

- Source: README.md, package.json

---

## 2. Business Context & Objectives

| # | Objective | Success Criterion | Source |
|---|-----------|-------------------|--------|
| BO-001 | Eliminate manual Claude Code environment setup | 100% of environment artifacts auto-generated | README.md |
| BO-002 | Enforce enterprise governance across team roles | 10 roles with path-scoped access control | docs/adr/0001-enterprise-rbac.md |
| BO-003 | Ensure output quality through automated verification | 100% framework verification (69/69 checks) | CERT-20260329-FINAL |
| BO-004 | Support both greenfield and brownfield projects | Two modes: scan existing + new project | CLAUDE.md |
| BO-005 | Distribute via npm for frictionless adoption | `npx claude-code-scanner` works globally | package.json |

---

## 3. Stakeholders & RACI Matrix

| Stakeholder | Role | Concerns | R | A | C | I |
|-------------|------|----------|---|---|---|---|
| CTO / VP Eng | Executive Sponsor | Framework integrity, governance | | X | X | X |
| Tech Lead | Configuration Owner | Agent/hook/rule correctness | X | | X | X |
| Architect | Design Authority | Two-layer architecture, service boundaries | | | X | X |
| Backend Dev | Primary User | API endpoints, services, migrations | X | | | X |
| Frontend Dev | Primary User | Components, pages, styles | X | | | X |
| Full Stack Dev | Primary User | Cross-layer development | X | | | X |
| QA / SDET | Quality Gate | Test coverage, verification | X | | X | X |
| DevOps | Infrastructure | CI/CD, deployment, npm publish | X | | X | X |
| PM / PO | Requirements Owner | Feature priorities, acceptance criteria | | X | X | X |
| Designer / UX | UI/UX Input | CLI output formatting, reports | | | X | X |

- Source: docs/ONBOARDING.md, CLAUDE.md (RBAC section)

---

## 4. Functional Requirements

| ID | Requirement | Priority | Source | Status |
|----|------------|----------|--------|--------|
| FR-001 | The system SHALL scan a target directory and produce a TECH_MANIFEST JSON describing the tech stack | Must | README.md | Done |
| FR-002 | The system SHALL generate CLAUDE.md with project-specific configuration from TECH_MANIFEST | Must | README.md | Done |
| FR-003 | The system SHALL generate role-based agent definitions (30 agents) with frontmatter and contracts | Must | CLAUDE.md | Done |
| FR-004 | The system SHALL generate workflow skill files (93) with invocation metadata | Must | CLAUDE.md | Done |
| FR-005 | The system SHALL generate automation hooks (44: 25 root + 19 template) with event bindings | Must | docs/ARCHITECTURE.md | Done |
| FR-006 | The system SHALL generate path-scoped rules (11) with frontmatter paths | Must | CLAUDE.md | Done |
| FR-007 | The system SHALL validate all generated artifacts (line counts, JSON validity, hook permissions) | Must | README.md | Done |
| FR-008 | The system SHALL query Smithery MCP registry and install matching servers | Must | CLAUDE.md | Done |
| FR-009 | The system SHALL enforce RBAC by storing role in session.env and checking via PreToolUse hook | Must | docs/adr/0001-enterprise-rbac.md | Done |
| FR-010 | The system SHALL support new-project mode with 8 pre-development phases | Must | CLAUDE.md | Done |
| FR-011 | The system SHALL generate execution reports with scoring (hallucination, regression) | Must | README.md | Done |
| FR-012 | The system SHALL enforce context budget limits (startup <20%, working <60%) | Must | CLAUDE.md | Done |
| FR-013 | The system SHALL detect configuration drift and offer sync repair | Must | CLAUDE.md | Done |
| FR-014 | The system SHALL provide an interactive CLI mode for guided setup | Should | TODO.md | Backlog |
| FR-015 | The system SHALL support a plugin API for custom extensions | Could | TODO.md | Backlog |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement | Target | Measurement | Source |
|----|----------|------------|--------|-------------|--------|
| NFR-001 | Compatibility | Support Node.js >= 18 on Windows, macOS, Linux | 3 platforms | CI matrix | package.json, CONTRIBUTING.md |
| NFR-002 | Dependencies | Zero external npm dependencies | 0 prod deps | package.json audit | CONTRIBUTING.md |
| NFR-003 | Performance | Complete scan-to-validate pipeline in < 5 minutes | < 300s | [?] Benchmark needed | [INFERRED] |
| NFR-004 | Quality | Framework verification score 100% | 69/69 checks | Verification cert | CERT-20260329-FINAL |
| NFR-005 | Testing | Integration test pass rate 100% | 18/18 tests | npm test | TODO.md |
| NFR-006 | Maintainability | All files follow docs/STANDARDS.md conventions | 100% compliance | Code review | docs/STANDARDS.md |
| NFR-007 | Security | No PII in logs, no secrets in generated files | 0 violations | Audit hook | docs/STANDARDS.md |
| NFR-008 | Licensing | MIT license compatible with all usage | MIT | LICENSE file | package.json |

---

## 6. Data Requirements

### Domain Entities (from DOMAIN_MODEL)
| Entity | Key Attributes | Relationships |
|--------|---------------|---------------|
| Agent | name, model, tools, description | belongs to Role, has Skills |
| Skill | name, invocation, context | belongs to Agent category |
| Hook | event, script, timing | bound to Pipeline phase |
| Rule | paths, constraints | scoped to file patterns |
| Role | name, permissions, paths | has Agents, restricted by Scope Guard |
| Session | role, project, domain | stores in session.env |
| Task | id, type, status, owner | tracked in TASK_REGISTRY |
| Tech Manifest | stack, framework, tools | produced by Scanner, consumed by Generator |

- Source: .claude/project/DOMAIN_MODEL.md, docs/GLOSSARY.md

---

## 7. Integration Requirements

| System | Direction | Protocol | Data Format | Source |
|--------|-----------|----------|-------------|--------|
| Smithery MCP Registry | Outbound | HTTPS | JSON | CLAUDE.md |
| GitHub Actions | Outbound | YAML config | CI pipeline | TODO.md |
| npm Registry | Outbound | npm publish | package tarball | package.json |
| Claude API | Runtime | Model invocation | Agent contracts | CLAUDE.md |

---

## 8. As-Is / To-Be Analysis

| Area | As-Is (v2.2.0) | To-Be (Post-MVP) | Gap |
|------|-----------------|-------------------|-----|
| Distribution | Git clone only | npm global install | BL-001: npm publish |
| User Onboarding | CLI + docs | Interactive wizard | BL-002: Interactive mode |
| Extensibility | Fixed agent/skill set | Plugin API | BL-003: Plugin system |
| Marketing | README only | Video + npm page | BL-004: Video walkthrough |
| Metrics | Verification cert | Real-world benchmarks | BL-009: Setup time benchmark |

---

## 9. Assumptions & Constraints

### Assumptions
| # | Assumption | Impact if Wrong | Source |
|---|-----------|----------------|--------|
| A-001 | Teams use Claude Code as their primary AI assistant | Low adoption | README.md |
| A-002 | Node.js 18+ is available on target machines | Install failure | package.json |
| A-003 | Users have git installed for clone-based install | Can't install | CONTRIBUTING.md |
| A-004 | Generated environments don't need post-generation customization for basic use | User friction | [INFERRED] |
| A-005 | npm registry accepts the package without issues | Blocks distribution | MEMORY.md |

### Constraints
| # | Constraint | Type | Source |
|---|-----------|------|--------|
| C-001 | Node.js built-ins only — no external dependencies | Technical | CONTRIBUTING.md |
| C-002 | Cross-platform compatibility (Windows, macOS, Linux) | Technical | CONTRIBUTING.md |
| C-003 | MIT license | Legal | package.json |
| C-004 | Framework verification must pass 100% before release | Quality | docs/verification/ |

---

## 10. Risk Register

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| R-001 | npm publish fails or is rejected | LOW | HIGH | Dry-run test first | @infra |
| R-002 | Claude API changes break agent model references | MED | HIGH | Version-pin models | @architect |
| R-003 | Node.js 18 EOL forces major upgrade | MED | MED | Monitor release schedule | @infra |
| R-004 | Low adoption due to niche market | HIGH | MED | Video + marketing | @strategist |
| R-005 | Context window limits constrain complex workflows | MED | MED | Budget system in place | @architect |
| R-006 | Competitor emerges with similar tooling | MED | MED | First-mover advantage | @strategist |

---

## 11. Acceptance Criteria (Summary)

| # | Criterion | Verification |
|---|-----------|-------------|
| AC-001 | Scanner produces valid TECH_MANIFEST for any Node.js project | Integration test |
| AC-002 | Generator produces all artifacts with zero placeholders | Validation phase |
| AC-003 | All 69 verification checks pass | CERT verification |
| AC-004 | RBAC enforces path restrictions for all 10 roles | Scope guard tests |
| AC-005 | Hooks fire on correct events and block violations | Hook live-fire tests |
| AC-006 | New-project mode produces 8 populated pre-dev documents | Manual verification |

---

## 12. Glossary

See `.claude/project/GLOSSARY.md` for 32 canonical terms.
See `docs/GLOSSARY.md` for the original 13 terms.

---

## 13. Appendices

### A. Related Documents
- Architecture: docs/ARCHITECTURE.md
- Standards: docs/STANDARDS.md
- Domain Model: .claude/project/DOMAIN_MODEL.md
- Test Guide: docs/DOMAIN-TEST-GUIDE.md
- Verification: docs/verification/CERT-20260329-FINAL.md
- ADR-0001: docs/adr/0001-enterprise-rbac.md

### B. Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-01 | @analyst | Initial BRD from document intelligence scan |

---

## 14. Sign-Off Matrix

| Name | Role | Sign-Off | Date |
|------|------|----------|------|
| adnan-prompts | CTO / Author | TBD | — |
| Tech Lead | Configuration Owner | TBD | — |
| Architect | Design Authority | TBD | — |
| QA Lead | Quality Gate | TBD | — |

---

## Changelog
| Date | Author | Change |
|------|--------|--------|
| 2026-04-01 | @analyst | BRD generated from 16 source documents |
