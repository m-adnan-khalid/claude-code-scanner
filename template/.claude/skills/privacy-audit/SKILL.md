---
name: privacy-audit
description: Data privacy and GDPR/CCPA compliance audit. Maps personal data flows, detects PII exposure, validates consent mechanisms, checks data retention, and verifies data subject rights implementation.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--regulation gdpr|ccpa|both] [--scope full|pii-scan|consent|retention|rights] [--fix]'
roles: [CTO, TechLead, Architect, DevOps]
agents: [@security, @code-quality]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# Privacy & Compliance Audit: $ARGUMENTS

## Phase 1: PII Detection Scan

### Scan Codebase for Personal Data
```bash
mkdir -p .claude/reports/privacy

# Scan for PII field names in code
grep -rn --include="*.{ts,js,py,java,go,rb,cs,swift,kt,dart}" \
  -iE "(email|phone|address|ssn|social.?security|passport|birth.?date|date.?of.?birth|first.?name|last.?name|full.?name|credit.?card|card.?number|cvv|password|secret|token|ip.?address|geolocation|biometric|health|medical|race|ethnicity|religion|sexual|political|genetic)" \
  . --include="*.{ts,js,py,java,go,rb,cs}" \
  > .claude/reports/privacy/pii-fields.txt 2>/dev/null

# Scan for PII in database schemas
grep -rn --include="*.{sql,prisma,py,ts,js,rb}" \
  -iE "(CREATE TABLE|model |class.*Model|schema\.|@Column|@Field)" \
  . > .claude/reports/privacy/schema-fields.txt 2>/dev/null

# Scan for PII in API responses
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(response\.|res\.|return.*json|serialize|to_dict|to_json)" \
  . > .claude/reports/privacy/api-responses.txt 2>/dev/null

# Scan for PII in logs
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(console\.log|logger\.|log\.(info|debug|warn|error)|print\(|println)" \
  . > .claude/reports/privacy/log-statements.txt 2>/dev/null

echo "PII fields found: $(wc -l < .claude/reports/privacy/pii-fields.txt)"
echo "Schema refs: $(wc -l < .claude/reports/privacy/schema-fields.txt)"
echo "Log statements: $(wc -l < .claude/reports/privacy/log-statements.txt)"
```

### PII Classification
Review scan results and classify:

| PII Category | Examples | Sensitivity | Regulation |
|-------------|----------|-------------|-----------|
| **Direct Identifiers** | Name, email, phone, SSN | HIGH | GDPR Art.4, CCPA 1798.140 |
| **Indirect Identifiers** | IP address, device ID, cookies | MEDIUM | GDPR Art.4, CCPA |
| **Sensitive/Special** | Health, biometric, race, religion, sexual orientation | CRITICAL | GDPR Art.9, CCPA Sensitive PI |
| **Financial** | Credit card, bank account, payment | HIGH | PCI-DSS, GDPR, CCPA |
| **Location** | GPS, address, geofence | MEDIUM | GDPR, CCPA |
| **Behavioral** | Browsing history, purchase history, preferences | LOW-MEDIUM | CCPA |

## Phase 2: Data Flow Mapping

### Trace PII Through the System
For each PII type found, map:
1. **Collection** — Where is it collected? (forms, APIs, third-party imports)
2. **Processing** — What operations are performed? (storage, transformation, aggregation)
3. **Storage** — Where is it stored? (database, cache, files, logs, third-party)
4. **Sharing** — Is it sent to third parties? (analytics, payment, CRM, ads)
5. **Retention** — How long is it kept? (policy, actual implementation)
6. **Deletion** — Can it be fully deleted? (hard delete, soft delete, cascades)

### Data Flow Checklist
- [ ] PII is encrypted at rest (database, files, backups)
- [ ] PII is encrypted in transit (HTTPS/TLS for all endpoints)
- [ ] PII is not logged in plaintext (check log statements)
- [ ] PII is not exposed in error messages or stack traces
- [ ] PII is not stored in browser localStorage/sessionStorage without encryption
- [ ] PII is not cached in CDN responses
- [ ] PII is not included in analytics events without anonymization
- [ ] PII is not in URL query parameters (can leak via referrer, logs)
- [ ] PII is masked/redacted in non-production environments
- [ ] PII access is restricted by role/permission

## Phase 3: GDPR Compliance Checklist

### Lawful Basis (Art. 6)
- [ ] Each data processing activity has a documented lawful basis
- [ ] Consent is freely given, specific, informed, unambiguous
- [ ] Consent can be withdrawn as easily as given
- [ ] Legitimate interest has balancing test documented

### Data Subject Rights (Art. 12-22)
- [ ] **Right of Access (Art. 15)** — Users can export all their data
- [ ] **Right to Rectification (Art. 16)** — Users can update their data
- [ ] **Right to Erasure (Art. 17)** — Users can delete their account and all data
- [ ] **Right to Restriction (Art. 18)** — Processing can be restricted
- [ ] **Right to Portability (Art. 20)** — Data export in machine-readable format (JSON/CSV)
- [ ] **Right to Object (Art. 21)** — Users can opt out of profiling/marketing
- [ ] Requests fulfilled within 30 days
- [ ] Identity verification before fulfilling requests

### Consent Management
- [ ] Cookie consent banner with granular controls (necessary, functional, analytics, marketing)
- [ ] Consent recorded with timestamp, version, and scope
- [ ] Pre-checked boxes NOT used for consent
- [ ] Third-party consent separately obtained
- [ ] Children's consent handled (if applicable, under-16 parental)

