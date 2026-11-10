import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === '@/lib/db/mongo') return { url: 'data:text/javascript,export async function withDb(operation){const db=globalThis.__postTestDb;return db?operation(db):null;}', shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { getPosts, getPostBySlug, savePost } = await import('../lib/content/posts.ts');
const docs = [
  { slug: 'published', title: 'Public', content: 'Read me', isPublished: true },
  { slug: 'draft', title: 'Draft', content: 'Private', isPublished: false },
  { slug: 'legacy', title: 'Legacy', content: 'Existing public post' },
];
let writes = 0;
globalThis.__postTestDb = { collection: () => ({
  find: query => ({ sort: () => ({ toArray: async () => query.isPublished ? docs.filter(p => p.isPublished !== false) : docs }) }),
  updateOne: async () => { writes++; },
}) };
test('public index/direct-slug reads exclude drafts; authenticated reader can request all posts', async () => {
  assert.deepEqual((await getPosts()).map(p => p.slug), ['published', 'legacy']);
  assert.equal(await getPostBySlug('draft'), null);
  assert.equal((await getPosts({ includeDrafts: true })).length, 3);
  assert.equal(writes, 0, 'reading never seeds or writes to the database');
});
test('missing database cannot read admin drafts or claim a successful save', async () => {
  globalThis.__postTestDb = null;
  await assert.rejects(() => getPosts(), /Article storage is temporarily unavailable/);
  await assert.rejects(() => getPostBySlug('orca-cai-dat-orchestration-tiet-kiem-quota'), /Article storage is temporarily unavailable/);
  await assert.rejects(() => getPosts({ includeDrafts: true }));
  assert.equal((await savePost(docs[1])).success, false);
  assert.equal(writes, 0);
});
test('a truly empty database stays empty without inserting or substituting examples', async () => {
  globalThis.__postTestDb = { collection: () => ({
    find: () => ({ sort: () => ({ toArray: async () => [] }) }),
    countDocuments: async () => 0,
  }) };
  assert.deepEqual(await getPosts(), []);
  assert.equal((await getPosts({ includeDrafts: true })).length, 0);
  assert.equal(writes, 0);
});
test('an all-draft database must not expose either drafts or unrelated bundled articles', async () => {
  globalThis.__postTestDb = { collection: () => ({
    find: () => ({ sort: () => ({ toArray: async () => [] }) }),
    countDocuments: async () => 1,
  }) };
  assert.deepEqual(await getPosts(), []);
});
test('failed storage cannot masquerade as sample posts or a missing article', async () => {
  globalThis.__postTestDb = { collection: () => ({ find: () => ({ sort: () => ({ toArray: async () => { throw Error('private-driver-message'); } }) }) }) };
  await assert.rejects(() => getPosts(), error => error.message === 'Article storage is temporarily unavailable.');
  await assert.rejects(() => getPostBySlug('orca-cai-dat-orchestration-tiet-kiem-quota'), /Article storage is temporarily unavailable/);
});
