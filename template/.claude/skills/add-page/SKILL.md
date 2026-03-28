---
name: add-page
description: Add a new page/route with layout, data fetching, and navigation integration.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"page name" [--route /path] [--auth required|public]'
---

# Add Page: $ARGUMENTS

## Process
1. Read existing pages for routing and layout patterns
2. Scaffold: page component → route registration → data fetching → layout
3. Add navigation link if applicable
4. Follow project's routing convention (Next.js App Router, Flutter GoRouter, etc.)
5. Run lint + build to verify

## Definition of Done
- Page renders, navigation works, data fetching connected, responsive.

## Next Steps
- Continue development or `/review-pr`.

## Rollback
- **Undo scaffolding:** `git checkout -- <page-dir>/` to revert generated files
- **Remove page:** `git stash` to stash all generated files
- **Re-scaffold differently:** `/add-page "route" --force` to overwrite
