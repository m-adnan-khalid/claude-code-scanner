#!/bin/bash
# post-write-log.sh — Post-write audit hook
# Logs file writes to AUDIT_LOG and auto-updates subtask status

AUDIT_LOG="AUDIT_LOG.md"
REGISTRY=".claude/project/TASK_REGISTRY.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

FILE_PATH="$1"
AGENT="${2:-@installer}"

# Log to AUDIT_LOG
if [ -f "$AUDIT_LOG" ] && [ -n "$FILE_PATH" ]; then
  echo "| $TIMESTAMP | $AGENT | WRITE | $FILE_PATH | — |" >> "$AUDIT_LOG"
fi

# Auto-detect story output and update subtask status
case "$FILE_PATH" in
  *IDEA_CANVAS*)
    echo "📝 IDEA_CANVAS written — check STORY-001 subtasks"
    ;;
  *PRODUCT_SPEC*)
    echo "📝 PRODUCT_SPEC written — check STORY-002 subtasks"
    ;;
  *BACKLOG*)
    echo "📝 BACKLOG written — check STORY-003 subtasks"
    ;;
  *DOMAIN_MODEL*|*GLOSSARY*)
    echo "📝 Domain model written — check STORY-004 subtasks"
    ;;
  *BRD*)
    echo "📝 BRD written — check STORY-005 subtasks"
    ;;
  *requirements/*)
    echo "📝 Requirements written — check STORY-006 subtasks"
    ;;
  *flows/*)
    echo "📝 Process flow written — check STORY-007 subtasks"
    ;;
  *design/*-brief*)
    echo "📝 Design brief written — check STORY-008 subtasks"
    ;;
esac
