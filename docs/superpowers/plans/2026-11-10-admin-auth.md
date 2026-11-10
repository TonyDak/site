# Admin authentication implementation plan

Goal: replace the client-only gate and optional API secret with server-enforced authentication.

Design: one administrator, scrypt password hash in server environment, random opaque eight-hour sessions stored only as SHA-256 digests in MongoDB. Every admin API authorizes against the session store; logout deletes the session. Missing configuration/database denies access. A shared MongoDB counter permits ten credential checks per fifteen-minute window. Mutations require the configured exact origin and JSON; cookies are HttpOnly, SameSite Strict and Secure in production. Public readers receive published posts only. No public admin navigation is added.

1. Write failing tests for missing config, wrong credentials, token forgery/expiry/revocation, credential rotation, throttling and origin checks. Implement pure auth core and Mongo adapter.
2. Add login/session/logout handlers and shared API authorization. Guard post reads/writes before content access; preserve public published reads.
3. Replace local UI authentication with server session loading, username/password login, expiry handling and logout. Never retain/send password with post saves.
4. Add local setup/reset CLI and environment documentation. Migrate existing local non-default password to a hash without exposing it; remove legacy secrets. Do not write blog content or mutate live DB during verification.
5. Run focused auth tests, TypeScript, changed-file lint, all tests and isolated build/integration with synthetic storage. Inspect final diff and obtain independent bypass review. No commit/push/deploy.

Limits: production HTTPS and real MongoDB integration remain deployment acceptance; use test storage for write verification.
