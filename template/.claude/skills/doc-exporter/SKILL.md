---
name: doc-exporter
description: Converts completed documents to .docx/.xlsx/.pdf formats. Auto-triggered after any agent completes a document output. Creates a SUBTASK under parent story before converting.
invocation: automatic
---

## Document Export Pipeline

TASK-FIRST: Create subtask [STORY-ID]-SUB-EXPORT: "Export [docname] to [format]"

### Supported Formats

| Format | Use Case | Tool |
|--------|----------|------|
| .md | Always generated | Native |
| .docx | Word-compatible export | pandoc or markdown-to-docx |
| .xlsx | Tabular data export | csv-to-xlsx conversion |
| .pdf | Print-ready export | pandoc with PDF engine |

### Process

1. **Detect completion** — Monitor agent outputs for completed documents (specs, reports, audits, plans).
2. **Create subtask** — File [STORY-ID]-SUB-EXPORT under the parent story in TASK_REGISTRY.
3. **Generate .md** — Always produce the markdown version first as the source of truth.
4. **Offer conversion** — Prompt user: "Export to .docx? (Y/N)" for document outputs.
5. **Convert** — Run conversion pipeline for requested format.
6. **Verify** — Check output file exists, is non-empty, and formatting is preserved.
7. **Mark DONE** — Update subtask status to DONE with output path.

### Output Location

- Exported files saved to `docs/exports/[format]/[docname].[ext]`
- Filename sanitized: lowercase, hyphens, no spaces

### Auto-Trigger Conditions

- Any agent marks a document artifact as complete
- `/feature-done` generates a summary document
- `/product-spec`, `/architecture`, `/qa-plan` produce final outputs
- `/progress-report`, `/org-report` generate status documents

### Logging

- Log each export to AUDIT_LOG: timestamp, source doc, target format, file path, success/failure.
