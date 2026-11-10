import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === '@/lib/db/mongo') return { url: 'data:text/javascript,export async function getDb(){return globalThis.__postTestDb;}', shortCircuit: true };
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
  await assert.rejects(() => getPosts({ includeDrafts: true }));
  assert.equal((await savePost(docs[1])).success, false);
  assert.equal(writes, 0);
});
test('a truly empty database preserves bundled public articles without seeding storage', async () => {
  globalThis.__postTestDb = { collection: () => ({
    find: () => ({ sort: () => ({ toArray: async () => [] }) }),
    countDocuments: async () => 0,
  }) };
  assert.ok((await getPosts()).length > 0);
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
