# Blog media implementation plan

**Goal:** Admin can drop/paste/upload media, choose a cover, insert captioned images/videos/links/downloads and preview the same output readers see.

**Approved scope:** The user's four requested admin features plus public blog rendering. Preserve existing authentication, routes, MongoDB content, publication status, login throttling and visual theme. No live DB writes, cloud resource creation or deployment during implementation.

**Architecture:** Keep Markdown and introduce one safe shared renderer for Studio and public articles. Extend posts with optional cover URL/alt. Proxy authenticated, origin-checked uploads through a bounded binary API to R2's S3 API using server-only credentials. The repository has no Cloudflare adapter binding API, so S3 avoids coupling upload support to a hosting-specific adapter. Existing articles remain compatible.

**Limits:** Images PNG/JPEG/WebP/GIF/AVIF 10 MiB; MP4/WebM 25 MiB; PDF/ZIP 20 MiB. Check filename, MIME and signature server-side; reject SVG/HTML/executables and unsafe URLs. UUID object keys, immutable cache headers; attachments use Content-Disposition attachment. All uploaded media is public, even before a draft is published; explain this in Studio and docs.

**Ruling:** Reduce proposed video limit from 50 to 25 MiB because the proxy validates and signs buffered bytes inside the Workers memory budget. Large videos use external embeds. No change to existing posts or database content.

## Tasks

- [x] Add failing upload tests: unauthenticated/foreign-origin rejected before reading, unsupported/mismatched/truncated/oversized file denied, storage failure sanitized, valid upload saved under generated key.
- [x] Implement media policy, authenticated upload factory, R2 S3 transport and route; preserve JSON-only auth/post APIs.
- [x] Add shared Markdown parser/renderer with safe URLs, captions, direct videos, allowlisted YouTube/Vimeo embeds and downloads; verify unsafe content stays inert.
- [x] Extend post validation and normalization for covers, including preserving omitted cover fields on older clients.
- [x] Add Studio media toolbar, drop/paste upload, cover controls and shared preview; guard asynchronous uploads when switching drafts.
- [x] Render covers in public index/articles and responsive media styles. Preserve old code blocks and heading outline.
- [x] Document R2 setup, exact environment keys, limits and deployment preservation; update safe env template/export whitelist.
- [x] Run tests, lint, typecheck/build and synthetic browser preview/upload checks without writing live DB. Attempt independent security review through Orca if available; report any unavailable runtime/cloud evidence.

## Evidence and follow-up authorized scope

- 49 Node tests passed; ESLint and Next production build (including TypeScript) passed. Production dependency audit: zero advisories.
- Real Edge headless browser, synthetic auth/posts/upload responses: upload/paste/drop, cover, caption, native video, link, save/reload, shared public image/embed/download rendering and inert script checks passed. Desktop/mobile screenshots under the ignored parent `.artifacts/media-qa` folder.
- Anonymous real local upload route returned 401; foreign-origin returned 403. R2 signed PUT transport tested with a mocked backend; no live R2 credentials configured.
- Orca CLI could not connect (`runtime_unavailable`). A native read-only reviewer found two issues (inherited allowlist keys; header-only/truncated payloads), both reproduced and fixed with regressions. Follow-up review reported no remaining concrete blockers. Cross-vendor review via Orca was unavailable.
- User subsequently authorized updating the existing public Orca article with images and links, overriding the initial no-live-write restriction for this one article only. Added four official upstream screenshots (one cover, three body), preserved MIT license/source revision and added clickable official references. Optimistic content equality check and EJSON backup preceded the exact article update; title, original publication date, status and other posts preserved. Local real Next reader/index verified all images/captions/links and mobile layout against MongoDB after update.
- Cloudflare deployment and live R2 upload remain unverified. The new renderer and bundled article assets must be deployed before production can show the added media.

### R2 configuration follow-up, 2026-11-11

User supplied all five R2 variables in local configuration and requested restart plus Cloudflare env export. Re-exported ignored `.env.cloudflare` and `.cloudflare.secrets.json`; all R2 variables and both S3 secrets were present without printing values. Restarted the task-owned Next dev server on port 3000. Live check through the actual upload factory and R2 transport (in-process test gate, no browser login/session modification): a tiny PNG upload succeeded, public GET returned 200 with byte-for-byte identical image/png content, then the test object's signed DELETE returned 204. This validates real S3 credentials, bucket write permissions and public URL access; it is not a deployed Worker/browser end-to-end assertion. Wrangler `whoami` remains unauthenticated, so runtime variables on Cloudflare were not changed remotely. Existing Orca article images remain bundled static assets; this check did not migrate or edit the article.

## Review focus

- Malicious URLs, raw HTML and malformed embeds cannot execute script or reach arbitrary iframe origins.
- Authorization and same-origin checks run before body reads or storage writes; credentials never enter client bundles.
- MIME/extension mismatch, forged Content-Length and chunked oversize cannot bypass limits.
- Cover and media survive save/reload; old edits preserve publication date and cover when omitted.
- Batch uploads cannot insert into a newly selected draft or claim success after an upload/storage failure.
