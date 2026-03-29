# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Full system audit capability with 7-phase checks
- MEMORY.md, TODO.md, AUDIT_LOG.md, RETRY_LOG.md for operational tracking
- Root-level hooks for audit logging, stop recovery, pre-compact archiving
- Formal Input/Output contracts on all 23 agents
- /docs/ folder with changelog and transcript archive

## [2026-03-29] — 100% Coverage Release

### Added
- Microservices, game dev, embedded, CMS, enterprise project templates (045bc88)
- 6 missing skills: i18n, API versioning, feature flags, SEO, CLI, templates (8b35b14)
- Entry-point guide and comprehensive onboarding (cf57327)
- Living domain model with continuous sync (bf443d9)
- Phase 0: mandatory requirement validation (42d684e)

### Fixed
- Eliminated all 4 architectural constraints (d123089)
- Critical bugs: crashing hooks, npm packaging, CLI safety (9d437e4)

### Improved
- Full resilience: crash recovery, undo, disaster recovery, timeout handling (09bd680)
- Regression detection, smoke tests, gatekeeper enforcement (268fb7b)
