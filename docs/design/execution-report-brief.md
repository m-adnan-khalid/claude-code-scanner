# Design Brief: Execution Report

**Source:** README.md, docs/DOMAIN-TEST-GUIDE.md
**Owner:** @analyst | **Story:** STORY-008
**Linked Requirements:** FR-011, FR-PIPE-003

---

## 1. Overview
Design the execution report output that summarizes agent work quality — including scoring, hallucination detection, regression monitoring, and turn/file metrics.

## 2. User Context
**Persona:** Tech Lead or CTO reviewing agent output quality
**Entry Point:** `/execution-report` command or automatic after agent completion
**Goal:** Quickly assess if agent output is trustworthy and complete

## 3. Layout
```
╔══════════════════════════════════════════════╗
║  EXECUTION REPORT — @agent-name              ║
║  Task: TASK-XXX | Duration: Xs | Turns: N    ║
╠══════════════════════════════════════════════╣
║  QUALITY SCORE: 87/100                       ║
║  ├── Specificity:    9/10                    ║
║  ├── Role Alignment: 8/10                    ║
║  ├── Domain/Glossary: 9/10                   ║
║  ├── Memory Context:  8/10                   ║
║  └── Risk Assessment: 9/10                   ║
╠══════════════════════════════════════════════╣
║  FILES: 3 read | 2 modified | 1 created      ║
║  HALLUCINATION FLAGS: CLEAN ✅               ║
║  REGRESSION FLAGS: CLEAN ✅                  ║
║  COVERAGE DELTA: +2.3%                       ║
╠══════════════════════════════════════════════╣
║  VERDICT: ✅ PASS — output verified          ║
╚══════════════════════════════════════════════╝
```

## 4. Components
- **Header:** Agent name, task ID, duration, turn count
- **Quality Score:** 5-dimension scoring with individual + total
- **File Metrics:** Read/modified/created counts
- **Quality Flags:** Hallucination + regression detection
- **Coverage Delta:** Test coverage change (if applicable)
- **Verdict:** PASS/WARN/FAIL with one-line summary

## 5. Interactions
- Report generated automatically after agent HANDOFF
- Can be re-generated on demand via `/execution-report`
- Logged to AUDIT_LOG for historical tracking

## 6. States
- **PASS:** Score >= 80, no flags → Green verdict
- **WARN:** Score 60-79 OR minor flags → Yellow verdict with specific concerns
- **FAIL:** Score < 60 OR critical flags → Red verdict with required actions

## 7. Design Tokens (Terminal)
- Score colors: Green (>= 80), Yellow (60-79), Red (< 60)
- Box: Double-line box-drawing (═, ║, ╔, ╗, ╚, ╝)
- Tree: └── ├── for score breakdown
- Flags: ✅ CLEAN | ⚠️ DETECTED | ❌ CRITICAL

## 8. Accessibility
- Scores shown numerically (not just color bars)
- Text labels on every metric (screen-reader friendly)
- Verdict includes text explanation, not just emoji

## 9. Constraints
- Must fit within 80-column terminal width
- Must render correctly in monospace font
- No external charting libraries

## 10. Open Questions
- [?] Should historical trend be shown? (last 5 reports) Source: no spec found
- [?] Should report auto-save to a file? Source: currently only in AUDIT_LOG
