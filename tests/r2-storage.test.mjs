import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier==='server-only')return {url:'data:text/javascript,export {};',shortCircuit:true};return next(specifier,context);}});
const {r2Storage}=await import('../lib/media/r2.ts');
const env={R2_ACCOUNT_ID:'a'.repeat(32),R2_BUCKET_NAME:'portfolio-media',R2_ACCESS_KEY_ID:'synthetic-key',R2_SECRET_ACCESS_KEY:'synthetic-secret',R2_PUBLIC_URL:'https://media.example.com'};

test('R2 setup is optional and invalid config cannot redirect signed requests',()=>{
  assert.equal(r2Storage({}),null);
  for(const changes of [{R2_ACCOUNT_ID:'evil.example/'},{R2_BUCKET_NAME:'../other'},{R2_PUBLIC_URL:'http://media.example.com'},{R2_PUBLIC_URL:'https://user:pass@example.com'}])assert.equal(r2Storage({...env,...changes}),null);
});
test('R2 PUT is signed server-side; downloads use safe attachment headers and public URLs have no keys',async()=>{
  const original=globalThis.fetch;const calls=[];
  globalThis.fetch=async request=>{calls.push(request);return new Response(null,{status:200});};
  try {
    const storage=r2Storage(env);const key='blog/2026/11/id.pdf';
    await storage.put(key,new Uint8Array([1,2,3]),{contentType:'application/pdf',attachmentName:'tài liệu.pdf'});
    const request=calls[0];assert.equal(request.method,'PUT');assert.equal(new URL(request.url).host,`${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    assert.match(request.headers.get('authorization'),/^AWS4-HMAC-SHA256 /);
    assert.equal(request.headers.get('content-type'),'application/pdf');assert.match(request.headers.get('content-disposition'),/^attachment; /);
    assert.ok(request.headers.get('content-disposition').includes('filename*=UTF-8'));
    assert.equal(storage.publicUrl(key),'https://media.example.com/'+key);
    assert.ok(!storage.publicUrl(key).includes('synthetic'));
    assert.deepEqual([...new Uint8Array(await request.arrayBuffer())],[1,2,3]);
  }finally{globalThis.fetch=original;}
});
