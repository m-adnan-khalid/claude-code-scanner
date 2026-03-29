#!/bin/bash

# pre-session.sh — Session start hook wrapper
# Runs version drift detection on session start.
# Delegates to version-check.js for CLAUDE.md drift detection.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Run version drift check
if [ -f "$SCRIPT_DIR/version-check.js" ]; then
  echo '{}' | node "$SCRIPT_DIR/version-check.js"
  if [ $? -ne 0 ]; then
    echo "⚠️  CLAUDE.md version drift detected — run: git pull && restart session"
    exit 1
  fi
fi

# Verify session.env exists
if [ ! -f "$PROJECT_ROOT/.claude/session.env" ]; then
  echo "⚠️  No session.env found. Run /setup-workspace to set your role."
fi

exit 0
