---
name: seo-audit
description: >
  SEO audit — meta tags, structured data (JSON-LD), Open Graph, sitemap, robots.txt,
  Core Web Vitals, canonical URLs, heading hierarchy, image alt text, and crawlability.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[--technical | --content | --full] [--url URL]"
effort: high
roles: [FrontendDev, FullStackDev, TechLead, Designer]
agents: [@frontend, @code-quality, @ux-designer]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# /seo-audit $ARGUMENTS

## Commands
- `/seo-audit` — Full SEO audit (technical + content)
- `/seo-audit --technical` — Technical SEO only (meta, sitemap, robots, structured data)
- `/seo-audit --content` — Content SEO only (headings, alt text, keyword density)
- `/seo-audit --url https://example.com` — Audit a live URL (requires curl)

## Checks

### Technical SEO
1. **Meta tags:** title (50-60 chars), description (150-160 chars), viewport, charset on every page
2. **Open Graph:** og:title, og:description, og:image, og:url on every page
3. **Twitter Card:** twitter:card, twitter:title, twitter:description, twitter:image
4. **Structured data:** JSON-LD for Organization, WebSite, BreadcrumbList, Article/Product
5. **Canonical URLs:** every page has `<link rel="canonical">`, no duplicates
6. **Sitemap:** sitemap.xml exists, all pages included, no 404s
7. **Robots.txt:** exists, allows search engine crawling, references sitemap
8. **Heading hierarchy:** single H1 per page, no skipped levels (H1→H3 without H2)
9. **Image optimization:** all images have alt text, lazy loading on below-fold images
10. **Core Web Vitals:** LCP, FID/INP, CLS targets (via Lighthouse if available)

### Content SEO
1. **Internal linking:** pages have contextual internal links, no orphan pages
2. **URL structure:** semantic URLs (/blog/my-post not /p/123), no query params for content
3. **Mobile-friendly:** responsive viewport, touch targets >44px, no horizontal scroll
4. **Page speed:** bundle size check, image compression, font loading strategy

## Output
- SEO score (0-100) with breakdown by category
- Prioritized fix list (HIGH/MEDIUM/LOW)
- Comparison to industry benchmarks

## Definition of Done
- All HIGH issues fixed, MEDIUM issues documented with plan
- Sitemap and robots.txt validated
- Structured data passes Google Rich Results Test format

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
