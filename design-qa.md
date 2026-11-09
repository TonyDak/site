# Portfolio visual and interaction acceptance

## Background rollback - 2026-11-10

At the user's request, restored the curved perspective grid from before the ribbon experiment. The background now uses one animated grid plane with a static editor grid/minimap and subtle ambient glows. Removed the particle effect and its temporary files. Slow repeating typing, the workspace header and public read-only blog navigation remain unchanged.

Verified at localhost:3000 in a 1440x1000 browser capture: the grid canvas is mounted, the particle effect is absent and no page or console errors were recorded. TypeScript, changed-file ESLint, all 9 existing tests and the production build passed. This is visual/runtime verification, not a device performance benchmark. Earlier iteration notes below are historical.

## Latest iteration — 2026-11-09

The user requested a slower repeating headline, the reference workspace titlebar/Projects tree, and a richer editor background. Headline timing is now 100ms per grapheme, 2600ms hold, 55ms deletion and 800ms between cycles; 9/9 tests pass and a browser scenario observed typing, hold, deletion and a second cycle without navigation. The clean portrait file panel replaces the former orbit/wireframe decorations. The top bar now separates brand, workspace name and workspace branch context; the Projects heading and nested tree follow the provided crop.

After the user reported the animated ribbon looked laggy, the live WebGL background was unmounted and the continuously redrawn 2D backdrop was made static. Ambient motion now uses CSS transform/opacity only. A fresh browser capture confirmed no WebGL canvas and no console/page errors; TypeScript, changed-file ESLint and production build passed. This establishes removal of those render loops, not a benchmark on the user's device. Three image-only background concepts are being explored; no proposed concept is selected or implemented yet. Earlier screenshots and the notes below are historical checkpoints, not the latest background acceptance.

final result: passed

Scope: existing portfolio redesign and the user's final hero/branding/public-blog revisions. This is acceptance against the requested adaptation, not a pixel-perfect Thinkrail clone.

## Findings and resolved issues

- Resolved: duplicate section navigation in both sidebars. Left navigation now selects public destinations; the right panel follows the current page's sections/posts.
- Resolved: oversized personal name split across two lines. Full name is compact on one line; the original product sentence is now the main typewriter headline.
- Resolved: a short orphan ending in the desktop headline. Balanced wrapping keeps the completed headline on three readable lines at 1440px.
- Resolved: public Studio/admin and create-post navigation. No such anchors or buttons appear in the final home or blog DOM/accessibility capture. Direct management routes are preserved as requested.
- Resolved: active mobile tabs could remain offscreen. The selected tab now scrolls into view; closed mobile navigation is hidden from keyboard navigation.
- Resolved: terminal's fixed dark background conflicted with light-theme text tokens. The panel and command text now follow the theme.
- Resolved: optional 3D work is bounded to the profile, stopped when hidden/offscreen and removed in reduced motion. Shared geometries/materials are disposed.

## Visual reference and evidence

Reference: `../.artifacts/thinkrail-analysis/01-thinkrail-desktop.png`, captured live through REA at 1440x1000.

Accepted final screenshots, saved and reopened:
- `../.artifacts/portfolio-redesign/final/01-desktop.png`
- `../.artifacts/portfolio-redesign/final/02-light-reduced-motion.png`
- `../.artifacts/portfolio-redesign/final/03-mobile-vi.png`
- `../.artifacts/portfolio-redesign/final/04-blog-read-only.png`
- `../.artifacts/portfolio-redesign/final/05-typewriter-progress.png`

Combined same-size reference/implementation: `../.artifacts/portfolio-redesign/final/reference-comparison.png`. Individual screenshots were also inspected at their original size because the combined image is downscaled in chat. Evidence IDs, environment and steps are in the adjacent `evidence-index.json`.

## Required visual surfaces

- Typography: retain Geist for content and JetBrains Mono for chrome. Vietnamese names and combining marks render correctly. The headline types once, preserves complete accessible text and reserves its final height. Reduced motion shows full static copy.
- Layout: keep the reference's fixed IDE frame, tabs and distinct panels. Final desktop columns are 220px / flexible / 320px at 1440px; mobile collapses to one content column with a menu and horizontal tabs. Main CTA is full width on narrow screens.
- Color: cobalt denotes navigation/interaction; neon denotes the primary CV action, status and 3D highlights. Backgrounds are flatter than the inherited design. Light theme remains readable.
- Imagery: reuse the actual inherited portrait asset. Two Three.js orbit lines, moving wireframes and portrait/chip depth are intentional user-requested additions. No raster placeholder or copied Thinkrail logo is used.
- Copy: use ducnguyen.dev in the wordmark and metadata. Preserve the original EN/VI hero sentence, existing professional facts, blog data, CV and contact details. Project descriptions separate challenge and personal contribution without inventing measured outcomes.

Intentional differences from Thinkrail: cobalt alongside neon, compact personal identity, animated headline, portrait/3D and portfolio-specific sections. These follow explicit user revisions.

## Verification

- Node test runner: 6/6, navigation and grapheme-safe typing; both feature suites were observed failing before their implementations passed.
- TypeScript: passed; production build: passed, all 17 pages generated.
- ESLint for edited UI/motion/content files: passed.
- Full repository lint: 7 inherited errors in `lib/content/posts.ts` and 2 inherited warnings in posts/admin remain. Initial baseline was 9 errors and 2 warnings; this change removed the two IDE component errors.
- `git diff --check`: passed.
- Browser: desktop 1440x1000, mobile 390x844, EN/VI, light/dark, reduced motion, visible WebGL scene, section navigation, architecture disclosure, blog/filter/post, route transition frames, and `/about` / `/contact` aliases.
- The database status endpoint returned `db: true`; blog pages rendered the existing database-backed posts. No post save, delete, email send or explicit database mutation was performed.
- Two independent read-only code reviews reported no important correctness findings.

A discarded capture injected screenshot caret styles before React hydration and caused a tool-induced attribute warning on form controls. The capture was changed to take screenshots only after waiting for hydration; fresh desktop/mobile/blog runs then returned no page errors or console errors. Application code was not changed to suppress hydration diagnostics.

## Limits

Mobile evidence is a desktop Chromium viewport, not a physical-device test. Full assistive-technology/contrast auditing, forced WebGL-unavailable execution, runtime OS motion preference switching and real post persistence were not tested. Existing management authentication and backend behavior were retained; hiding public management links is not a new authorization mechanism.

## Delivery

Final interface is available on the inherited development server at http://localhost:3000/. Temporary owned port 3100 preview was stopped. No commit, push, dependency installation or deployment was performed.
