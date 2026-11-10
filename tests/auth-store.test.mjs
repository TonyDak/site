import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export {};', shortCircuit: true };
  if (specifier === '@/lib/db/mongo') return { url: 'data:text/javascript,export async function withDb(operation){return globalThis.__authStoreDb?operation(globalThis.__authStoreDb):null;}', shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { mongoAuthStore } = await import('../lib/auth/store.ts');

test('missing sessions stay unauthenticated rather than becoming database failures', async () => {
  let indexCalls = 0;
  globalThis.__authStoreDb = { collection: () => ({
    createIndex: async () => { indexCalls++; },
    findOne: async () => null,
  }) };
  assert.equal(await mongoAuthStore.getSession('missing'), null);
  assert.equal(indexCalls, 2);
});
test('login reservations retain the existing atomic global bucket contract', async () => {
  const expiry = new Date('2026-11-10T17:00:00Z');
  let captured;
  globalThis.__authStoreDb = { collection: () => ({
    createIndex: async () => {},
    findOneAndUpdate: async (...args) => { captured = args; return { count: 11 }; },
  }) };
  assert.equal(await mongoAuthStore.consumeAttempt(100, expiry), 11);
  assert.equal(captured[0]._id, 'admin:100');
  assert.equal(captured[1].$inc.count, 1);
  assert.equal(captured[1].$setOnInsert.expiresAt, expiry);
  assert.equal(captured[2].upsert, true);
});
test('unavailable storage and index failures still fail closed', async () => {
  globalThis.__authStoreDb = null;
  await assert.rejects(() => mongoAuthStore.getSession('token'), /unavailable/);
  globalThis.__authStoreDb = { collection: () => ({ createIndex: async () => { throw Error('index denied'); } }) };
  await assert.rejects(() => mongoAuthStore.consumeAttempt(100, new Date()), /index denied/);
});
