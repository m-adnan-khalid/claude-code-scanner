# Process Flow: 4-Phase Pipeline

**Source:** README.md, docs/ARCHITECTURE.md
**Owner:** @analyst | **Story:** STORY-007

---

## Trigger
User runs `npx claude-code-scanner` or `node bin/cli.js` in a project directory.

## Actors
- **User** — initiates the pipeline
- **Scanner Service** — reads source files, detects tech stack
- **Generator Service** — produces Claude Code artifacts
- **Validator Service** — checks artifact quality
- **Smithery Service** — queries MCP registry

## Narrative
The user points the scanner at a codebase. The Scanner reads all source files and produces a TECH_MANIFEST JSON describing the detected technology stack. The Generator consumes this manifest and produces all Claude Code artifacts (CLAUDE.md, agents, skills, hooks, rules) with placeholders replaced by real values. The Validator checks every artifact against constraints (line counts, JSON validity, permissions). Finally, the Smithery service queries the MCP registry for servers matching the tech stack and installs up to 5 scoped servers.

If validation fails, the user is shown specific errors and can re-run the generator with fixes.

## Flow Diagram

```mermaid
flowchart TD
    A[User runs scanner] --> B[Phase 1: SCAN]
    B --> C{Directory valid?}
    C -->|No| D[Error: invalid path]
    C -->|Yes| E[Read source files recursively]
    E --> F[Detect tech markers]
    F --> G[Produce TECH_MANIFEST JSON]
    
    G --> H[Phase 2: GENERATE]
    H --> I[Load artifact templates]
    I --> J[Replace placeholders with TECH_MANIFEST values]
    J --> K[Write CLAUDE.md + agents + skills + hooks + rules]
    
    K --> L[Phase 3: VALIDATE]
    L --> M{All checks pass?}
    M -->|No| N[Report specific failures]
    N --> O{User fixes?}
    O -->|Yes| H
    O -->|No| P[Exit with warnings]
    M -->|Yes| Q[Phase 4: SMITHERY]
    
    Q --> R[Query MCP registry]
    R --> S{Matches found?}
    S -->|No| T[Skip — no matching servers]
    S -->|Yes| U[Install ≤ 5 MCP servers]
    U --> V[Scope servers to agents]
    
    T --> W[✅ Pipeline Complete]
    V --> W
```

## Decision Points
1. **Directory valid?** — Scanner checks path exists and contains readable files
2. **All checks pass?** — Validator runs all constraint checks
3. **Matches found?** — Smithery queries return relevant MCP servers
4. **User fixes?** — User decides to fix and re-run or exit with warnings

## Business Rules
- BR-001: Scanner reads source files but never writes to the target project
- BR-002: Generator consumes TECH_MANIFEST only — no direct file reading
- BR-003: Validator checks are deterministic and idempotent
- BR-004: Maximum 5 MCP servers installed to manage context budget
