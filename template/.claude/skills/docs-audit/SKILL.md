---
name: docs-audit
description: Documentation quality audit — API docs completeness, README quality, ADR validation, inline code documentation coverage, and changelog compliance.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--scope full|api|readme|adr|changelog|code-comments] [--fix]'
roles: [CTO, TechLead, Architect, DevOps]
agents: [@docs-writer, @code-quality, @reviewer]
---

# Documentation Audit: $ARGUMENTS

## Phase 1: README Quality Check

```bash
mkdir -p .claude/reports/docs

echo "=== README Quality ==="
README=$(ls README.md readme.md README.rst readme.rst 2>/dev/null | head -1)
if [ -z "$README" ]; then
  echo "CRITICAL: No README file found"
else
  echo "File: $README ($(wc -l < $README) lines)"

  # Check for essential sections
  for section in "Install" "Usage" "Getting Started" "Setup" "Configur" "API" "Contributing" "License"; do
    grep -qi "$section" "$README" && echo "  OK: $section section found" || echo "  MISSING: $section section"
  done

  # Check for badges
  grep -q "badge\|shield\|img.shields" "$README" && echo "  OK: Badges present" || echo "  OPTIONAL: No badges"

  # Check for code examples
  grep -q '```' "$README" && echo "  OK: Code examples present" || echo "  WARN: No code examples"

  # Check for broken links (basic)
  grep -oE 'https?://[^ )]+' "$README" 2>/dev/null | head -5 > .claude/reports/docs/readme-links.txt
  echo "  Links found: $(wc -l < .claude/reports/docs/readme-links.txt)"
fi
```

### README Scoring Rubric
| Criteria | Points | Check |
|----------|--------|-------|
| Exists | 5 | File present |
| Project description (first paragraph) | 10 | Clear what the project does |
| Installation/setup instructions | 15 | Can a new dev get started? |
| Usage examples with code | 15 | At least 1 code example |
| API documentation or link | 10 | Endpoints/functions documented |
| Configuration/environment variables | 10 | All required config listed |
| Contributing guidelines | 5 | How to contribute |
| License | 5 | License type stated |
| Prerequisites/requirements | 10 | Node version, OS, etc. |
| Tests instructions | 10 | How to run tests |
| No placeholder text | 5 | No "TODO", "Lorem ipsum" |
| **Total** | **100** | |

## Phase 2: API Documentation Audit

```bash
echo "=== API Documentation ==="
# Check for OpenAPI/Swagger spec
SPEC=$(ls openapi.yaml openapi.json swagger.yaml swagger.json api-spec.* 2>/dev/null | head -1)
if [ -n "$SPEC" ]; then
  echo "OpenAPI spec: $SPEC"

  # Validate spec
  npx @apidevtools/swagger-cli validate "$SPEC" 2>&1 | tee .claude/reports/docs/openapi-validation.txt

  # Count endpoints
  grep -cE "^\s+/(.*):$" "$SPEC" 2>/dev/null || \
    python3 -c "import json,yaml; d=yaml.safe_load(open('$SPEC')) if '$SPEC'.endswith('.yaml') else json.load(open('$SPEC')); print(f'Endpoints: {sum(len(v) for v in d.get(\"paths\",{}).values())}')" 2>/dev/null
else
  echo "WARN: No OpenAPI spec found"
fi

