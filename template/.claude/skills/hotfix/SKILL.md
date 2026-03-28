---
name: hotfix
description: Emergency production fix — fast-track workflow that skips non-critical steps. For urgent bugs only.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"critical bug description" [--severity P0|P1]'
---

# Hotfix: $ARGUMENTS

## Fast-Track Flow (skip design review, skip full QA)
1. **Identify**: reproduce the production bug
2. **Fix**: apply minimal targeted fix (invoke @debugger)
3. **Test**: run affected tests + smoke test (invoke @tester)
4. **Security check**: quick @security review if auth/data involved
5. **Deploy**: fast-track to production (invoke @infra)
6. **Monitor**: watch error rates for 15 minutes
7. **Follow-up**: create proper task for comprehensive fix if needed

## Rules
- Hotfix branch from production (not develop)
- Minimal change only — no refactoring, no features
- Must have at least 1 regression test
- Post-deploy monitoring is mandatory
- Create follow-up task for proper fix if hotfix is a band-aid

## Definition of Done
- [ ] Fix deployed to production successfully
- [ ] Monitoring green for 15 minutes post-deploy (error rates, latency)
- [ ] At least one regression test added for the fixed issue
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/workflow new "comprehensive fix for <issue>"` — follow up with proper long-term fix
- **Issues found:** `/rollback deploy` — revert if hotfix causes new issues
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Undo changes:** `/rollback deploy` — revert production to pre-hotfix state
- **Revert to previous state:** `git revert <hotfix-commit>` and redeploy previous version