### Data Minimization (Art. 5)
- [ ] Only necessary data collected for each purpose
- [ ] No excessive fields in registration/forms
- [ ] API responses don't include unnecessary PII
- [ ] Database doesn't store data beyond retention period

### Data Retention
- [ ] Retention policy defined per data category
- [ ] Automated deletion after retention period
- [ ] Soft-deleted data permanently purged on schedule
- [ ] Backups respect retention limits

### Data Breach (Art. 33-34)
- [ ] Breach detection mechanisms in place (monitoring, alerts)
- [ ] Breach notification process documented (72-hour DPA notification)
- [ ] Affected user notification process documented
- [ ] Breach log maintained

## Phase 4: CCPA Compliance Checklist

### Consumer Rights (CCPA 1798.100-125)
- [ ] **Right to Know** — Disclose categories and specific pieces of PI collected
- [ ] **Right to Delete** — Delete consumer PI upon request
- [ ] **Right to Opt-Out** — "Do Not Sell/Share My Personal Information" link
- [ ] **Right to Non-Discrimination** — No service denial for exercising rights
- [ ] **Right to Correct** — Correct inaccurate PI
- [ ] **Right to Limit** — Limit use of sensitive PI

### Privacy Policy
- [ ] Categories of PI collected disclosed
- [ ] Purpose of collection disclosed
- [ ] Categories of third parties with whom PI is shared
- [ ] Consumer rights described
- [ ] Updated within last 12 months
- [ ] Accessible from every page (footer link)

### Do Not Sell/Share
- [ ] Opt-out mechanism implemented
- [ ] Opt-out signal respected (GPC — Global Privacy Control)
- [ ] Third-party sharing stops within 15 business days of opt-out

## Phase 5: Technical Controls Verification

```bash
# Check for encryption at rest
grep -rn --include="*.{ts,js,py,java,go,yml,yaml,json}" \
  -iE "(encrypt|AES|RSA|bcrypt|argon2|scrypt|hash|cipher)" \
  . > .claude/reports/privacy/encryption-usage.txt 2>/dev/null

# Check for data masking
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(mask|redact|anonymize|pseudonymize|tokenize|sanitize)" \
  . > .claude/reports/privacy/masking-usage.txt 2>/dev/null

# Check password hashing
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(bcrypt|argon2|scrypt|pbkdf2)" \
  . > .claude/reports/privacy/password-hashing.txt 2>/dev/null

# Check for data export endpoints
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(export|download.*data|data.*portability|gdpr|right.*access)" \
  . > .claude/reports/privacy/data-export.txt 2>/dev/null

# Check for deletion endpoints
grep -rn --include="*.{ts,js,py,java,go}" \
  -iE "(delete.*account|erase|purge|right.*erasure|gdpr.*delete)" \
  . > .claude/reports/privacy/data-deletion.txt 2>/dev/null
```

## Report Template

```markdown
# Privacy & Compliance Audit Report
Date: {ISO timestamp}
Regulation: {GDPR|CCPA|Both}
Scope: {full|pii-scan|consent|retention|rights}

## PII Inventory
| Data Type | Category | Sensitivity | Collected At | Stored In | Shared With | Encrypted | Retention |
|-----------|----------|-------------|-------------|-----------|-------------|-----------|-----------|
| Email | Direct ID | HIGH | Registration | users table | SendGrid | Yes (transit) | Account lifetime |
| IP Address | Indirect ID | MEDIUM | Every request | logs | — | No | 90 days |

## Data Flow Diagram
```
User → [Form/API] → [Validation] → [Database (encrypted)]
                                  → [Cache (TTL)]
                                  → [Logs (masked)]
                                  → [Analytics (anonymized)]
                                  → [Third-party (consent required)]
```

## GDPR Compliance Score
| Area | Score | Critical Issues |
|------|-------|----------------|
| Lawful Basis | N/10 | {issues} |
| Data Subject Rights | N/10 | {issues} |
| Consent Management | N/10 | {issues} |
| Data Minimization | N/10 | {issues} |
| Data Retention | N/10 | {issues} |
| Breach Preparedness | N/10 | {issues} |
| **Overall** | **N/60** | |

## CCPA Compliance Score
| Area | Score | Critical Issues |
|------|-------|----------------|
| Consumer Rights | N/10 | {issues} |
| Privacy Policy | N/10 | {issues} |
| Do Not Sell/Share | N/10 | {issues} |
| **Overall** | **N/30** | |

## Critical Findings
| # | Severity | Regulation | Finding | File:Line | Remediation |
|---|----------|-----------|---------|-----------|-------------|
| 1 | CRITICAL | GDPR Art.17 | No account deletion endpoint | — | Implement DELETE /api/users/me |
| 2 | HIGH | GDPR Art.9 | Health data stored unencrypted | models/user.py:45 | Add field-level encryption |

## Recommendations
1. {Priority 1 fixes}
2. {Priority 2 fixes}
3. {Long-term improvements}

## Evidence
- PII scan: `.claude/reports/privacy/pii-fields.txt`
- Data flow: `.claude/reports/privacy/data-flow.md`
- Encryption audit: `.claude/reports/privacy/encryption-usage.txt`

## Verdict
**COMPLIANT** — All critical requirements met.
OR
**NON-COMPLIANT** — {N} critical findings require remediation.
```

Save to `.claude/reports/privacy/report-{date}.md`

## Definition of Done
- PII detected and classified across codebase
- Data flows mapped (collection → storage → sharing → deletion)
- GDPR checklist evaluated (if applicable)
- CCPA checklist evaluated (if applicable)
- Critical findings documented with remediation guidance
- Report saved to `.claude/reports/privacy/`

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
