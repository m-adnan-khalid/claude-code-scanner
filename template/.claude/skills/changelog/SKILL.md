---
name: changelog
description: Maintain changelog from git history or manual entries. Uses keep-a-changelog format.
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: "[--from-git|--add 'entry'] [--version X.Y.Z]"
---

# Changelog: $ARGUMENTS

## Process
1. Read existing CHANGELOG.md (or create if missing)
2. If --from-git: parse recent commits for changelog entries
3. If --add: add manual entry to Unreleased section
4. If --version: move Unreleased to new version section with date
5. Follow keep-a-changelog format: Added, Changed, Fixed, Removed

## Definition of Done
- Changelog updated, follows keep-a-changelog format, version bumped if applicable.

## Next Steps
- `/release-notes` for release.

## Rollback
- **Undo changelog update:** `git checkout -- CHANGELOG.md` to revert changes
- **Regenerate:** `/changelog --force` to rebuild from git history
