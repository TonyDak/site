# Persistent Cloudflare deployment and database selection

**Problem:** Worker ping succeeds while blog shows bundled examples. The app can fall back to a different database name and build-time sample pages; dashboard variables may be overwritten by Wrangler auto-configuration. Existing deploy command is `npx wrangler deploy`.

**Authorized scope:** Make that deployment command consume a complete committed Cloudflare configuration. Preserve Mongo sessions/login limits, article data and existing media. Never commit credentials. Do not deploy without authenticated access or fabricate production acceptance.

**Implementation:** Install pinned OpenNext/Wrangler, add worker `site` config with node compatibility, assets and self-reference, a build hook and `keep_vars: true`. Persist only explicitly allowlisted non-secret runtime settings from the prepared production config. Declare essential runtime secrets as required; they remain Dashboard Secrets. Make database name mandatory, remove bundled post fallbacks, render blog/sitemap at request time, show sanitized retry UI on failure.

**Verification:** Regression tests first for missing DB name, missing/failing/empty storage. Run all tests/lint and actual OpenNext build. Validate Wrangler dry-run using generated Worker output without deploying. Run workerd preview with real read-only Mongo access, checking blog/slug/RSC and missing-secret behavior; no article/session mutations. Review complete patch. Report exact remaining cloud access/deployment requirements.

**Rulings:**

- Use compatibility date `2026-11-10`, the maximum supported by pinned workerd (client timezone has advanced to Nov 11).
- Scope glob 14.0.4 overrides to the adapter/node-minify after installed dependency audit found inherited glob/minimatch advisories. Audit returns zero; glob named APIs are retained and the actual bundle build exercises them.
- Public canonical URL must be injected into the build from committed configuration, since Wrangler runtime vars are not custom-build process variables. A clean build with parent localhost URL must still generate production robots/metadata.
- OpenNext compiles ignored `.env*` files into a generated fallback module. Clear that module after a successful adapter build: runtime credentials/database selection must come from Worker bindings, not embedded local defaults. Never ship the local Windows junction verification shim.

**Evidence so far:** Regression tests showed failures before the code change. OpenNext bundle built locally with temporary directory-junction shim; full Wrangler deploy dry-run exercised the original build hook without uploading. Healthy workerd preview returned 200 for DB ping/blog/article/RSC/sitemap and actual browser loaded R2 images/index cover. Missing database binding returned false status and retry UI without samples once adapter env fallback was cleared. No live article/session writes or deployments performed.

**Final evidence:** 54/54 tests and ESLint passed; dependency audit reports zero advisories. The final original `wrangler deploy --dry-run` path executed the committed build hook from a parent with all runtime credentials empty and a deliberately stale localhost public URL: build and dry-run exited 0, generated robots uses the production origin, and generated fallback env exports are empty. Actual secret-value scan over 1703 generated bundle/dry-run files found zero matches. The final healthy Worker returned 200 for status/blog/article/RSC and the real browser verified cover/three R2 images/index on desktop/mobile. Native independent reviewer reported no remaining blockers after three focused review passes. Production remains unchanged until these source changes are pushed/deployed; Wrangler account authentication was unavailable.