# Check for API docs in code
echo ""
echo "=== Inline API Documentation ==="
# JSDoc/TSDoc
JSDOC_COUNT=$(grep -rc "@param\|@returns\|@description\|@swagger\|@openapi" --include="*.{ts,js}" . 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
echo "JSDoc/TSDoc annotations: ${JSDOC_COUNT:-0}"

# Python docstrings
DOCSTRING_COUNT=$(grep -rc '"""' --include="*.py" . 2>/dev/null | awk -F: '{sum += $2} END {print sum/2}')
echo "Python docstrings: ${DOCSTRING_COUNT:-0}"

# Go doc comments
GODOC_COUNT=$(grep -rc "^// " --include="*.go" . 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
echo "Go doc comments: ${GODOC_COUNT:-0}"
```

### API Doc Completeness Check
For each API endpoint, verify:
- [ ] Description of what it does
- [ ] Request parameters documented (path, query, body)
- [ ] Request body schema/example
- [ ] Response schema/example for each status code
- [ ] Authentication requirements noted
- [ ] Error responses documented (400, 401, 403, 404, 500)
- [ ] Rate limiting noted (if applicable)

## Phase 3: ADR (Architecture Decision Records) Audit

```bash
echo "=== Architecture Decision Records ==="
ADR_DIR=$(ls -d docs/adr/ doc/adr/ adr/ .claude/project/ADR* 2>/dev/null | head -1)
if [ -n "$ADR_DIR" ]; then
  echo "ADR location: $ADR_DIR"
  ls "$ADR_DIR" 2>/dev/null | wc -l | xargs echo "ADR count:"

  # Check ADR format
  for adr in $(ls "$ADR_DIR"/*.md 2>/dev/null); do
    echo -n "  $(basename $adr): "
    grep -q "## Status" "$adr" && echo -n "Status " || echo -n "NO-STATUS "
    grep -q "## Context" "$adr" && echo -n "Context " || echo -n "NO-CONTEXT "
    grep -q "## Decision" "$adr" && echo -n "Decision " || echo -n "NO-DECISION "
    grep -q "## Consequences" "$adr" && echo "Consequences" || echo "NO-CONSEQUENCES"
  done
else
  echo "WARN: No ADR directory found"
fi
```

### ADR Quality Checklist
- [ ] Uses standard format (Title, Status, Context, Decision, Consequences)
- [ ] Status is current (Proposed/Accepted/Deprecated/Superseded)
- [ ] Context explains the problem and constraints
- [ ] Decision is clear and actionable
- [ ] Alternatives considered are documented
- [ ] Consequences (positive and negative) listed
- [ ] Date and author recorded
- [ ] Superseded ADRs link to replacement

## Phase 4: Changelog Audit

```bash
echo "=== Changelog ==="
CHANGELOG=$(ls CHANGELOG.md CHANGES.md HISTORY.md 2>/dev/null | head -1)
if [ -n "$CHANGELOG" ]; then
  echo "File: $CHANGELOG ($(wc -l < $CHANGELOG) lines)"

  # Check keep-a-changelog format
  grep -q "## \[Unreleased\]" "$CHANGELOG" && echo "  OK: Unreleased section" || echo "  WARN: No Unreleased section"
  grep -q "### Added\|### Changed\|### Fixed\|### Removed" "$CHANGELOG" && echo "  OK: Change categories" || echo "  WARN: No change categories"
  grep -cE "## \[" "$CHANGELOG" | xargs echo "  Versions documented:"

  # Check if latest tag matches changelog
  LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
  [ -n "$LATEST_TAG" ] && (grep -q "$LATEST_TAG" "$CHANGELOG" && echo "  OK: Latest tag $LATEST_TAG in changelog" || echo "  WARN: Latest tag $LATEST_TAG not in changelog")
else
  echo "WARN: No changelog file found"
fi
```

## Phase 5: Code Comment Coverage

```bash
echo "=== Code Comment Coverage ==="
# Calculate comment-to-code ratio per language

# JavaScript/TypeScript
JS_LINES=$(find . -name "*.ts" -o -name "*.js" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
JS_COMMENTS=$(grep -rc "//\|/\*\|\*/" --include="*.{ts,js}" . 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
echo "JS/TS: ${JS_COMMENTS:-0} comment lines / ${JS_LINES:-0} total lines"

# Python
PY_LINES=$(find . -name "*.py" | grep -v venv | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
PY_COMMENTS=$(grep -rc "^#\|\"\"\"" --include="*.py" . 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
echo "Python: ${PY_COMMENTS:-0} comment lines / ${PY_LINES:-0} total lines"
```

## Report Template

```markdown
# Documentation Audit Report
Date: {ISO timestamp}
Scope: {full|api|readme|adr|changelog}

## Summary
| Area | Score | Max | Status |
|------|-------|-----|--------|
| README Quality | N | 100 | PASS/FAIL |
| API Documentation | N | 100 | PASS/FAIL |
| ADR Quality | N | 100 | PASS/FAIL |
| Changelog | N | 100 | PASS/FAIL |
| Code Comments | N | 100 | PASS/FAIL |
| **Overall** | **N** | **500** | |

## README Scorecard
| Criteria | Points | Status |
|----------|--------|--------|
| Project description | /10 | {status} |
| Installation instructions | /15 | {status} |
| Usage examples | /15 | {status} |
| API documentation | /10 | {status} |

## API Documentation Gaps
| Endpoint | Description | Params | Response | Auth | Errors |
|----------|-------------|--------|----------|------|--------|
| GET /api/users | YES/NO | YES/NO | YES/NO | YES/NO | YES/NO |

## Issues Found
| # | Severity | Area | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | HIGH | README | No setup instructions | Add "Getting Started" section |
| 2 | MEDIUM | API | 5 endpoints undocumented | Add OpenAPI annotations |

## Evidence
- README analysis: `.claude/reports/docs/readme-analysis.txt`
- API validation: `.claude/reports/docs/openapi-validation.txt`

## Verdict
**PASS** — Documentation score ≥ 70%.
OR
**FAIL** — Score {N}%. See Issues above.
```

Save to `.claude/reports/docs/report-{date}.md`

## Definition of Done
- README quality scored and gaps identified
- API documentation completeness checked
- ADR format and quality validated
- Changelog compliance verified
- Code comment coverage measured
- Report saved to `.claude/reports/docs/`
