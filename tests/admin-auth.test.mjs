import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService, hashPassword, readAuthConfig, isAllowedMutation } from '../lib/auth/core.ts';

const password = 'A-real-test-passphrase-938!';
const hash = await hashPassword(password);
const config = { username: 'owner', passwordHash: hash, origin: 'https://portfolio.test' };
function fixture(overrides = {}) {
  let now = 1_800_000_000_000;
  let attempts = 0;
  const sessions = new Map();
  const store = {
    consumeAttempt: async () => ++attempts,
    createSession: async s => { sessions.set(s.id, s); },
    getSession: async id => sessions.get(id) ?? null,
    deleteSession: async id => { sessions.delete(id); },
  };
  const service = createAuthService({ config, store, now: () => now, ...overrides });
  return { service, store, sessions, advance: ms => { now += ms; } };
}
test('configuration is mandatory and plaintext legacy secrets do not enable authentication', () => {
  assert.equal(readAuthConfig({ ADMIN_SECRET: 'admin', ADMIN_PASSWORD: password }), null);
  assert.equal(readAuthConfig({ ADMIN_USERNAME: 'owner', ADMIN_PASSWORD_HASH: hash, ADMIN_ORIGIN: 'https://portfolio.test/path' }), null);
  assert.equal(readAuthConfig({ ADMIN_USERNAME: 'owner', ADMIN_PASSWORD_HASH: 'bad', ADMIN_ORIGIN: config.origin }), null);
});
test('missing configuration and unavailable storage fail closed', async () => {
  assert.equal((await fixture({ config: null }).service.login('owner', password)).status, 503);
  const f = fixture({ store: { consumeAttempt: async () => { throw Error('offline'); } } });
  assert.equal((await f.service.login('owner', password)).status, 503);
  await assert.rejects(() => f.service.authorize('A'.repeat(43)));
});
test('old hardcoded passwords and wrong usernames cannot create sessions', async () => {
  const { service, sessions } = fixture();
  for (const bad of ['admin', 'local-dev-only', 'abcd']) assert.equal((await service.login('owner', bad)).status, 401);
  assert.equal((await service.login('other', password)).status, 401);
  assert.equal(sessions.size, 0);
});
test('login issues an opaque session stored only as a digest; reload works and logout revokes replay', async () => {
  const { service, sessions } = fixture();
  const result = await service.login('owner', password);
  assert.equal(result.status, 200);
  assert.equal(result.token.length, 43);
  assert.equal(sessions.has(result.token), false);
  assert.equal(await service.authorize(result.token), true);
  assert.equal(await service.authorize('B'.repeat(43)), false);
  await service.logout(result.token);
  assert.equal(await service.authorize(result.token), false);
});
test('expiry and password rotation invalidate existing sessions', async () => {
  const f = fixture();
  const result = await f.service.login('owner', password);
  const rotated = createAuthService({ config: { ...config, passwordHash: await hashPassword(password + 'new') }, store: f.store });
  assert.equal(await rotated.authorize(result.token), false);
  f.advance(8 * 60 * 60 * 1000);
  assert.equal(await f.service.authorize(result.token), false);
});
test('single-account throttle cannot be bypassed by switching usernames', async () => {
  const { service } = fixture();
  for (let i = 0; i < 10; i++) assert.equal((await service.login('user' + i, 'wrong')).status, 401);
  assert.equal((await service.login('owner', password)).status, 429);
});
test('concurrent credential checks reserve their slot before password verification', async () => {
  const { service } = fixture();
  const results = await Promise.all(Array.from({ length: 15 }, () => service.login('owner', password)));
  assert.equal(results.filter(r => r.status === 200).length, 10);
  assert.equal(results.filter(r => r.status === 429).length, 5);
});
test('mutations reject absent/foreign origins, cross-site requests and non-JSON content', () => {
  const request = (headers) => new Request('https://internal/admin', { method: 'POST', headers });
  const valid = { origin: config.origin, 'content-type': 'application/json' };
  assert.equal(isAllowedMutation(request(valid), config), true);
  assert.equal(isAllowedMutation(request({ ...valid, origin: 'https://evil.test' }), config), false);
  assert.equal(isAllowedMutation(request({ 'content-type': 'application/json' }), config), false);
  assert.equal(isAllowedMutation(request({ ...valid, 'sec-fetch-site': 'cross-site' }), config), false);
  assert.equal(isAllowedMutation(request({ ...valid, 'content-type': 'text/plain' }), config), false);
});
