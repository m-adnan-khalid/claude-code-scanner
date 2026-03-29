---
name: manage-i18n
description: >
  Internationalization and localization management — extract translatable strings, manage translation
  files, detect missing translations, validate RTL support, and track translation coverage.
  Works with react-intl, next-intl, i18next, vue-i18n, flutter_localizations, and raw JSON/YAML.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[extract | status | add-locale LOCALE | validate | --check-rtl]"
effort: high
roles: [FrontendDev, FullStackDev, TechLead]
agents: [@frontend, @code-quality]
---

# /manage-i18n $ARGUMENTS

## Commands
- `/manage-i18n extract` — Scan source code for translatable strings, generate/update translation files
- `/manage-i18n status` — Show translation coverage per locale (% complete, missing keys)
- `/manage-i18n add-locale fr` — Add a new locale with all keys (values set to English defaults)
- `/manage-i18n validate` — Check for: missing keys, unused keys, placeholder mismatches, encoding issues
- `/manage-i18n --check-rtl` — Validate RTL layout support (CSS logical properties, dir attributes, mirroring)

## Process

### Extract
1. Detect i18n framework: react-intl, next-intl, i18next, vue-i18n, flutter_localizations, raw JSON/YAML
2. Scan source files for translation function calls: `t()`, `$t()`, `intl.formatMessage()`, `AppLocalizations.of()`
3. Extract all string keys with their default values
4. Compare against existing translation files — report NEW keys, REMOVED keys, CHANGED defaults
5. Update base locale file with new keys (preserving existing translations)
6. Output: extraction report with counts

### Status
1. Read all locale files (en.json, fr.json, de.json, etc.)
2. Compare each locale against base locale — count: translated, missing, extra
3. Output: per-locale coverage table

### Validate
1. Check every locale file for: missing keys vs base, unused keys not in code
2. Verify placeholders match across locales: `{name}` in English must exist in French
3. Check for common issues: HTML in translations, untranslated English left in non-English files
4. If `--check-rtl`: verify CSS uses logical properties (margin-inline-start vs margin-left)

## Definition of Done
- All translatable strings extracted and in base locale file
- All locales have 100% key coverage (even if values are English defaults)
- No placeholder mismatches across locales
- RTL support validated (if applicable)
