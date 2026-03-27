# Security Model

> Generated during pre-development planning

## Threat Model Overview

### Assets to Protect
| Asset | Classification | Impact if Compromised |
|-------|---------------|----------------------|
| User credentials | CRITICAL | Account takeover, trust loss |
| Payment data | CRITICAL | Financial fraud, legal liability |
| Personal data (PII) | HIGH | Privacy violation, GDPR/CCPA fines |
| API keys/secrets | HIGH | Service abuse, data breach |
| Business data | MEDIUM | Competitive disadvantage |
| Public content | LOW | Reputation damage |

### Trust Boundaries
```
[Internet] --HTTPS--> [Load Balancer/CDN] --> [API Gateway]
                                                    |
                                          [Auth Middleware]
                                                    |
                                    [Application Services]
                                          |         |
                                    [Database]  [External APIs]
```

## Authentication Strategy

### Method
- **Type:** {JWT + Refresh Token | Session-based | OAuth2 + OIDC}
- **Provider:** {Self-hosted | Auth0 | Clerk | Firebase Auth | Supabase Auth}
- **MFA:** {TOTP | SMS | WebAuthn/Passkeys}

### Token Management
| Token | Lifetime | Storage | Rotation |
|-------|----------|---------|----------|
| Access token | {15 min} | {Memory / HTTP-only cookie} | On expiry |
| Refresh token | {7 days} | {HTTP-only secure cookie / Keychain} | On each use (rotation) |
| API key | {No expiry} | {Server-side vault} | Manual rotation |

### Password Policy
- Minimum length: {12 characters}
- Hashing: {bcrypt cost 12 | Argon2id}
- No password reuse (last {5} passwords)
- Account lockout after {5} failed attempts ({15 min} lockout)

## Authorization Strategy

### Model
- **Type:** {RBAC | ABAC | ReBAC}

### Roles & Permissions
| Role | Permissions | Scope |
|------|------------|-------|
| Admin | Full access | Global |
| Manager | Read/Write own team's data | Team |
| User | Read/Write own data | Self |
| Viewer | Read-only | Assigned resources |
| API Consumer | Scoped by API key | Granted endpoints |

### Authorization Enforcement
- **Where:** Middleware layer (never in frontend only)
- **Pattern:** Check permissions BEFORE executing business logic
- **Default:** Deny all, explicitly allow

## Data Protection

### Encryption
| Data State | Method | Standard |
|-----------|--------|----------|
| In transit | TLS 1.3 | All external communication |
| At rest (DB) | AES-256 | PII fields, credentials |
| At rest (files) | AES-256 | Uploaded documents, backups |
| At rest (backups) | AES-256 + separate key | All backups |

### PII Handling
| Data Type | Storage | Access | Retention |
|-----------|---------|--------|-----------|
| Email | Encrypted | Auth + profile services | Account lifetime |
| Phone | Encrypted | Notification service only | Account lifetime |
| Address | Encrypted | Billing/shipping services | {3 years} |
| Payment card | NOT stored (tokenized via {Stripe}) | Payment service only | Token lifetime |
| IP address | Hashed for analytics | Security logging only | {90 days} |

### Data Retention & Deletion
- User data deleted within {30 days} of account deletion request
- Audit logs retained for {1 year}
- Backups retained for {90 days}, then purged
- GDPR/CCPA data export within {30 days} of request

## Input Validation

### Rules
- Validate ALL input at API boundary (never trust client-side validation alone)
- Use allowlists over denylists
- Validate type, length, format, and range
- Sanitize output for context (HTML, SQL, shell, URL)

### Protection Against
| Attack | Mitigation |
|--------|-----------|
| SQL Injection | Parameterized queries / ORM (never string concatenation) |
| XSS | Output encoding, CSP headers, sanitize HTML input |
| CSRF | CSRF tokens for state-changing requests, SameSite cookies |
| SSRF | Allowlist outbound URLs, validate user-supplied URLs |
| Path Traversal | Validate and sanitize file paths, chroot/sandbox |
| Mass Assignment | Explicitly define allowed fields (never pass raw request to model) |
| Insecure Deserialization | Validate/schema-check before deserializing |

## API Security

### Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Rate Limiting
- See API_STANDARDS.md for rate limit configuration
- Implement per-user AND per-IP limits
- Exponential backoff for auth endpoints

### API Key Security
- Never expose in client-side code or URLs
- Scope to minimum required permissions
- Rotate on schedule and on compromise
- Log all API key usage for audit

## Secret Management

### Storage
- **Environment variables** for deployment config (never in code)
- **Vault** ({AWS Secrets Manager | HashiCorp Vault | Doppler}) for production secrets
- **`.env` files** for local development only (gitignored)
- **CI/CD secrets** in platform-native secret store ({GitHub Secrets | GitLab Variables})

### Rotation Schedule
| Secret | Rotation | Method |
|--------|----------|--------|
| DB passwords | {90 days} | Vault auto-rotation |
| API keys | {180 days} | Manual with overlap period |
| JWT signing key | {365 days} | Key rotation with overlap |
| TLS certificates | {Auto-renew} | Let's Encrypt / ACM |

## Logging & Monitoring

### Security Events to Log
- Authentication attempts (success + failure)
- Authorization failures
- Password changes, MFA changes
- Admin actions (role changes, user management)
- API key creation, rotation, revocation
- Data exports and bulk operations
- Rate limit violations

### What NEVER to Log
- Passwords (even hashed)
- Full credit card numbers
- Session tokens / JWTs
- API keys (log last 4 chars only)
- PII beyond what's needed for the log purpose

## Compliance Checklist

- [ ] HTTPS enforced everywhere (HSTS enabled)
- [ ] Secrets not in source code (scan with {gitleaks/trufflehog})
- [ ] Dependencies scanned for vulnerabilities ({Snyk/Dependabot/npm audit})
- [ ] CSP headers configured
- [ ] CORS restricted to known origins
- [ ] Rate limiting on all public endpoints
- [ ] Input validation on all API boundaries
- [ ] Audit logging for security events
- [ ] Data encryption at rest and in transit
- [ ] PII handling documented and compliant
- [ ] Incident response plan documented
- [ ] Regular dependency updates scheduled
