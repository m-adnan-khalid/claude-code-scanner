---
name: notion-formatter
description: Formats completed documents as Notion-ready paste blocks. Converts markdown headings, tables, lists, and code blocks into Notion-compatible format.
invocation: manual
---

## Notion Formatter

TASK-FIRST: Create subtask for Notion formatting under the parent story in TASK_REGISTRY.

### Conversion Rules

| Markdown Element | Notion Format |
|-----------------|---------------|
| `# Heading 1` | Notion H1 block |
| `## Heading 2` | Notion H2 block |
| `### Heading 3` | Notion H3 toggle block |
| Tables | Notion database format (pipe-delimited preserved) |
| `- list items` | Notion bulleted list |
| `1. numbered` | Notion numbered list |
| `- [ ] task` | Notion to-do checkbox |
| `` `code` `` | Notion inline code |
| ` ```lang ``` ` | Notion code block with language tag |
| `> blockquote` | Notion callout block |
| `---` | Notion divider |

### Process

1. **Input** — Accept any markdown document path or inline content.
2. **Parse** — Break document into block-level elements.
3. **Convert** — Apply conversion rules for each element type.
4. **Table handling** — Convert markdown tables to Notion database-ready format with column headers as properties.
5. **Output** — Produce Notion-paste-ready text block that preserves formatting when pasted into Notion.
6. **Verify** — Confirm all elements converted, no raw markdown syntax remains in output.

### Usage

```
/notion-formatter docs/spec.md
/notion-formatter docs/architecture.md
```

### Output Location

- Formatted output saved to `docs/exports/notion/[docname]-notion.md`
- Also displayed inline for direct copy-paste

### Logging

- Log each formatting operation to AUDIT_LOG: timestamp, source doc, element count, output path.
