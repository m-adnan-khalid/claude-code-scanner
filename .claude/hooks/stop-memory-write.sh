#!/bin/bash
# stop-memory-write.sh — Session stop hook
# Updates MEMORY.md with current state + snapshots IN_PROGRESS task

MEMORY="MEMORY.md"
REGISTRY=".claude/project/TASK_REGISTRY.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ ! -f "$MEMORY" ]; then
  echo "⚠️  MEMORY.md not found — skipping stop hook"
  exit 0
fi

# Find current IN_PROGRESS task
CURRENT_TASK=""
if [ -f "$REGISTRY" ]; then
  CURRENT_TASK=$(grep "IN_PROGRESS" "$REGISTRY" | head -1 | awk -F'|' '{print $2 " — " $4}' | xargs)
fi

# Count open stories
OPEN_STORIES=0
if [ -f "$REGISTRY" ]; then
  OPEN_STORIES=$(grep -c "TODO\|IN_PROGRESS\|BLOCKED" "$REGISTRY" 2>/dev/null || echo "0")
fi

echo "💾 Session state saved to MEMORY.md"
echo "   In Progress: ${CURRENT_TASK:-None}"
echo "   Open stories: $OPEN_STORIES"
echo "   Timestamp: $TIMESTAMP"
