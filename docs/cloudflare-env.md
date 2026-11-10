# Cloudflare environment: www.ducnh.tech

Production origin: `https://www.ducnh.tech` (no trailing slash). Admin: `https://www.ducnh.tech/admin`.

## Prepared files

For blog media uploads, see [blog-media.md](blog-media.md) for the five R2 variables, bucket setup, limits and verification steps. Media is optional; missing R2 configuration does not disable blog reading.

- `.env.local`: local development; `ADMIN_ORIGIN=http://localhost:3000`.
- `.env.cloudflare`: full production configuration, using the existing MongoDB and mail values and the new password hash.
- `.cloudflare.secrets.json`: only secret values, suitable for Wrangler bulk secret import.
- `.env.example`: safe, tracked template without credentials.

The first three files are ignored by Git. Do not paste their contents into issues or commit them.

The original Resend key and sender/recipient were sample placeholders. They are excluded from the Cloudflare export; add real verified email values if you want contact email delivery. MongoDB and the admin hash are included without printing their values.

## Dashboard

Open Workers & Pages, select the Worker, then Settings > Variables and Secrets.

| Name | Type | Value/source |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Text | `https://www.ducnh.tech` — also set in Build variables |
| `ADMIN_ORIGIN` | Text | `https://www.ducnh.tech` |
| `ADMIN_USERNAME` | Text | Existing username from `.env.cloudflare` |
| `ADMIN_PASSWORD_HASH` | Secret | Copy the whole generated hash from `.env.cloudflare` |
| `MONGODB_URI` | Secret | Existing connection string from `.env.cloudflare` |
| `MONGODB_DB` | Text | Existing database name from `.env.cloudflare` |
| `RESEND_API_KEY` | Secret | Existing key, if email delivery is enabled |
| `CONTACT_TO_EMAIL` | Text | Existing recipient |
| `CONTACT_FROM_EMAIL` | Text | Existing verified sender |

Delete obsolete `ADMIN_PASSWORD` and `ADMIN_SECRET` on Cloudflare: the application no longer reads them. Do not prefix any credential with `NEXT_PUBLIC_`. Keep one canonical origin; redirect the bare domain to `www.ducnh.tech` if both are configured. Preview workers require their own exact `ADMIN_ORIGIN`.

Cloudflare runtime secrets and Build variables are different settings. Public canonical URL is needed during `next build`; admin credentials should remain runtime secrets, and should not be made available to untrusted pull-request builds.

### Keep runtime variables across deployments

The committed `wrangler.jsonc` now configures the existing Worker `site`, `keep_vars: true`, its non-secret runtime settings, OpenNext output paths, Node compatibility and the build hook. The current Dashboard **Deploy command may remain `npx wrangler deploy`**. It now reads this configuration and runs `npm run build:cloudflare` before uploading. `npm run deploy:cloudflare` is the equivalent local command with an extra explicit `--keep-vars` flag.

The adapter and Wrangler versions are pinned in devDependencies. `open-next.config.ts` supplies the adapter configuration. `scripts/build-cloudflare.mjs` explicitly supplies the committed canonical public URL to the build; Wrangler runtime `vars` alone are not inherited by Next's build, and must not result in localhost metadata/robots output. Only the public URL is copied into the build environment. Merely exporting `.env.cloudflare` does not install runtime Secrets on the Worker.

Use the build wrapper, rather than calling the adapter build CLI directly: after a successful adapter build it clears OpenNext's generated `.env*` fallback module. This prevents local ignored credentials or stale database settings from becoming embedded Worker defaults. Production runtime settings come exclusively from Worker bindings; local `next dev` still uses `.env.local` normally.

Store `MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` as **Secrets** in the production Worker's Settings > Variables and Secrets. Keep `MONGODB_DB`, `ADMIN_ORIGIN`, `ADMIN_USERNAME` and R2 account/bucket/public URL as Text variables; `--keep-vars` preserves dashboard-managed Text variables. Wrangler normally retains encrypted Secrets on deployment. If a Secret disappears too, verify its type, Worker name, production/preview environment and active deployment.

`MONGODB_DB` is now committed as a non-secret deployment setting. Update it there if intentionally migrating databases. The Mongo helper requires an explicit non-empty name and no longer falls back to `portfolio`. Blog pages and sitemap render at request time; public queries never substitute bundled samples, and empty databases stay empty. Missing/failed storage raises a sanitized error with a blog retry view. This prevents a successful ping to the wrong default database or a build-time fallback from looking like published blog content.

