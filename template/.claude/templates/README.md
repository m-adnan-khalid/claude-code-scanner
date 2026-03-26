# Code Templates

This directory contains code scaffolding templates extracted from the REAL codebase during `/generate-environment`. Templates are NOT invented — they are skeletons derived from actual existing files.

## How Templates Are Extracted
1. Read 3-5 existing files of each type
2. Identify the common skeleton (imports, structure, patterns, exports)
3. Replace specific values with `{placeholder}` markers
4. Save as a markdown file with the template in a code block

## Expected Templates (generated per project)
- `component.md` — UI component skeleton (if frontend exists)
- `api-endpoint.md` — API route/handler/service skeleton (if backend API exists)
- `service.md` — Business logic service skeleton
- `model.md` — Data model/entity skeleton (if ORM exists)
- `test.md` — Test file skeleton matching project patterns
- `hook.md` — React hook / lifecycle hook skeleton (if applicable)
- `migration.md` — Database migration skeleton (if migrations exist)
- `middleware.md` — Middleware skeleton (if middleware pattern detected)

## Template Format
```markdown
# Template: {type}
Source: extracted from {list of source files}
Pattern: {pattern name}

\`\`\`{language}
{template code with {placeholders}}
\`\`\`

## Usage
{when to use this template}

## Customization Points
- {placeholder1}: {what to replace with}
- {placeholder2}: {what to replace with}
```

## Important
- Templates are EMPTY until `/generate-environment` runs
- Never invent patterns — only extract from existing code
- Update templates when codebase patterns change significantly
