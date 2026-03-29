# Claude Code CI/CD Configuration

**Owner:** DevOps / Platform team
**Purpose:** Headless pipeline sessions — no interactive prompts.

## CI Mode Rules
- All operations are non-interactive
- No user confirmation prompts — use defaults
- Fail fast on any error (exit non-zero)
- Log all operations to branch-scoped audit log

## Allowed Operations
- Run tests, lint, type check
- Run security scans
- Run dependency audits
- Generate coverage reports
- Validate CLAUDE.md version matches HEAD

## Forbidden in CI
- No file modifications outside test artifacts
- No git push (CI pipeline handles this)
- No agent invocations that require user input
- No hooks that prompt for confirmation

## Environment
- CURRENT_ROLE=DevOps
- CI=true
- No .claude/session.env (use environment variables)

## Pipeline Integration
```yaml
# Example GitHub Actions step
- name: Claude Code Validate
  run: |
    claude --headless "/validate-setup"
    claude --headless "/audit-system"
```
