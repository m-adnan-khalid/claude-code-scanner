---
name: feature-flags
description: >
  Feature flag management — add flags, configure rollout, check flag usage in code,
  clean up stale flags, and integrate with LaunchDarkly/Unleash/Flagsmith/custom.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[add FLAG_NAME | remove FLAG_NAME | status | cleanup | rollout FLAG_NAME 50%]"
effort: high
roles: [BackendDev, FullStackDev, FrontendDev, TechLead, DevOps]
agents: [@api-builder, @frontend, @infra, @tester]
---

# /feature-flags $ARGUMENTS

## Commands
- `/feature-flags add DARK_MODE` — Add new flag with default off, guarded code block
- `/feature-flags remove DARK_MODE` — Remove flag, replace with permanent on/off path, clean dead code
- `/feature-flags status` — Show all flags: name, state, age, code references, rollout %
- `/feature-flags cleanup` — Find stale flags (>30 days at 100% or 0%) and suggest removal
- `/feature-flags rollout DARK_MODE 50%` — Update rollout percentage (gradual release)

## Process

### Add Flag
1. Detect flag system: LaunchDarkly, Unleash, Flagsmith, Flipper, custom env-based
2. If no system detected: create simple env-based flag (`FEATURE_DARK_MODE=false`)
3. Add flag definition to config/flags file
4. Generate guarded code template:
   ```
   if (isFeatureEnabled('DARK_MODE')) {
     // new behavior
   } else {
     // existing behavior
   }
   ```
5. Add flag to documentation

### Remove Flag (Clean Up)
1. Find ALL code references to the flag (Grep across codebase)
2. For each reference: replace conditional with the permanent path (on or off)
3. Remove dead code branch
4. Remove flag from config
5. Run tests to verify no regressions

### Cleanup
1. Scan all flags for staleness: created >30 days ago AND at 100% rollout → suggest remove
2. Find flags at 0% for >14 days → suggest remove (abandoned experiment)
3. Find flags referenced in code but missing from config → warn (orphaned)
4. Find flags in config but not referenced in code → warn (unused)

## Definition of Done
- Flag added/removed with zero dead code left behind
- All code paths tested (flag on AND flag off)
- Stale flags identified and removal plan documented
