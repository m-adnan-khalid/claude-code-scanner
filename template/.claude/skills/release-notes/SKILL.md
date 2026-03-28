---
name: release-notes
description: >
  Generate release notes and changelogs from completed features, task records, and
  execution reports. Produces user-facing summaries, technical changelogs, and
  migration guides. Use after /launch-mvp or after deploying any feature set.
user-invocable: true
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
argument-hint: '[version] [--format user|technical|full] [--since TASK-id|date]'
effort: medium
---

# /release-notes — Changelog & Release Notes Generator

## Usage
```
/release-notes v1.0.0                     # Generate for specific version
/release-notes --format user              # User-facing (non-technical)
/release-notes --format technical         # Developer-facing (API changes, breaking changes)
/release-notes --format full              # Both user + technical
/release-notes --since TASK-003           # Changes since a specific task
/release-notes --since 2026-03-20         # Changes since a date
```

## Process

### Step 1: Gather Changes
```
1. Read .claude/project/BACKLOG.md for completed features
2. Scan .claude/tasks/TASK-*.md for CLOSED tasks since last release
3. Read each task's Phase 5 details (files changed, APIs added)
4. Read execution reports for quality metrics
5. Read git log for commit history (if available)
6. Read ARCHITECTURE.md for API contract changes
```

### Step 2: Categorize Changes
```
For each completed task:
  - Type: Feature | Enhancement | Bug Fix | Performance | Security | Docs
  - Scope: Frontend | Backend | API | Database | Infrastructure | Full Stack
  - Breaking: Yes/No (API changes, schema migrations, config changes)
  - User-visible: Yes/No
```

### Step 3: Generate Output

**User-facing format:**
```markdown
# What's New in v1.0.0

## New Features
- **User Authentication** — Sign up, log in, and manage your account securely
- **Dashboard** — See your data at a glance with real-time stats
- **Settings** — Customize your experience with profile and preferences

## Improvements
- Faster page load times (40% improvement)
- Better error messages when things go wrong

## Bug Fixes
- Fixed issue where login would fail on mobile browsers
```

**Technical format:**
```markdown
# Release v1.0.0

## API Changes
### New Endpoints
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — JWT authentication
- `GET /api/stats` — Dashboard statistics

### Breaking Changes
- None in this release

## Database Migrations
- `001_create_users.sql` — Users table with email, password_hash, role
- `002_create_stats.sql` — Stats aggregation table

## Configuration Changes
- New env vars: `JWT_SECRET`, `JWT_EXPIRY`, `DATABASE_URL`

## Dependencies
- Added: express@4.18, prisma@5.10, jsonwebtoken@9.0
- Updated: none
- Removed: none

## Quality Metrics
- Test coverage: 86%
- Total tests: 142
- QA bugs found and resolved: 3
```

### Step 4: Save
```
Save to: .claude/reports/release-notes-{version}.md
Update: CHANGELOG.md in project root (append)
```

## Outputs
- `.claude/reports/release-notes-{version}.md`
- `CHANGELOG.md` (project root, appended)

## Definition of Done
- Release notes cover all changes, audience-appropriate, linked to issues/PRs.

## Next Steps
- `/deploy` for release, `/changelog` to update.

## Rollback
- **Regenerate notes:** `/release-notes --force` with different parameters
- **Revert file changes:** `git checkout -- RELEASE_NOTES.md` to undo edits
