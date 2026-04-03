---
name: figma-brief
description: Generates Figma design briefs from requirements. Includes 10 sections: overview, user context, layout, components, interactions, states, tokens, accessibility, constraints, open questions.
invocation: manual
---

## Figma Design Brief Generator

TASK-FIRST: Create subtask for design brief generation under the parent story in TASK_REGISTRY.

### 10 Mandatory Sections

Every design brief MUST include all 10 sections. Link every element to its source requirement (FR-###).

#### 1. Overview
- Feature name and one-line description
- Link to product spec and story ID
- Design goal and success metric

#### 2. User Context
- Target persona(s) and their goals
- User journey stage where this screen/component appears
- Entry points and exit points (FR-### references)

#### 3. Layout
- Page structure and grid system
- Content hierarchy and visual flow
- Responsive breakpoints (mobile, tablet, desktop)
- Reference to existing layout patterns in the codebase

#### 4. Components
- List of UI components needed (new vs existing)
- Component variants and sizes
- Props/configuration for each component (FR-### references)

#### 5. Interactions
- Click, hover, focus, drag behaviors
- Transitions and animations (duration, easing)
- Gesture support (mobile) (FR-### references)

#### 6. States
- Default, loading, empty, error, success, disabled states
- Skeleton/placeholder screens
- Edge cases: long text, missing data, permissions (FR-### references)

#### 7. Design Tokens
- Colors (reference existing token system)
- Typography (font, size, weight, line-height)
- Spacing and border-radius values
- Shadow and elevation levels

#### 8. Accessibility
- WCAG 2.1 AA compliance requirements
- Color contrast ratios (minimum 4.5:1 text, 3:1 large)
- Keyboard navigation order
- Screen reader labels and ARIA attributes
- Focus indicators

#### 9. Constraints
- Technical constraints (browser support, performance budget)
- Business constraints (branding, legal, compliance)
- Timeline and delivery milestones

#### 10. Open Questions
- Unresolved design decisions
- Items needing stakeholder input
- Dependencies on other teams or systems

### Usage

```
/figma-brief FR-001 FR-002 FR-003    # Generate brief from requirement IDs
/figma-brief --story STORY-042       # Generate brief from story
/figma-brief --page "checkout"       # Generate brief for a page
```

### Output Location

- Brief saved to `docs/design/briefs/[feature-name]-brief.md`
- Linked in TASK_REGISTRY subtask

### Logging

- Log each brief generation to AUDIT_LOG: timestamp, requirement IDs, section count, output path.
