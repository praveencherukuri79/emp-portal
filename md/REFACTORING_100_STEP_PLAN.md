# Refactoring Plan: 100 Steps to Consistency and Maintainability

Date: 2025-11-01
Branch: develop
Scope: Frontend (Angular) + Backend (Node/Express)

This document defines 100 concrete steps, grouped by sections, to refactor the portal according to the rules:
- SVG icons always in separate files (no inline SVG in components)
- HTML and SCSS in separate files (no inline templates/styles)
- No hardcoded color codes in components
- Avoid SCSS duplication; prefer global tokens, variables, and mixins
- When editing SCSS, always read the corresponding HTML first; don’t invent selectors
- Verify each section after changes

Each step includes a Done criteria and a Verification note.

## Section A — Foundations and Policies (Steps 1–10)
1. Create this plan and commit under `md/REFACTORING_100_STEP_PLAN.md`.
   - Done when: File exists and is committed.
   - Verify: Open in repo and review sections.
2. Establish icons policy and directory `frontend/src/assets/svg`.
   - Done when: Folder exists and README explains usage.
   - Verify: README present; MatIcon/`img` references documented.
3. Add a lightweight ICONS.md with mapping patterns (optional now).
   - Done when: `md/ICONS.md` exists with conventions.
   - Verify: File present with examples.
4. Confirm all Angular components use `templateUrl` and `styleUrls`.
   - Done when: No inline `template`/`styles` attributes remain.
   - Verify: Grep for `template:`/`styles:`.
5. Create global SCSS "don’ts" checklist in `md/SCSS_GUIDE.md`.
   - Done when: Guide references tokens, mixins, and HTML-first rule.
   - Verify: File exists with examples.
6. Ensure global tokens and mixins are the only color/spacing source in components.
   - Done when: Components import none; they only use CSS vars.
   - Verify: Spot check 3 core components.
7. Configure ESLint comments to flag inline templates/styles (if found) as warnings.
   - Done when: ESLint rule or comment guidelines documented.
   - Verify: Run lint and observe.
8. Add CSS variables cheat sheet in `md/TOKENS.md` derived from `styles.scss`.
   - Done when: Mappings + usage appear.
   - Verify: File exists and links to tokens.
9. Confirm `ThemeService` governs theme switching without component colors.
   - Done when: No component logic sets raw colors.
   - Verify: Grep for color assignments in TS.
10. Add verification checklist to this doc (end).
   - Done when: Checklist present.
   - Verify: See Verification section.

## Section B — Icons Refactor (Steps 11–20)
11. Create `assets/svg/README.md` with icon usage patterns.
12. Audit for inline `<svg>` in templates and migrate to file-based icons.
13. Register custom SVG icons via `MatIconRegistry` when needed.
14. Replace decorative icons with `mat-icon` ligatures where appropriate.
15. Ensure all icons respect current color via `currentColor`.
16. Size icons via CSS classes (no inline width/height attributes).
17. Normalize icon naming (kebab-case, semantic names).
18. Remove duplicate or unused icons.
19. Add a style utility `.icon` class for sizing/spacing.
20. Verify dark mode visibility for icons.

## Section C — Global Styles & Tokens (Steps 21–35)
21. Consolidate all hardcoded component color codes to CSS variables.
22. Add `color-mix()` helpers where translucency is needed (no raw rgba in components).
23. Create mixins for card, button, and chip variants (if not already).
24. Ensure scrollbar colors use tokens where practical.
25. Define role-based aliases (already present) and document them.
26. Create spacing utility classes for consistent margins/padding (exists; document usage).
27. Add elevation utilities aligning with `--fx-shadow-*`.
28. Remove any duplicate SCSS in components into global utilities.
29. Standardize radius usage (`--fx-radius-*`).
30. Create typography utility classes for headings/subtitles.
31. Ensure Material overrides rely on tokens (no hex) where possible.
32. Add print styles guidance to SCSS guide.
33. Document responsive breakpoints and mixins.
34. Add a11y token notes (focus ring, high contrast) to guide.
35. Verify three representative components adopt tokens only.

