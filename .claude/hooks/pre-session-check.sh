#!/bin/bash
# pre-session-check.sh — Session startup hook
# Checks CLAUDE.md version + resumes IN_PROGRESS tasks from previous session

REGISTRY=".claude/project/TASK_REGISTRY.md"
MEMORY="MEMORY.md"

# Version check
if [ -f "CLAUDE.md" ]; then
  CURRENT_VERSION=$(grep "FRAMEWORK VERSION" CLAUDE.md | head -1 | sed 's/.*: //')
  echo "✅ Framework version: $CURRENT_VERSION"
fi

# Check for IN_PROGRESS tasks from previous session
if [ -f "$REGISTRY" ]; then
  IN_PROGRESS=$(grep "IN_PROGRESS" "$REGISTRY" | grep -v "^|.*Metric" || true)
  if [ -n "$IN_PROGRESS" ]; then
    echo ""
    echo "⚠️  Resuming from previous session — IN_PROGRESS tasks found:"
    echo "$IN_PROGRESS" | while IFS='|' read -r _ id type title status _rest; do
      id=$(echo "$id" | xargs)
      title=$(echo "$title" | xargs)
      if [ -n "$id" ] && [ -n "$title" ]; then
        echo "  → $id: $title"
      fi
    done
    echo ""
    echo "Continue where you left off? (Y/N)"
  else
    echo "✅ No pending tasks from previous session"
  fi
else
  echo "⚠️  No TASK_REGISTRY found — run document intelligence installer"
fi

# Check MEMORY.md for last state
if [ -f "$MEMORY" ]; then
  LAST=$(grep "Last Completed" "$MEMORY" | head -1)
  NEXT=$(grep "Next Step" "$MEMORY" | head -1)
  [ -n "$LAST" ] && echo "📋 $LAST"
  [ -n "$NEXT" ] && echo "📋 $NEXT"
fi
