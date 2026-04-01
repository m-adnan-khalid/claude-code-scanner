---
name: review-pr
description: Review a pull request — check code quality, test coverage, security, architecture alignment, and conventions.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[PR-number|branch-name]"
roles: [TechLead, Architect, BackendDev, FrontendDev, FullStackDev]
agents: [@reviewer, @security, @code-quality]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Review PR: $ARGUMENTS

## Process
1. Read the diff (git diff main...branch or gh pr diff)
2. Invoke @reviewer for code quality review
3. Invoke @security for security review (if auth/data changes)
4. Check test coverage delta
5. Verify architecture alignment
6. Output structured review with APPROVE / REQUEST_CHANGES / COMMENT

## Definition of Done
- [ ] All review criteria checked (code quality, tests, security, architecture)
- [ ] Verdict given: APPROVE, REQUEST_CHANGES, or COMMENT
- [ ] Blocking issues explicitly listed with severity and remediation
All criteria must pass before this task is marked complete.

## Next Steps
- **Success:** `/deploy staging` — approved PR is ready for deployment
- **Issues found:** `/fix-bug "review feedback"` — address requested changes
- **Coverage check:** `/coverage-track` — verify coverage delta before merge
- **Skip to next task:** `/mvp-kickoff next` or `/workflow resume TASK-{id}`

## Rollback
- **Re-request review:** `/review-pr {PR-number}` to review again after changes
- **Dismiss review:** Use `gh pr review --dismiss` to clear stale reviews
- **Return to dev:** `/workflow dev TASK-{id}` to make additional changes

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