## Section D — Component-by-Component SCSS Audit (Steps 36–60)
36. Layout: remove rgba and use token-based `color-mix()` overlays.
37. Layout: verify classes only defined if present in HTML.
38. Dashboard: replace rgba and hex literals; tighten spacing.
39. Dashboard: ensure responsive grid utilities are used.
40. Timesheets: ensure weekly UI uses tokens only; dedupe styles.
41. Timesheets: confirm button variants refactor to global utilities.
42. Approvals: normalize table and chip styles via utilities.
43. Approvals: ensure role badges use tokens and do not duplicate.
44. Documents: cards and file items use global card/mixins.
45. Documents: ensure upload states use info/success tokens.
46. Leaves: form fields and status chips use tokens.
47. Leaves: hover/active states use role-state tokens.
48. Settings: ensure semantic colors only; no raw hex/rgba.
49. Auth/Login: remove any inline styles; tokens only.
50. Shared components: confirm shared buttons/labels use utilities.
51. Dialogs: standardize sizes and paddings via mixins.
52. Snackbar classes map to tokens (success/error/warn/info).
53. Tables: unify header/body paddings, hover colors via tokens.
54. Lists: standardize list item spacing and active state.
55. Forms: align focus ring/border tokens consistently.
56. Badges/Chips: create shared style map and apply.
57. Toolbars: fix heights/paddings via tokens; no hex.
58. Sidenav: active link and hover states via tokens only.
59. Breadcrumbs (if present): adopt tokens and utilities.
60. Verify visual consistency in light/dark.

## Section E — Templates & Structure (Steps 61–70)
61. Ensure all components use external HTML files (no inline templates).
62. Ensure all components use external SCSS files (no inline styles arrays).
63. Remove any dead templates or styles files.
64. Align class names in SCSS strictly to HTML DOM.
65. Remove unused CSS selectors.
66. Add BEM-like naming guidance to SCSS guide.
67. Create small semantic helpers (e.g., `.muted`, `.subtle`).
68. Ensure icons are not embedded inline in templates.
69. Replace any presentational HTML attributes with classes.
70. Verify template cleanliness via review.

## Section F — Routing, Navigation, and Roles (Steps 71–78)
71. Role-based start route implemented (root -> approvals or timesheets).
72. Confirm guards use enums; no magic numbers.
73. Add aria-current and aria-labels to nav links.
74. Ensure hidden menu items are role-filtered from source.
75. Normalize route naming (kebab-case paths).
76. Remove unused or placeholder routes.
77. Verify lazy-loading and preloading strategy.
78. Validate deep-links and 404.

## Section G — Accessibility (Steps 79–85)
79. Ensure color contrast meets WCAG AA using tokens.
80. Add focus ring tokens and ensure visible focus.
81. Provide skip links for keyboard navigation.
82. Add aria labels and roles to key components.
83. Ensure dialogs have correct labelling.
84. Verify tab order in critical forms.
85. Run automated a11y checks (axe) locally.

## Section H — Performance & DX (Steps 86–92)
86. Audit bundle sizes; check large third-party usage.
87. Enable budget warnings for Angular build.
88. Lazy-load heavy components where sensible.
89. Memoize expensive pipes or computations.
90. Ensure change detection strategy set appropriately.
91. Remove dead code and unused exports.
92. Document performance guidelines in README.

## Section I — Tests & Verification (Steps 93–97)
93. Add minimal unit tests for guards and services changed.
94. Add visual regression checklist for main pages.
95. Integrate lint checks for forbidden patterns (inline styles/templates).
96. Add a pre-commit hook to run lint and style checks (optional).
97. Document test run steps and acceptance criteria.

## Section J — Backend Alignment (Steps 98–100)
98. Standardize ApiResponse<T> across endpoints used by frontend.
99. Verify timesheets/leaves/documents responses align with frontend types.
100. Document any backend contract changes in `md/API_REFERENCE.md`.

---

## Working Protocol
- Always read the HTML before editing SCSS. Target existing classes only.
- Prefer CSS variables from tokens. Use `color-mix()` for translucency.
- Keep icons as separate files. Use `mat-icon` or `img` with `currentColor` where appropriate.
- After each small batch of changes, run a production build and visually verify.

## Verification Checklist
- Build: PASS
- Lint: PASS or warnings acknowledged
- Visual check on: Layout, Dashboard, Timesheets, Approvals, Documents, Leaves
- Role paths: Employee -> Timesheets, Supervisor+ -> Approvals
- Dark mode: Icons and key surfaces readable
