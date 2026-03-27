#!/bin/bash
# Claude Code Scanner — Quick Install
# Usage: git clone https://github.com/m-adnan-khalid/claude-code-scanner.git
# Or:    bash install.sh

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

REPO="m-adnan-khalid/claude-code-scanner"
BRANCH="main"

echo -e "\n${BOLD}${CYAN}Claude Code Scanner — Installing...${NC}\n"

# Check if we're in a project directory
if [ ! -f "package.json" ] && [ ! -f "go.mod" ] && [ ! -f "Cargo.toml" ] && [ ! -f "requirements.txt" ] && [ ! -f "Gemfile" ] && [ ! -f "pom.xml" ] && ! ls *.csproj 1>/dev/null 2>&1 && [ ! -f "pyproject.toml" ]; then
  echo -e "${YELLOW}Warning: No project files detected. Are you in the right directory?${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

# Download and extract
TMPDIR=$(mktemp -d)
echo "Downloading from GitHub..."
curl -fsSL "https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz" | tar xz -C "$TMPDIR"

SRC="$TMPDIR/claude-code-scanner-${BRANCH}/template"

# Copy CLAUDE.md
if [ -f "CLAUDE.md" ]; then
  echo -e "${YELLOW}! CLAUDE.md exists — backing up to CLAUDE.md.backup${NC}"
  cp CLAUDE.md CLAUDE.md.backup
fi
cp "$SRC/CLAUDE.md" ./CLAUDE.md
echo -e "${GREEN}✓${NC} CLAUDE.md"

# Copy .claude/ directories
for dir in rules agents skills hooks scripts docs templates profiles; do
  if [ -d "$SRC/.claude/$dir" ]; then
    mkdir -p ".claude/$dir"
    cp -r "$SRC/.claude/$dir/"* ".claude/$dir/" 2>/dev/null || true
    COUNT=$(find ".claude/$dir" -type f | wc -l)
    echo -e "${GREEN}✓${NC} .claude/$dir/ ($COUNT files)"
  fi
done

# Copy settings
if [ -f "$SRC/.claude/settings.json" ]; then
  if [ ! -f ".claude/settings.json" ]; then
    cp "$SRC/.claude/settings.json" ".claude/settings.json"
    echo -e "${GREEN}✓${NC} .claude/settings.json"
  else
    echo -e "${YELLOW}!${NC} .claude/settings.json exists — skipped"
  fi
fi

# Create settings.local.json
if [ ! -f ".claude/settings.local.json" ]; then
  echo '{ "env": {} }' > ".claude/settings.local.json"
  echo -e "${GREEN}✓${NC} .claude/settings.local.json (template)"
fi

# Create task/report dirs
mkdir -p .claude/tasks .claude/reports/daily .claude/reports/executions
echo -e "${GREEN}✓${NC} .claude/tasks/ and .claude/reports/"

# Copy manifest.json for drift detection
if [ -f "$SRC/.claude/manifest.json" ]; then
  if [ ! -f ".claude/manifest.json" ]; then
    cp "$SRC/.claude/manifest.json" ".claude/manifest.json"
    echo -e "${GREEN}✓${NC} .claude/manifest.json (drift tracking)"
  fi
fi

# Make hooks executable
chmod +x .claude/hooks/*.js 2>/dev/null || true
echo -e "${GREEN}✓${NC} Hook scripts marked executable"

# Update .gitignore
GITIGNORE_ENTRIES=".claude/settings.local.json
.claude/agent-memory-local/
.claude/tasks/
.claude/reports/"

if [ -f ".gitignore" ]; then
  echo "" >> .gitignore
  echo "# Claude Code local files" >> .gitignore
  while IFS= read -r entry; do
    [ -z "$entry" ] && continue
    grep -qF "$entry" .gitignore || echo "$entry" >> .gitignore
  done <<< "$GITIGNORE_ENTRIES"
else
  echo "# Claude Code local files" > .gitignore
  echo "$GITIGNORE_ENTRIES" >> .gitignore
fi
echo -e "${GREEN}✓${NC} .gitignore updated"

# Cleanup
rm -rf "$TMPDIR"

echo -e "\n${BOLD}${GREEN}Setup complete!${NC}\n"
echo -e "Next steps:"
echo -e "  ${BOLD}1.${NC} claude"
echo -e "  ${BOLD}2.${NC} /scan-codebase          ${CYAN}# Scan your tech stack${NC}"
echo -e "  ${BOLD}3.${NC} /generate-environment   ${CYAN}# Generate customized environment${NC}"
echo -e "  ${BOLD}4.${NC} /validate-setup          ${CYAN}# Verify everything works${NC}"
echo ""
