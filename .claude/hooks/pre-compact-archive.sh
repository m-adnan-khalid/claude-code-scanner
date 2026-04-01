#!/bin/bash
# pre-compact-archive.sh — Pre-compact hook
# Archives MEMORY.md + TASK_REGISTRY.md snapshots before context compaction

MEMORY="MEMORY.md"
REGISTRY=".claude/project/TASK_REGISTRY.md"
ARCHIVE_DIR="logs/registry-snapshots"
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")

mkdir -p "$ARCHIVE_DIR"

# Snapshot MEMORY.md
if [ -f "$MEMORY" ]; then
  cp "$MEMORY" "$ARCHIVE_DIR/MEMORY-$TIMESTAMP.md"
  echo "📦 MEMORY.md archived → $ARCHIVE_DIR/MEMORY-$TIMESTAMP.md"
fi

# Snapshot TASK_REGISTRY.md
if [ -f "$REGISTRY" ]; then
  cp "$REGISTRY" "$ARCHIVE_DIR/TASK_REGISTRY-$TIMESTAMP.md"
  echo "📦 TASK_REGISTRY archived → $ARCHIVE_DIR/TASK_REGISTRY-$TIMESTAMP.md"
fi

echo "✅ Pre-compact archive complete"
