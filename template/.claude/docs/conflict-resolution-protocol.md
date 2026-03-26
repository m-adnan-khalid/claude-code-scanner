# Conflict Resolution Protocol

## When Conflicts Happen

Parallel agents using `isolation: worktree` (like @api-builder + @frontend in fullstack tasks) work on isolated copies of the repo. Conflicts arise when both modify:
- Shared type definitions
- Shared utility functions
- Package.json / lock files
- Configuration files
- API contracts (one side produces, other consumes)

## Prevention (Before Parallel Work)

### 1. API Contract First
Before splitting into parallel:
1. @architect defines the API contract (request/response shapes, endpoints)
2. Both agents receive the contract in their HANDOFF
3. @api-builder implements the backend matching the contract
4. @frontend implements against the contract (can mock until backend ready)

### 2. File Ownership Boundaries
@team-lead explicitly assigns file boundaries:
```
@api-builder scope: src/api/**, src/services/**, src/models/**, migrations/**
@frontend scope: src/components/**, src/pages/**, src/hooks/**, src/styles/**
SHARED (neither modifies without coordination): src/types/**, src/utils/**, package.json
```

### 3. Shared Files Protocol
For files both agents need to modify:
1. @team-lead creates the shared changes FIRST (types, interfaces, utils)
2. Both agents receive the updated shared files in their worktree
3. Neither agent modifies shared files during parallel work

## Resolution (After Parallel Work)

### Merge Order
1. **Backend first**: @api-builder's worktree merges to main branch
2. **Resolve types**: @team-lead resolves any type/interface conflicts
3. **Frontend second**: @frontend's worktree merges, adapting to final backend

### Conflict Resolution Steps
1. **Detect**: `git merge --no-commit` to preview conflicts
2. **Classify**:
   - **Trivial**: Both added to same file but different sections -> auto-merge
   - **Type conflict**: Shared interface changed differently -> @architect decides
   - **Logic conflict**: Both modified same function -> @team-lead reviews both approaches
3. **Resolve**:
   - For type conflicts: choose the version matching the API contract
   - For logic conflicts: @reviewer examines both, picks or combines
   - For package.json: merge deps from both, regenerate lock file
4. **Verify**: Run full test suite after merge
5. **Log**: Record conflict resolution in task record Decision Log

### If Auto-Merge Fails
```
@team-lead:
1. Read both worktree diffs
2. Identify conflicting files
3. For each conflict:
   a. Determine which agent's version is correct per the API contract
   b. If both are valid partial changes, manually combine
   c. If fundamentally incompatible, @architect redesigns the shared interface
4. Apply resolution
5. Run tests
6. Log decision
```

## Task Record Entry
```markdown
### Conflict Resolution
| Timestamp | Files | Agents | Resolution | Decided By |
|-----------|-------|--------|-----------|------------|
| {ts} | src/types/api.ts | @api-builder vs @frontend | Used backend types, frontend adapted | @team-lead |
```

## Cross-Task Dependencies
When TASK-002 depends on TASK-001:
1. Add to TASK-002 frontmatter: `depends-on: TASK-001`
2. TASK-002 cannot enter Phase 5 (Development) until TASK-001 reaches Phase 8 (PR+CI)
3. @team-lead enforces this ordering
4. If TASK-001 is blocked, TASK-002 is automatically blocked with reason
