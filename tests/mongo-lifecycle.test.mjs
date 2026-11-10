import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'mongodb') return { url: 'data:text/javascript,export class MongoClient { constructor(...args) { return globalThis.__createMongoTestClient(...args); } }', shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { withDb } = await import('../lib/db/mongo.ts');
process.env.MONGODB_URI = 'mongodb://synthetic.invalid';
process.env.MONGODB_DB = 'synthetic';

test('each operation owns a fresh client and closes it after use', async () => {
  const clients = [];
  globalThis.__createMongoTestClient = () => {
    const client = { closed: false, async connect() {}, db: () => ({ id: clients.length }), async close() { this.closed = true; } };
    clients.push(client); return client;
  };
  const first = await withDb(async db => db.id);
  const second = await withDb(async db => db.id);
  assert.equal(first, 1); assert.equal(second, 2);
  assert.equal(clients.length, 2);
  assert.ok(clients.every(c => c.closed));
});
test('overlapping operations cannot share a connection owned by another request', async () => {
  let created = 0, closed = 0;
  globalThis.__createMongoTestClient = () => {
    const id = ++created;
    return { async connect() {}, db: () => ({ id }), async close() { closed++; } };
  };
  const result = await Promise.all([withDb(async db => db.id), withDb(async db => db.id)]);
  assert.deepEqual(result, [1, 2]); assert.equal(closed, 2);
});
test('query errors and failed connections still close the client and do not poison later operations', async () => {
  let closed = 0;
  globalThis.__createMongoTestClient = () => ({ async connect() {}, db: () => ({}), async close() { closed++; } });
  await assert.rejects(() => withDb(async () => { throw Error('query failed'); }), /query failed/);
  globalThis.__createMongoTestClient = () => ({ async connect() { throw Error('connect failed'); }, db: () => ({}), async close() { closed++; } });
  await assert.rejects(() => withDb(async () => true), /connect failed/);
  assert.equal(closed, 2);
});
test('missing database configuration does not open a client or execute the callback', async () => {
  const previous = process.env.MONGODB_URI; delete process.env.MONGODB_URI;
  try { assert.equal(await withDb(async () => { throw Error('must not run'); }), null); }
  finally { process.env.MONGODB_URI = previous; }
});
