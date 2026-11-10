import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService, hashPassword, isAllowedMutation } from '../lib/auth/core.ts';
import { createAuthHttp } from '../lib/auth/http.ts';
import { createPostHandlers } from '../lib/auth/posts-http.ts';

const password = 'Synthetic-valid-password-928!';
const config = { username: 'owner', passwordHash: await hashPassword(password), origin: 'https://www.ducnh.tech' };
function fixture() {
  const sessions = new Map();
  let attempts = 0, reads = 0, writes = 0;
  const store = {
    consumeAttempt: async () => ++attempts,
    createSession: async session => { sessions.set(session.id, session); },
    getSession: async id => sessions.get(id) ?? null,
    deleteSession: async id => { sessions.delete(id); },
  };
  const service = createAuthService({ config, store });
  const auth = createAuthHttp({ service, config, production: true, allowedMutation: isAllowedMutation });
  const draft = { slug: 'private-draft', title: 'Draft', content: 'Private draft', excerpt: '', publishedAt: '2026-01-01', tags: [], readTime: '1 min read', isPublished: false };
  const posts = createPostHandlers({ gate: auth, getPosts: async () => { reads++; return [draft]; }, savePost: async post => { writes++; Object.assign(draft, post); return { success: true }; } });
  const request = (method = 'GET', body, cookie, extra = {}) => new Request(config.origin + '/api/admin/posts', {
    method, headers: { origin: config.origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...extra },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
  async function signIn() {
    const response = await auth.login(request('POST', { username: 'owner', password }));
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';')[0];
  }
  return { auth, posts, request, signIn, draft, service, sessions, counts: () => ({ reads, writes }) };
}

test('unauthenticated, forged-cookie and legacy-secret callers cannot read or write admin posts', async () => {
  const f = fixture();
  for (const cookie of [undefined, '__Host-portfolio_admin=' + 'A'.repeat(43)]) {
    assert.equal((await f.posts.GET(f.request('GET', undefined, cookie))).status, 401);
    const result = await f.posts.POST(f.request('POST', { title: 'Attack', content: 'Attack', secret: 'admin' }, cookie));
    assert.equal(result.status, 401);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
  assert.deepEqual(f.counts(), { reads: 0, writes: 0 });
});
test('successful login uses a secure HttpOnly cookie, survives reload, rotates, and logout revokes replay', async () => {
  const f = fixture();
  const response = await f.auth.login(f.request('POST', { username: 'owner', password }));
  const cookie = response.headers.get('set-cookie');
  for (const flag of ['__Host-portfolio_admin=', 'HttpOnly', 'SameSite=Strict', 'Secure', 'Path=/', 'Max-Age=28800']) assert.ok(cookie.includes(flag));
  assert.equal((await response.json()).token, undefined);
  const first = cookie.split(';')[0];
  assert.equal((await f.auth.session(f.request('GET', undefined, first))).status, 200);
  const next = await f.auth.login(f.request('POST', { username: 'owner', password }, first));
  assert.equal(next.status, 200);
  assert.equal((await f.auth.session(f.request('GET', undefined, first))).status, 401);
  const second = next.headers.get('set-cookie').split(';')[0];
  assert.equal((await f.auth.logout(f.request('DELETE', {}, second))).status, 200);
  assert.equal((await f.posts.GET(f.request('GET', undefined, second))).status, 401);
});
test('login, logout and saves reject cross-origin mutation, absent Origin and text/plain', async () => {
  const f = fixture();
  const cookie = await f.signIn();
  for (const headers of [{ origin: 'https://evil.test' }, { origin: '' }, { 'content-type': 'text/plain' }, { 'sec-fetch-site': 'cross-site' }]) {
    assert.equal((await f.auth.login(f.request('POST', { username: 'owner', password }, cookie, headers))).status, 403);
    assert.equal((await f.auth.logout(f.request('DELETE', {}, cookie, headers))).status, 403);
    assert.equal((await f.posts.POST(f.request('POST', { title: 'Attack', content: 'Attack' }, cookie, headers))).status, 403);
  }
  assert.deepEqual(f.counts(), { reads: 0, writes: 0 });
});
test('malformed, oversized and operator-shaped inputs cannot reach persistence', async () => {
  const f = fixture();
  assert.equal((await f.auth.login(f.request('POST', '{broken'))).status, 400);
  assert.equal((await f.auth.login(f.request('POST', { username: { $ne: null }, password }))).status, 400);
  assert.equal((await f.auth.login(f.request('POST', JSON.stringify({ padding: 'x'.repeat(5000) })))).status, 400);
  const cookie = await f.signIn();
  for (const body of ['{broken', { title: { $ne: null }, content: 'a' }, { title: 'a', content: 'b', slug: { $gt: '' } }, { title: 'a', content: 'x'.repeat(140000) }, { title: 'a', content: 'b', isPublished: 'false' }]) {
    assert.equal((await f.posts.POST(f.request('POST', body, cookie))).status, 400);
  }
  assert.equal(f.counts().writes, 0);
});
test('authenticated reads include drafts; ordinary edits preserve draft status and date', async () => {
  const f = fixture();
  const cookie = await f.signIn();
  const read = await f.posts.GET(f.request('GET', undefined, cookie));
  assert.equal((await read.json()).posts[0].isPublished, false);
  const saved = await f.posts.POST(f.request('POST', { slug: f.draft.slug, title: 'Edited draft', content: 'Updated content' }, cookie));
  assert.equal(saved.status, 200);
  const result = (await saved.json()).post;
  assert.equal(result.isPublished, false);
  assert.equal(result.publishedAt, '2026-01-01');
});

test('covers survive save and older-client edits; unsafe cover values are rejected', async () => {
  const f=fixture(); const cookie=await f.signIn();
  const fields={title:'A cover',slug:f.draft.slug,content:'Body',coverImage:'https://media.example.com/cover.png',coverAlt:'Cover description'};
  let response=await f.posts.POST(f.request('POST',fields,cookie)); assert.equal(response.status,200);
  assert.equal((await response.json()).post.coverImage,fields.coverImage);
  response=await f.posts.POST(f.request('POST',{title:'Older client',slug:f.draft.slug,content:'Body'},cookie));
  assert.equal((await response.json()).post.coverAlt,'Cover description');assert.equal(f.draft.coverImage,fields.coverImage);
  for(const coverImage of ['javascript:alert(1)','data:image/svg+xml,bad',{},'https://user:pass@example.com/a.png']) assert.equal((await f.posts.POST(f.request('POST',{...fields,coverImage},cookie))).status,400);
  response=await f.posts.POST(f.request('POST',{...fields,coverImage:'',coverAlt:''},cookie));assert.equal(response.status,200);assert.equal(f.draft.coverImage,'');
});
test('session storage outage and duplicate cookies fail closed', async () => {
  const f = fixture();
  const cookie = await f.signIn();
  assert.equal((await f.posts.GET(f.request('GET', undefined, cookie + '; ' + cookie))).status, 401);
  const failed = createAuthHttp({ config, production: true, allowedMutation: isAllowedMutation,
    service: { ...f.service, authorize: async () => { throw Error('private database error'); }, logout: async () => { throw Error('private database error'); } } });
  const response = await failed.session(f.request('GET', undefined, cookie));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes('private database error'), false);
  assert.equal((await failed.logout(f.request('DELETE', {}, cookie))).status, 503);
});
test('missing authentication configuration disables every admin entry point', async () => {
  const f = fixture();
  const auth = createAuthHttp({ config: null, production: true, allowedMutation: isAllowedMutation, service: f.service });
  const posts = createPostHandlers({ gate: auth, getPosts: async () => { throw Error('must not read'); }, savePost: async () => { throw Error('must not write'); } });
  assert.equal((await auth.login(f.request('POST', { username: 'owner', password }))).status, 503);
  assert.equal((await auth.session(f.request())).status, 503);
  assert.equal((await auth.logout(f.request('DELETE', {}))).status, 503);
  assert.equal((await posts.GET(f.request())).status, 503);
  assert.equal((await posts.POST(f.request('POST', { secret: 'admin', title: 'x', content: 'x' }))).status, 503);
});