Required Secrets (`MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) are declared by name in `secrets.required`, without values. Wrangler requires them on the existing Worker, and refuses deployment if a required inherited Secret is missing. Restore missing values once from the ignored `.cloudflare.secrets.json` into the correct Worker's Secrets. No credentials are committed. Other dashboard-managed settings remain preserved through `keep_vars`.

See [Wrangler configuration source of truth](https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth). Workers Builds runs on Linux, which is the supported OpenNext build environment. Native Windows can fail creating symlinks; use WSL/Linux for a normal full adapter build. Local verification used a temporary junction shim outside the repository, without changing OS security settings or shipped code.

If using Wrangler with an already configured Worker, `wrangler secret bulk .cloudflare.secrets.json` imports only the configured secret fields (including R2 credentials when present). This is a deployment action; it was not run by the coding agent. Set the remaining Text variables separately.

Official documentation: [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) and [environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/).

## Runtime requirements and verification limits

This is a full Next.js application with authenticated API routes and MongoDB; a static-only Cloudflare Pages export cannot run the admin API. The committed Worker configuration enables Node compatibility at `2026-11-10`, supported by the pinned workerd build. Workers' documented `node:crypto` support includes the scrypt API used here. Database credentials need access to the `posts`, `admin_sessions`, and `admin_login_attempts` collections, including creating the two expiry indexes. Give the database user permissions only on the portfolio database and configure network access for the deployed Worker.

The repository pins Next.js/eslint-config-next 16.4.6, OpenNext Cloudflare 1.20.16 and Wrangler 4.160.0. The adapter accepts Next.js `>=15.5.29 <16 || >=16.4.5`. Scoped glob 14.0.4 overrides beneath the adapter and node-minify close inherited build-tool advisories; validate them when upgrading the adapter. The adapter Worker bundle has been tested locally with real read-only MongoDB requests, including HTML and RSC navigation. This is not confirmation of a deployed version. See [Cloudflare's Next.js runtime guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/).

The lockfile also updates the affected runtime/transitive packages. A development-only override pins minimatch 11.0.1 beneath `@typescript-eslint/typescript-estree`, whose current upstream range still selects vulnerable minimatch 10.2.6. This closes [GHSA-g3hv-75wg-m249](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249); recheck the override when typescript-eslint updates its dependency. Fresh-install lint, typecheck, tests and Next.js build are the compatibility checks for this override. An already-running local dev server must be restarted with dependencies installed from the updated lockfile to use the new framework version.

### MongoDB connection lifetime on Workers

`lib/db/mongo.ts` uses `withDb`: create a client for one database operation, await all queries, and close the client in `finally`. Blog reads/writes, admin session storage and status checks execute inside that callback. Do not return a live Db/Collection/cursor from it or cache Mongo clients, connection promises or index-creation I/O promises in module/global scope. Plain Workers cannot reuse request-owned I/O across requests. See [Cloudflare's MongoDB guidance](https://developers.cloudflare.com/workers/databases/third-party-integrations/mongodb/).

Before the fix, the local workerd probe using the actual helper/driver produced 200, then the same “Worker's code had hung” cancellation as production, then 200 on repeated reads. After the fix, eight sequential and four concurrent read-only probes all returned 200 and found the published article. This validates the reproduced database lifecycle issue; it does not certify all Next.js adapter/RSC behavior or the deployed version. Deploy the updated source, then check repeated article HTML and RSC navigation requests in the real Worker logs. Direct connections add per-operation connection overhead, an acceptable tradeoff for this low-traffic portfolio; a Durable Object connection proxy would be a separate future optimization.

After deployment, verify HTTPS login, refresh, logout/replay rejection, failed-login throttling, MongoDB connectivity, and draft visibility on the real Worker. Local synthetic tests are not proof of production acceptance.

## Password reset

From the site folder on Node.js 24:

```sh
npm run admin:setup
npm run env:cloudflare -- --origin=https://www.ducnh.tech
```

The setup prompt hides the password. Use 12-256 characters and keep it in your password manager. Upload the new `ADMIN_PASSWORD_HASH` to Cloudflare; changing username or hash invalidates previous sessions. No plaintext password is stored in the generated files.

## Security behavior

- Login is verified on the server using scrypt and constant-time password comparison.
- Opaque sessions contain 256 bits of randomness; MongoDB stores only SHA-256 token digests. Sessions expire after eight hours, are checked on every admin request, and are deleted on logout.
- Production cookies use `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict`, and `Path=/`. No token/password is stored in localStorage.
- All admin mutations require JSON and the exact configured origin. Payloads are bounded, errors are sanitized, and admin responses cannot be cached or framed.
- A shared, atomic MongoDB counter allows ten credential checks per fifteen-minute fixed window across all IPs/usernames/Worker instances. This can temporarily block the owner during an attack; Cloudflare Access/WAF can provide an additional perimeter.
- Missing configuration or database access denies management access. Public blog reading continues independently, with drafts excluded; public reads never seed the database.
