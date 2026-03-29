<!-- AUTO-FILLED: This template is populated after incidents. Fill in details during the post-mortem review meeting. -->

# Post-Mortem: {Incident Title}

> Date: {YYYY-MM-DD} | Severity: SEV{N} | Duration: {duration}

## Incident Summary

| Field | Value |
|-------|-------|
| Date/Time | {start time} — {end time} |
| Duration | {total duration} |
| Severity | SEV{N} |
| Impact | {users/systems affected, e.g., "~500 users unable to login for 45 min"} |
| Detection | {how it was detected: alert, customer report, internal} |
| Resolution | {how it was resolved: rollback, hotfix, config change} |

## Timeline

| Time (UTC) | Event |
|------------|-------|
| {HH:MM} | {First indicator / alert fired} |
| {HH:MM} | {Incident declared, team assembled} |
| {HH:MM} | {Root cause identified} |
| {HH:MM} | {Mitigation applied} |
| {HH:MM} | {Fix deployed} |
| {HH:MM} | {All-clear declared} |

## Root Cause Analysis

### What happened
{Describe the technical failure chain}

### 5 Whys
1. **Why** did the outage occur? {answer}
2. **Why** did that happen? {answer}
3. **Why** did that happen? {answer}
4. **Why** did that happen? {answer}
5. **Why** did that happen? {root cause}

## What Went Well

- {e.g., "Alert fired within 2 minutes of issue starting"}
- {e.g., "Rollback procedure worked smoothly"}
- {e.g., "Team assembled quickly"}

## What Went Wrong

- {e.g., "No test coverage for the failing code path"}
- {e.g., "Monitoring didn't catch the slow degradation before full failure"}
- {e.g., "Runbook was outdated"}

## Action Items

| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | {preventive action} | {owner} | {date} | TODO |
| 2 | {detective action} | {owner} | {date} | TODO |
| 3 | {process improvement} | {owner} | {date} | TODO |

## Lessons Learned

{Key takeaways that should inform future architecture, testing, or process decisions}

---
*Post-mortem conducted by: {facilitator} on {date}*
*Attendees: {list}*
