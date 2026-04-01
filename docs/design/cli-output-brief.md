# Design Brief: CLI Output

**Source:** README.md, docs/DOMAIN-TEST-GUIDE.md
**Owner:** @analyst | **Story:** STORY-008
**Linked Requirements:** FR-PIPE-003, FR-001, FR-011

---

## 1. Overview
Design the terminal output formatting for Claude Code Scanner's CLI — covering pipeline progress, validation results, execution reports, and error messages.

## 2. User Context
**Persona:** Developer running the scanner in a terminal (VS Code, iTerm, Windows Terminal)
**Entry Point:** `npx claude-code-scanner` or `node bin/cli.js`
**Goal:** Understand pipeline progress, see validation results, know what to do next

## 3. Layout
```
┌─────────────────────────────────────────┐
│ Header: Tool name + version             │
├─────────────────────────────────────────┤
│ Phase indicator: [1/4] SCANNING...      │
│ Progress: file-by-file status lines     │
│   ✅ src/api/ — Express + TypeScript    │
│   ✅ src/ui/ — React + Tailwind        │
│   ⚠️ config/ — no framework detected    │
├─────────────────────────────────────────┤
│ Summary table: TECH_MANIFEST preview    │
├─────────────────────────────────────────┤
│ Next phase prompt or final report       │
└─────────────────────────────────────────┘
```

## 4. Components
- **Phase Header:** `[n/4] PHASE_NAME` with emoji indicator
- **Progress Lines:** Per-file/directory status with ✅/⚠️/❌ prefix
- **Summary Tables:** Bordered ASCII tables for TECH_MANIFEST, validation results
- **Final Report:** Boxed summary with counts, next actions
- **Error Messages:** Red prefix `❌ ERROR:` with specific file/line reference

## 5. Interactions
- Pipeline runs non-interactively (no prompts during phases)
- Final report shows next command to run
- Errors show specific fix instructions

## 6. States
- **Running:** Phase indicator + progress lines streaming
- **Success:** Green ✅ with summary + next action
- **Warning:** Yellow ⚠️ with specific items + how to fix
- **Error:** Red ❌ with error message + fix command
- **Empty:** "No files found in [path]. Check the directory."

## 7. Design Tokens (Terminal)
- Success: Green (ANSI 32)
- Warning: Yellow (ANSI 33)
- Error: Red (ANSI 31)
- Info: Cyan (ANSI 36)
- Headers: Bold (ANSI 1)
- Tables: Box-drawing characters (─, │, ┌, ┐, └, ┘)

## 8. Accessibility
- All status conveyed by text prefix (not just color): ✅, ⚠️, ❌
- No animation that could cause issues — static line output
- Table data readable without box-drawing characters

## 9. Constraints
- Must work on Windows Terminal, macOS Terminal, iTerm, VS Code terminal
- Unicode support assumed (emoji + box-drawing)
- No external rendering dependencies (Node.js console only)

## 10. Open Questions
- [?] Should progress show a spinner or just static lines? Source: no spec found
- [?] Should verbose mode show file-by-file detail? Source: no `-v` flag defined
