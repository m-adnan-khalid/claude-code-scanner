# BACKLOG — Claude Code Scanner

**Version:** 2.2.0
**Owner:** @strategist
**Created:** 2026-04-01
**Story:** STORY-003
**Status:** IN_REVIEW

---

## Active Backlog

| ID | Feature | Priority (MoSCoW) | Effort | Value | Owner | Status | Depends On | Notes |
|----|---------|--------------------|--------|-------|-------|--------|------------|-------|
| BL-001 | Publish to npm registry | Must Have | S | HIGH | @infra | TODO | — | Next step per MEMORY.md. Run `npm pack --dry-run` first. Source: TODO.md, MEMORY.md |
| BL-002 | Add interactive CLI mode | Should Have | L | MED | @frontend | TODO | BL-001 | Guided setup wizard for first-time users. Source: TODO.md |
| BL-003 | Create plugin system | Should Have | XL | MED | @architect | TODO | BL-001 | Plugin API for custom agents/skills/hooks. Needs architecture design first. Source: TODO.md |
| BL-004 | Create video walkthrough | Could Have | M | MED | @docs-writer | TODO | BL-001 | Demo video for README + onboarding. Source: TODO.md |
| BL-005 | Reconcile skill count discrepancy | Could Have | S | LOW | @docs-writer | DONE | 2026-04-02 | RESOLVED: Verified 88 skills across all docs. README, CLAUDE.md, commands.md, skills-index.md all aligned. |
| BL-006 | Add GitHub issue/PR templates | Could Have | S | LOW | @infra | TODO | — | Contribution templates for open source community. [INFERRED — confirm with PO] |
| BL-007 | Fill competitive landscape (IDEA_CANVAS gap) | Should Have | M | HIGH | @ideator | TODO | — | Registered as STORY-009 during IDEA_CANVAS population |
| BL-008 | Define adoption metrics and targets | Should Have | S | MED | @strategist | TODO | — | Registered as STORY-010 during IDEA_CANVAS population |
| BL-009 | Benchmark setup time metric | Could Have | M | MED | @qa-lead | TODO | BL-001 | Registered as STORY-011 during IDEA_CANVAS population |

---

## Completed (Archive)

| ID | Feature | Completed | Evidence |
|----|---------|-----------|----------|
| BL-A01 | Complete system audit and resolve all gaps | 2026-03-29 | commit d763c01 — fix all 21 gaps |
| BL-A02 | Add integration tests for CLI | 2026-03-29 | 18 tests, 2 suites passing |
| BL-A03 | Add CI/CD pipeline (GitHub Actions) | 2026-03-29 | .github/workflows configured |
| BL-A04 | Enterprise framework v1.0.0 | 2026-03-29 | commit 997cd8b — RBAC, hooks, agents, docs |
| BL-A05 | Framework verification CONDITIONAL PASS 78/100 | 2026-03-29 | commit 51ea38a |
| BL-A06 | Framework verification CONDITIONAL PASS 93/100 | 2026-03-29 | commit 43b33fa |
| BL-A07 | Framework verification PASS 100/100 | 2026-03-29 | commit ad1f63c — CERT-20260329-FINAL |

- Source: TODO.md, git log, docs/verification/

---

## Feature Tree (Dependencies)

```
BL-001 (npm publish)
├── BL-002 (interactive CLI) — needs published package
├── BL-003 (plugin system) — needs stable distribution
├── BL-004 (video walkthrough) — best recorded after publish
└── BL-009 (benchmark setup time) — needs real-world installs

BL-005 (skill count reconciliation) — independent
BL-006 (issue/PR templates) — independent
BL-007 (competitive landscape) — independent
BL-008 (adoption metrics) — independent
```

---

## Implementation Order (Recommended)

| Order | ID | Rationale |
|-------|----|-----------|
| 1 | BL-001 | Unblocks distribution + 3 dependent items |
| 2 | BL-005 | Quick fix, improves documentation accuracy |
| 3 | BL-006 | Quick win for open source readiness |
| 4 | BL-007 | Strategic — competitive positioning for npm listing |
| 5 | BL-008 | Defines success criteria for launch |
| 6 | BL-004 | Marketing asset for npm page + README |
| 7 | BL-002 | UX improvement for new users |
| 8 | BL-009 | Quantifies value proposition |
| 9 | BL-003 | Extensibility — largest effort, lowest urgency |

---

## Size Reference Guide

| Size | Effort | Examples |
|------|--------|---------|
| S | < 1 day | Config change, doc fix, single-file update |
| M | 1-3 days | New feature with tests, multi-file change |
| L | 3-5 days | Major feature, new subsystem, significant refactor |
| XL | 5+ days | Architecture change, new module, plugin system |

---

## Changelog
| Date | Author | Change |
|------|--------|--------|
| 2026-04-01 | @installer | Story created from document scan |
| 2026-04-01 | @strategist | BACKLOG populated from TODO.md + MEMORY.md + scan results |
