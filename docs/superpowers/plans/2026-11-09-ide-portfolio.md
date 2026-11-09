# IDE portfolio implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in the current session.

**Goal:** Refine the existing portfolio using the captured Thinkrail reference, cobalt and neon, restored route transitions, and a bounded interactive 3D profile.

**Architecture:** Keep the existing Next.js IDE shell, blog/Studio, MongoDB adapter, EN/VI content and contact flow. Consolidate home content while preserving `/about` and `/contact` redirects. Reuse the committed tile transition and Three.js components with current tokens, cleanup, reduced motion and WebGL fallback.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, Three.js, CSS, Node test runner. No new dependencies.

**Spec:** User instructions in this session and `../../../../.artifacts/thinkrail-analysis/analysis.md`; the user's request for cobalt/neon and additional motion overrides the initial suggestion to remove them.

## Global constraints
- Preserve inherited uncommitted work; do not commit, push, deploy, or change DB records.
- Blog/Studio and database contracts remain available. Validate reading and the Studio gate without saving posts.
- Keep complete Vietnamese glyphs, keyboard navigation, contact/CV/social actions and route aliases.
- Follow the existing reference shell, with a personal 3D accent instead of a pixel-perfect clone.

## Review focus
- Same-page hashes, query-only navigation, modified clicks and external/download links.
- Slow or failed route changes must not leave an overlay blocking the page.
- Reduced motion, hidden/offscreen 3D and WebGL unavailable.
- Narrow mobile, long VI strings and statusbar overlap.
- Blog outline links must open posts rather than point at nonexistent sections.

### Task 1: Restore motion
**Files:** `components/motion/{navigation.ts,TransitionProvider.tsx,TransitionLink.tsx}`, `components/home/{ThreeDepthField.tsx,HeroDepthCard.tsx}`, `app/layout.tsx`, `styles/motion.css`, `tests/navigation.test.mjs`.
- [x] Test navigation classification for hashes, query changes, local routes, external URLs and schemes; run it red, implement, run green.
- [x] Restore tile transitions with finite lifetime and reduced motion; use Next Link onNavigate so modified/external/download clicks retain browser behavior.
- [x] Bound the existing Three.js scene to its container; cobalt/neon, lazy loading, visibility/reduced-motion handling, disposal and WebGL fallback.

### Task 2: Shell and content
**Files:** `components/ide/{IdeShell.tsx,IdeTerminal.tsx}`, `app/page.tsx`, `lib/content/ui.ts`, `styles/{ide.css,tokens.css}`, blog and Studio navigation imports.
- [x] Separate page navigation and section outline, maintain active states and mobile menu behavior.
- [x] Refine hero, add the 3D profile, use primary CV/secondary projects actions, retain contact and blog links.
- [x] Order home README/projects/experience/skills/contact; remove duplicated skill JSON; preserve substantive project information without inventing outcomes.
- [x] Replace fabricated terminal test/status counts with an explicitly illustrative localized profile script.
- [x] Use restored route links in shell, blog and Studio; preserve current blog/DB behavior.

### Task 3: Verify
- [x] Run Node tests, TypeScript, changed-file ESLint, full lint and production build; distinguish inherited failures from regressions.
- [x] Capture desktop/mobile/light/reduced-motion in browser. Exercise section navigation, locale/theme, mobile menu, blog/filter/post and Studio gate. Read DB status; do not write data.
- [x] Inspect screenshots, fix material layout or runtime issues, then review the final diff and record acceptance evidence.

Execution is already authorized by the user; continue without a further approval gate. Remain in this dirty workspace as its single writer. Visual CSS changes use screenshot acceptance rather than implementation-mirroring tests. Final independent review is read-only.


## User-directed final revision
- Compact full name on one line; original hero sentence becomes a one-shot grapheme-safe typewriter with reserved height and static reduced-motion rendering.
- Replace the d logo and duc.dev wordmark with ducnguyen.dev.
- Strengthen the bounded 3D scene with two counter-rotating orbits, floating wireframes and portrait depth animation.
- Remove every public admin/Studio/create-post entry; preserve the direct /admin route and backend modules.
- Validate the final interface on the existing localhost:3000 server.

## Execution record
- Navigation tests: RED to GREEN, 3 tests. Typewriter tests: RED to GREEN, 3 tests. Final suite 6/6.
- TypeScript and changed-file ESLint pass. Production build passes. Full lint retains 7 inherited errors in lib/content/posts.ts plus two inherited warnings; initial baseline had 9 errors and two warnings.
- Browser evidence and final visual QA: / .artifacts/portfolio-redesign/final (workspace parent; see design-qa.md). Public blog links do not expose admin.
- Two read-only independent reviews found no important regressions.
- No commits, dependency additions, deployment, email sends or explicit data writes.
- Final preview: http://localhost:3000/; temporary owned preview on 3100 stopped.
