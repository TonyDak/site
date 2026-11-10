import test from 'node:test';
import assert from 'node:assert/strict';
import { createUploadHandler } from '../lib/media/upload-http.ts';
import { isAllowedMutation } from '../lib/auth/core.ts';
import { filePolicy } from '../lib/media/policy.ts';

const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC1kAAAAASUVORK5CYII=','base64'));
function fixture() {
  const writes = [];
  const gate = {
    mutationError(request, type) { return isAllowedMutation(request, { origin:'https://www.ducnh.tech' }, type) ? null : Response.json({}, {status:403}); },
    async authorize(request) { return request.headers.get('cookie') === 'test-session=valid' ? null : Response.json({}, {status:401}); },
  };
  const storage = { async put(key, bytes, metadata) { writes.push({key, bytes, metadata}); }, publicUrl: key => `https://media.example.com/${key}` };
  const post = createUploadHandler({ gate, storage });
  const request = (bytes=png, headers={}) => new Request('https://www.ducnh.tech/api/admin/media', {
    method:'POST', headers:{Origin:'https://www.ducnh.tech',Cookie:'test-session=valid','Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent('ảnh.png'),'X-File-Type':'image/png',...headers}, body:bytes,
  });
  return {post,request,writes,storage,gate};
}
test('only authenticated same-origin uploads reach storage', async () => {
  const f=fixture();
  for (const headers of [{Cookie:''},{Origin:'https://evil.example'},{Origin:''},{'Sec-Fetch-Site':'cross-site'},{'Content-Type':'text/plain'}]) {
    const response=await f.post(f.request(png,headers));
    assert.ok([401,403].includes(response.status));
  }
  assert.equal(f.writes.length,0);
});
test('prototype-property extensions cannot bypass the allowlist or byte limit', async () => {
  const f=fixture();
  for(const extension of ['constructor','__proto__','toString']) {
    assert.equal(filePolicy(`x.${extension}`),null);
    assert.equal((await f.post(f.request(png,{'X-File-Name':`x.${extension}`,'X-File-Type':''}))).status,400);
  }
  assert.equal(f.writes.length,0);
});
test('valid images receive random immutable keys and sanitized metadata', async () => {
  const f=fixture();const response=await f.post(f.request());assert.equal(response.status,201);
  const {asset}=await response.json();assert.equal(asset.kind,'image');assert.equal(asset.name,'ảnh.png');
  assert.match(asset.key,/^blog\/\d{4}\/\d{2}\/[a-f0-9-]+\.png$/);assert.equal(asset.url,`https://media.example.com/${asset.key}`);
  assert.equal(f.writes[0].metadata.contentType,'image/png');assert.equal(f.writes[0].bytes.byteLength,png.length);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('unsupported, spoofed and empty uploads cannot reach storage', async () => {
  const f=fixture();
  for(const [bytes,headers] of [[new TextEncoder().encode('<svg onload=alert(1)>'),{'X-File-Name':'x.svg','X-File-Type':'image/svg+xml'}],[png,{'X-File-Name':'x.pdf','X-File-Type':'application/pdf'}],[new TextEncoder().encode('<html>'),{}],[new Uint8Array(),{}],[png,{'X-File-Name':'%ZZ'}],[png,{'X-File-Name':'..%2Fx.png'}]]) {
    assert.equal((await f.post(f.request(bytes,headers))).status,400);
  }
  assert.equal(f.writes.length,0);
});
test('truncated containers and header-only payloads cannot report success', async () => {
  const f=fixture();
  for(const [bytes,name,type] of [[png.slice(0,8),'x.png','image/png'],[png.slice(0,-5),'x.png','image/png'],[new TextEncoder().encode('%PDF-1.7 header'),'x.pdf','application/pdf'],[Uint8Array.from([80,75,3,4,0,0,0,0]),'x.zip','application/zip'],[Uint8Array.from([0,0,0,24,102,116,121,112,105,115,111,109,0,0,0,0]),'x.mp4','video/mp4']]) {
    assert.equal((await f.post(f.request(bytes,{'X-File-Name':name,'X-File-Type':type}))).status,400);
  }
  assert.equal(f.writes.length,0);
});
test('actual streamed size is bounded even without an honest Content-Length', async () => {
  const f=fixture(); const oversized=new Uint8Array(10*1024*1024+1);oversized.set(png);
  assert.equal((await f.post(f.request(oversized,{'Content-Length':'1'}))).status,413);
  assert.equal(f.writes.length,0);
});
test('PDF and ZIP downloads carry attachment metadata; MP4 containers use video metadata', async () => {
  const f=fixture();
  const mp4=Uint8Array.from([0,0,0,24,...Buffer.from('ftypisom'),0,0,0,0,...Buffer.from('isomiso2'),0,0,0,8,...Buffer.from('moov'),0,0,0,9,...Buffer.from('mdat'),0]);
  const zip=Uint8Array.from([80,75,5,6,...new Array(18).fill(0)]);
  for(const [bytes,name,type,kind] of [[new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),'guide.pdf','application/pdf','file'],[zip,'code.zip','application/zip','file'],[mp4,'demo.mp4','video/mp4','video']]) {
    const r=await f.post(f.request(bytes,{'X-File-Name':name,'X-File-Type':type}));assert.equal(r.status,201);assert.equal((await r.json()).asset.kind,kind);
  }
  assert.equal(f.writes[0].metadata.attachmentName,'guide.pdf');assert.equal(f.writes[1].metadata.attachmentName,'code.zip');assert.equal(f.writes[2].metadata.attachmentName,undefined);
});
test('missing storage and backend errors fail without exposing secrets', async () => {
  const f=fixture();const missing=createUploadHandler({gate:f.gate,storage:null});assert.equal((await missing(f.request())).status,503);
  f.storage.put=async()=>{throw Error('secret-access-key');};const r=await f.post(f.request());assert.equal(r.status,503);assert.ok(!(await r.text()).includes('secret-access-key'));
});
